'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function dispatchSalesOrder(salesOrderId, itemsToDispatch) {
  // itemsToDispatch is an array of { id: string (SalesOrderItem id), productId: string, quantityToDispatch: number }
  
  // 1. Filter out items with 0 quantity
  const validItems = itemsToDispatch.filter(item => item.quantityToDispatch > 0);
  if (validItems.length === 0) return { success: false, error: 'No items to dispatch' };

  // 2. Generate Delivery Note Number
  const count = await prisma.deliveryNote.count();
  const noteNumber = `DN-${String(count + 1).padStart(4, '0')}`;
  
  const deliveryNote = await prisma.deliveryNote.create({
    data: {
      id: crypto.randomUUID(),
      noteNumber,
      salesOrderId,
      date: new Date()
    }
  });
  const deliveryNoteId = deliveryNote.id;

  // 4. Process each dispatched item
  for (const item of validItems) {
    // Add to DeliveryNoteItem
    await prisma.deliveryNoteItem.create({
      data: {
        id: crypto.randomUUID(),
        deliveryNoteId,
        productId: item.productId,
        customDescription: item.customDescription || null,
        quantity: item.quantityToDispatch
      }
    });

    // Increment deliveredQuantity on SalesOrderItem
    await prisma.salesOrderItem.update({
      where: { id: item.id },
      data: {
        deliveredQuantity: { increment: item.quantityToDispatch }
      }
    });

    // Decrement stockLevel on Product
    const boms = await prisma.salesOrderItemBOM.findMany({
      where: { salesOrderItemId: item.id }
    });
    
    if (boms && boms.length > 0) {
      // It's a dynamic BOM assembly. Decrement stock of all components.
      for (const bom of boms) {
        const componentQtyToDispatch = item.quantityToDispatch * bom.quantity;
        await prisma.product.update({
          where: { id: bom.productId },
          data: {
            stockLevel: { decrement: componentQtyToDispatch }
          }
        });
      }
    } else {
      // Normal product
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stockLevel: { decrement: item.quantityToDispatch }
        }
      });
    }
  }

  // 5. Update SO status based on delivery progress
  const allItems = await prisma.salesOrderItem.findMany({
    where: { salesOrderId },
    select: { quantity: true, deliveredQuantity: true }
  });
  
  const totalOrdered = allItems.reduce((acc, i) => acc + (i.quantity || 0), 0);
  const totalDelivered = allItems.reduce((acc, i) => acc + (i.deliveredQuantity || 0), 0);
  
  const isFullyDelivered = totalDelivered >= totalOrdered && totalOrdered > 0;
  const isPartiallyDelivered = totalDelivered > 0 && totalDelivered < totalOrdered;
  
  if (isFullyDelivered) {
    await prisma.salesOrder.update({
      where: { id: salesOrderId },
      data: { status: 'Delivered' }
    });
  } else if (isPartiallyDelivered) {
    // Only update to Partially Shipped if not already Delivered
    const currentSO = await prisma.salesOrder.findUnique({
      where: { id: salesOrderId },
      select: { status: true }
    });
    
    if (currentSO && currentSO.status !== 'Delivered') {
      await prisma.salesOrder.update({
        where: { id: salesOrderId },
        data: { status: 'Partially Shipped' }
      });
    }
  }

  revalidatePath('/sales-orders');
  revalidatePath(`/sales-orders/${salesOrderId}`);
  revalidatePath('/inventory');

  return { success: true, deliveryNoteId };
}
