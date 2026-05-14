'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function calculateSubtotal(items) {
  return items.reduce((sum, item) => {
    if (item.bomItems && item.bomItems.length > 0) {
      const bomSalesSum = item.bomItems.reduce((bSum, b) => {
        const cost = b.unitPrice || 0;
        const marg = b.margin || 0;
        const sPrice = marg >= 100 ? cost : cost / (1 - marg / 100);
        return bSum + (b.quantity * sPrice);
      }, 0);
      return sum + (item.quantity * bomSalesSum);
    }
    const cost = item.unitPrice || 0;
    const itemMargin = item.margin || 0;
    const salesPrice = itemMargin >= 100 ? cost : cost / (1 - itemMargin / 100);
    return sum + (item.quantity * salesPrice);
  }, 0);
}

export async function createSalesOrder(formData) {
  const customerId = formData.get('customerId');
  const status = formData.get('status') || 'Pending';
  const itemsJson = formData.get('itemsJson');
  const items = JSON.parse(itemsJson || '[]');

  const count = await prisma.salesOrder.count();
  const orderNumber = `SO-${String(count + 1).padStart(4, '0')}`;

  const subtotal = calculateSubtotal(items);
  const discount = parseFloat(formData.get('discount') || '0');
  const vatRate = parseFloat(formData.get('vatRate') || '20');
  const discountAmount = subtotal * (discount / 100);
  const totalAfterDiscount = subtotal - discountAmount;
  const totalAmount = totalAfterDiscount * (1 + (vatRate / 100));

  const order = await prisma.salesOrder.create({
    data: {
      id: crypto.randomUUID(),
      orderNumber,
      customerId,
      status,
      totalAmount,
      vatRate,
      discount
    }
  });
  const orderId = order.id;

  for (const item of items) {
    let salesPrice = 0;
    if (item.bomItems && item.bomItems.length > 0) {
      salesPrice = item.bomItems.reduce((bSum, b) => {
        const cost = b.unitPrice || 0;
        const marg = b.margin || 0;
        const sP = marg >= 100 ? cost : cost / (1 - marg / 100);
        return bSum + (b.quantity * sP);
      }, 0);
    } else {
      const cost = item.unitPrice || 0;
      const itemMargin = item.margin || 0;
      salesPrice = itemMargin >= 100 ? cost : cost / (1 - itemMargin / 100);
    }

    const salesOrderItem = await prisma.salesOrderItem.create({
      data: {
        id: crypto.randomUUID(),
        salesOrderId: orderId,
        productId: item.productId,
        customDescription: item.customDescription || null,
        quantity: item.quantity,
        unitPrice: salesPrice
      }
    });
    const salesOrderItemId = salesOrderItem.id;

    if (item.bomItems && item.bomItems.length > 0) {
      for (const bom of item.bomItems) {
        if (!bom.productId) continue;
        await prisma.salesOrderItemBOM.create({
          data: {
            id: crypto.randomUUID(),
            salesOrderItemId,
            productId: bom.productId,
            quantity: bom.quantity,
            unitPrice: bom.unitPrice || 0,
            margin: bom.margin || 0
          }
        });
      }
    }
  }

  revalidatePath('/sales-orders');
  redirect(`/sales-orders/${orderId}`);
}

export async function updateSalesOrder(id, formData) {
  const customerId = formData.get('customerId');
  const status = formData.get('status');
  const itemsJson = formData.get('itemsJson');
  const items = JSON.parse(itemsJson || '[]');

  const subtotal = calculateSubtotal(items);
  const discount = parseFloat(formData.get('discount') || '0');
  const vatRate = parseFloat(formData.get('vatRate') || '20');
  
  const discountAmount = subtotal * (discount / 100);
  const totalAfterDiscount = subtotal - discountAmount;
  const totalAmount = totalAfterDiscount * (1 + (vatRate / 100));

  await prisma.salesOrder.update({
    where: { id },
    data: {
      customerId,
      status,
      totalAmount,
      vatRate,
      discount
    }
  });

  // Clean up old items to replace them
  await prisma.salesOrderItem.deleteMany({ where: { salesOrderId: id } });
  
  for (const item of items) {
    let salesPrice = 0;
    if (item.bomItems && item.bomItems.length > 0) {
      salesPrice = item.bomItems.reduce((bSum, b) => {
        const cost = b.unitPrice || 0;
        const marg = b.margin || 0;
        const sP = marg >= 100 ? cost : cost / (1 - marg / 100);
        return bSum + (b.quantity * sP);
      }, 0);
    } else {
      const cost = item.unitPrice || 0;
      const itemMargin = item.margin || 0;
      salesPrice = itemMargin >= 100 ? cost : cost / (1 - itemMargin / 100);
    }

    const delivered = item.deliveredQuantity || 0;
    const invoiced = item.invoicedQuantity || 0;

    const salesOrderItem = await prisma.salesOrderItem.create({
      data: {
        id: crypto.randomUUID(),
        salesOrderId: id,
        productId: item.productId,
        customDescription: item.customDescription || null,
        quantity: item.quantity,
        deliveredQuantity: delivered,
        invoicedQuantity: invoiced,
        unitPrice: salesPrice
      }
    });
    const salesOrderItemId = salesOrderItem.id;

    if (item.bomItems && item.bomItems.length > 0) {
      for (const bom of item.bomItems) {
        if (!bom.productId) continue;
        await prisma.salesOrderItemBOM.create({
          data: {
            id: crypto.randomUUID(),
            salesOrderItemId,
            productId: bom.productId,
            quantity: bom.quantity,
            unitPrice: bom.unitPrice || 0,
            margin: bom.margin || 0
          }
        });
      }
    }
  }

  revalidatePath('/sales-orders');
  revalidatePath(`/sales-orders/${id}`);
}

export async function deleteSalesOrder(id) {
  await prisma.salesOrder.delete({ where: { id } });
  revalidatePath('/sales-orders');
  redirect('/sales-orders');
}
