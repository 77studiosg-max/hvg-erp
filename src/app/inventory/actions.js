'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProduct(formData) {
  const sku = formData.get('sku');
  const name = formData.get('name');
  const price = parseFloat(formData.get('price'));
  const unit = formData.get('unit') || 'pcs';
  const stockLevel = parseFloat(formData.get('stockLevel')) || 0;
  const categoryId = formData.get('categoryId');
  const isBOM = formData.get('isBOM') === 'true';
  const wll = formData.get('wll') || null;
  const mblValue = formData.get('mblValue') ? parseFloat(formData.get('mblValue')) : null;
  const mblUnit = formData.get('mblUnit') || null;

  await prisma.product.create({
    data: {
      id: crypto.randomUUID(),
      sku,
      name,
      price,
      unit,
      stockLevel,
      categoryId: categoryId === 'none' ? null : categoryId,
      isBOM,
      wll,
      mblValue,
      mblUnit
    }
  });

  revalidatePath('/inventory');
  redirect('/inventory');
}

export async function updateProduct(formData) {
  const id = formData.get('id');
  const sku = formData.get('sku');
  const name = formData.get('name');
  const price = parseFloat(formData.get('price'));
  const unit = formData.get('unit') || 'pcs';
  const stockLevel = parseFloat(formData.get('stockLevel')) || 0;
  const categoryId = formData.get('categoryId');
  const isBOM = formData.get('isBOM') === 'true';
  const wll = formData.get('wll') || null;
  const mblValue = formData.get('mblValue') ? parseFloat(formData.get('mblValue')) : null;
  const mblUnit = formData.get('mblUnit') || null;

  await prisma.product.update({
    where: { id },
    data: {
      sku,
      name,
      price,
      unit,
      stockLevel,
      categoryId: categoryId === 'none' ? null : categoryId,
      isBOM,
      wll,
      mblValue,
      mblUnit
    }
  });

  revalidatePath('/inventory');
  revalidatePath(`/inventory/${id}`);
  redirect(`/inventory/${id}`);
}

export async function deleteProduct(id) {
  // Cascading delete manually for safety
  await prisma.bOMItem.deleteMany({ where: { OR: [{ parentId: id }, { componentId: id }] } });
  await prisma.quoteItem.deleteMany({ where: { productId: id } });
  await prisma.salesOrderItem.deleteMany({ where: { productId: id } });
  await prisma.purchaseOrderItem.deleteMany({ where: { productId: id } });
  
  await prisma.product.delete({ where: { id } });
  
  revalidatePath('/inventory');
  redirect('/inventory');
}
