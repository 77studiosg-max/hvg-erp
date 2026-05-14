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

export async function createQuote(formData) {
  const customerId = formData.get('customerId');
  const status = formData.get('status') || 'Draft';
  const validUntil = formData.get('validUntil') ? new Date(formData.get('validUntil')) : null;
  const vatRate = parseFloat(formData.get('vatRate') || '20');
  const discount = parseFloat(formData.get('discount') || '0');
  
  const itemsJson = formData.get('itemsJson');
  const items = JSON.parse(itemsJson || '[]');

  const count = await prisma.quote.count();
  const quoteNumber = `QT-${String(count + 1).padStart(4, '0')}`;

  const subtotal = calculateSubtotal(items);
  const discountAmount = subtotal * (discount / 100);
  const totalAfterDiscount = subtotal - discountAmount;
  const totalAmount = totalAfterDiscount * (1 + (vatRate / 100));

  const quote = await prisma.quote.create({
    data: {
      id: crypto.randomUUID(),
      quoteNumber,
      customerId,
      status,
      totalAmount,
      vatRate,
      discount,
      validUntil
    }
  });
  const quoteId = quote.id;

  for (const item of items) {
    const quoteItemId = crypto.randomUUID();
    await prisma.quoteItem.create({
      data: {
        id: quoteItemId,
        quoteId,
        productId: item.productId,
        customDescription: item.customDescription || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice || 0,
        margin: item.margin || 0
      }
    });

    if (item.bomItems && item.bomItems.length > 0) {
      for (const bom of item.bomItems) {
        if (!bom.productId) continue;
        await prisma.quoteItemBOM.create({
          data: {
            id: crypto.randomUUID(),
            quoteItemId,
            productId: bom.productId,
            quantity: bom.quantity,
            unitPrice: bom.unitPrice || 0,
            margin: bom.margin || 0
          }
        });
      }
    }
  }

  revalidatePath('/quotes');
  redirect(`/quotes/${quoteId}`);
}

export async function updateQuote(id, formData) {
  const customerId = formData.get('customerId');
  const status = formData.get('status');
  const validUntil = formData.get('validUntil') ? new Date(formData.get('validUntil')) : null;
  const vatRate = parseFloat(formData.get('vatRate') || '20');
  const discount = parseFloat(formData.get('discount') || '0');
  
  const itemsJson = formData.get('itemsJson');
  const items = JSON.parse(itemsJson || '[]');

  const subtotal = calculateSubtotal(items);
  const discountAmount = subtotal * (discount / 100);
  const totalAfterDiscount = subtotal - discountAmount;
  const totalAmount = totalAfterDiscount * (1 + (vatRate / 100));

  await prisma.quote.update({
    where: { id },
    data: {
      customerId,
      status,
      totalAmount,
      vatRate,
      discount,
      validUntil
    }
  });

  // Clean up old items and their BOMs
  await prisma.quoteItem.deleteMany({ where: { quoteId: id } });
  
  for (const item of items) {
    const quoteItemId = crypto.randomUUID();
    await prisma.quoteItem.create({
      data: {
        id: quoteItemId,
        quoteId: id,
        productId: item.productId,
        customDescription: item.customDescription || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice || 0,
        margin: item.margin || 0
      }
    });

    if (item.bomItems && item.bomItems.length > 0) {
      for (const bom of item.bomItems) {
        if (!bom.productId) continue;
        await prisma.quoteItemBOM.create({
          data: {
            id: crypto.randomUUID(),
            quoteItemId,
            productId: bom.productId,
            quantity: bom.quantity,
            unitPrice: bom.unitPrice || 0,
            margin: bom.margin || 0
          }
        });
      }
    }
  }

  revalidatePath('/quotes');
  revalidatePath(`/quotes/${id}`);
  redirect('/quotes');
}

export async function convertToSalesOrder(quoteId) {
  const quote = await prisma.quote.findUnique({ where: { id: quoteId } });
  if (!quote) throw new Error('Quote not found');

  const items = await prisma.quoteItem.findMany({ 
    where: { quoteId },
    include: { bomItems: true }
  });

  const count = await prisma.salesOrder.count();
  const orderNumber = `SO-${String(count + 1).padStart(4, '0')}`;

  const salesOrder = await prisma.salesOrder.create({
    data: {
      id: crypto.randomUUID(),
      orderNumber,
      customerId: quote.customerId,
      status: 'Pending',
      totalAmount: quote.totalAmount,
      vatRate: quote.vatRate,
      discount: quote.discount
    }
  });
  const salesOrderId = salesOrder.id;

  for (const item of items) {
    const boms = item.bomItems || [];
    
    // For SO, unitPrice is the final sales price
    let salesPrice = 0;
    if (boms.length > 0) {
      salesPrice = boms.reduce((sum, b) => {
        const bMarg = b.margin || 0;
        const bCost = b.unitPrice || 0;
        const sP = bMarg >= 100 ? bCost : bCost / (1 - bMarg / 100);
        return sum + (b.quantity * sP);
      }, 0);
    } else {
      const cost = item.unitPrice;
      const itemMargin = item.margin || 0;
      salesPrice = itemMargin >= 100 ? cost : cost / (1 - itemMargin / 100);
    }

    const salesOrderItem = await prisma.salesOrderItem.create({
      data: {
        id: crypto.randomUUID(),
        salesOrderId,
        productId: item.productId,
        customDescription: item.customDescription || null,
        quantity: item.quantity,
        unitPrice: salesPrice
      }
    });
    const salesOrderItemId = salesOrderItem.id;

    for (const bom of boms) {
      await prisma.salesOrderItemBOM.create({
        data: {
          id: crypto.randomUUID(),
          salesOrderItemId,
          productId: bom.productId,
          quantity: bom.quantity,
          unitPrice: bom.unitPrice,
          margin: bom.margin
        }
      });
    }
  }

  await prisma.quote.update({
    where: { id: quoteId },
    data: { status: 'Converted' }
  });

  revalidatePath('/quotes');
  revalidatePath('/sales-orders');
  redirect('/sales-orders');
}

export async function deleteQuote(id) {
  await prisma.quote.delete({ where: { id } });
  revalidatePath('/quotes');
  redirect('/quotes');
}
