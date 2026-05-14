'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createInvoiceFromSO(salesOrderId, itemsToInvoice) {
  // itemsToInvoice is an array of { id (SalesOrderItem id), productId, quantityToInvoice, unitPrice }
  
  const validItems = itemsToInvoice.filter(item => item.quantityToInvoice > 0);
  if (validItems.length === 0) return { success: false, error: 'No items to invoice' };

  // Fetch SalesOrder to get customerId, vatRate and discount
  const order = await prisma.salesOrder.findUnique({
    where: { id: salesOrderId },
    select: { customerId: true, vatRate: true, discount: true }
  });
  
  if (!order) return { success: false, error: 'Sales Order not found' };
  const { customerId, vatRate = 20, discount = 0 } = order;

  // Generate Invoice Number
  const count = await prisma.invoice.count();
  const invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}`;
  
  const invoiceId = crypto.randomUUID();

  // Calculate total amount using SO's discount and VAT rate
  let subtotal = 0;
  for (const item of validItems) {
    subtotal += item.quantityToInvoice * item.unitPrice;
  }
  const discountAmount = subtotal * (discount / 100);
  const totalAmount = (subtotal - discountAmount) * (1 + (vatRate / 100));

  // Set Due Date (30 days from now)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  if (isNaN(dueDate.getTime())) {
    // Fallback if Date calculation fails for some weird reason
    dueDate.setFullYear(new Date().getFullYear() + 1); 
  }

  // Insert Invoice
  await prisma.invoice.create({
    data: {
      id: invoiceId,
      invoiceNumber,
      customerId,
      salesOrderId,
      status: 'Unpaid',
      totalAmount,
      vatRate,
      discount,
      dueDate
    }
  });

  // Process items
  for (const item of validItems) {
    await prisma.invoiceItem.create({
      data: {
        id: crypto.randomUUID(),
        invoiceId,
        productId: item.productId,
        customDescription: item.customDescription || null,
        quantity: item.quantityToInvoice,
        unitPrice: item.unitPrice
      }
    });

    await prisma.salesOrderItem.update({
      where: { id: item.id },
      data: {
        invoicedQuantity: { increment: item.quantityToInvoice }
      }
    });
  }

  // Update SalesOrder status to Invoiced if fully invoiced
  const soItems = await prisma.salesOrderItem.findMany({
    where: { salesOrderId },
    select: { quantity: true, invoicedQuantity: true }
  });
  
  const fullyInvoiced = soItems.every(item => (item.invoicedQuantity || 0) >= item.quantity);

  if (fullyInvoiced) {
    await prisma.salesOrder.update({
      where: { id: salesOrderId },
      data: { status: 'Invoiced' }
    });
  }

  revalidatePath('/sales-orders');
  revalidatePath(`/sales-orders/${salesOrderId}`);
  revalidatePath('/invoices');

  return { success: true, invoiceId };
}
