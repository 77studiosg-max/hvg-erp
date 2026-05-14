'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPurchaseOrder(formData) {
  const vendorId = formData.get('vendorId');
  const status = formData.get('status') || 'Pending';
  const itemsJson = formData.get('itemsJson');
  const items = JSON.parse(itemsJson || '[]');

  // Auto-generate PO Number
  const count = await prisma.purchaseOrder.count();
  const poNumber = `PO-${String(count + 1).padStart(4, '0')}`;

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const po = await prisma.purchaseOrder.create({
    data: {
      id: crypto.randomUUID(),
      poNumber,
      vendorId,
      status,
      totalAmount
    }
  });
  const poId = po.id;

  for (const item of items) {
    await prisma.purchaseOrderItem.create({
      data: {
        id: crypto.randomUUID(),
        purchaseOrderId: poId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        receivedQuantity: item.receivedQuantity || 0
      }
    });
  }

  revalidatePath('/purchase-orders');
  redirect(`/purchase-orders/${poId}`);
}

export async function updatePurchaseOrder(id, formData) {
  const vendorId = formData.get('vendorId');
  const status = formData.get('status');
  const itemsJson = formData.get('itemsJson');
  const items = JSON.parse(itemsJson || '[]');

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  await prisma.purchaseOrder.update({
    where: { id },
    data: {
      vendorId,
      status,
      totalAmount
    }
  });

  await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } });
  
  for (const item of items) {
    await prisma.purchaseOrderItem.create({
      data: {
        id: crypto.randomUUID(),
        purchaseOrderId: id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        receivedQuantity: item.receivedQuantity || 0
      }
    });
  }

  revalidatePath('/purchase-orders');
  revalidatePath(`/purchase-orders/${id}`);
}

export async function deletePurchaseOrder(id) {
  await prisma.purchaseOrder.delete({ where: { id } });
  revalidatePath('/purchase-orders');
  redirect('/purchase-orders');
}

export async function createPOFromItems(vendorId, items) {
  // Auto-generate PO Number
  const count = await prisma.purchaseOrder.count();
  const poNumber = `PO-${String(count + 1).padStart(4, '0')}`;

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  
  const po = await prisma.purchaseOrder.create({
    data: {
      id: crypto.randomUUID(),
      poNumber,
      vendorId,
      status: 'Pending',
      totalAmount
    }
  });
  const poId = po.id;

  for (const item of items) {
    await prisma.purchaseOrderItem.create({
      data: {
        id: crypto.randomUUID(),
        purchaseOrderId: poId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        receivedQuantity: item.receivedQuantity || 0
      }
    });
  }

  revalidatePath('/purchase-orders');
  return { success: true, poId };
}

export async function receivePOItems(poId, receivedItems) {
  // receivedItems is an array of { id: string (PurchaseOrderItem id), productId: string, quantityToReceive: number }
  
  for (const item of receivedItems) {
    if (item.quantityToReceive > 0) {
      // 1. Update receivedQuantity on PO Item
      await prisma.purchaseOrderItem.update({
        where: { id: item.id },
        data: {
          receivedQuantity: { increment: item.quantityToReceive }
        }
      });
      
      // 2. Update stock level on Product
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stockLevel: { increment: item.quantityToReceive }
        }
      });
    }
  }

  // 3. Check PO status based on all items
  const items = await prisma.purchaseOrderItem.findMany({
    where: { purchaseOrderId: poId },
    select: { quantity: true, receivedQuantity: true }
  });
  
  let fullyReceived = true;
  let partiallyReceived = false;
  
  for (const item of items) {
    if (item.receivedQuantity > 0) partiallyReceived = true;
    if (item.receivedQuantity < item.quantity) fullyReceived = false;
  }
  
  let newStatus = 'Pending';
  if (fullyReceived) newStatus = 'Received';
  else if (partiallyReceived) newStatus = 'Partially Received';

  await prisma.purchaseOrder.update({
    where: { id: poId },
    data: { status: newStatus }
  });

  revalidatePath('/purchase-orders');
  revalidatePath(`/purchase-orders/${poId}`);
  revalidatePath('/inventory');
}
