'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createCategory(formData) {
  const name = formData.get('name');
  const parentId = formData.get('parentId') || null;
  const bomEnabled = formData.get('bomEnabled') === 'true';
  const id = crypto.randomUUID();

  await prisma.productCategory.create({
    data: {
      id,
      name,
      parentId: parentId === 'none' ? null : parentId,
      bomEnabled
    }
  });

  revalidatePath('/settings');
  revalidatePath('/inventory');
}

export async function deleteCategory(id) {
  // Check if category has products
  const productCount = await prisma.product.count({
    where: { categoryId: id }
  });
  if (productCount > 0) {
    throw new Error('Cannot delete category with associated products.');
  }

  // Check if category has subcategories
  const subCount = await prisma.productCategory.count({
    where: { parentId: id }
  });
  if (subCount > 0) {
    throw new Error('Cannot delete category with associated subgroups.');
  }

  await prisma.productCategory.delete({ where: { id } });
  revalidatePath('/settings');
}

export async function updateCategory(id, name) {
  if (!name) throw new Error('Name is required');
  
  await prisma.productCategory.update({
    where: { id },
    data: { name }
  });
  
  revalidatePath('/settings');
  revalidatePath('/inventory');
}

export async function toggleCategoryBOM(id, enabled) {
  await prisma.productCategory.update({
    where: { id },
    data: { bomEnabled: enabled }
  });
  revalidatePath('/settings');
  revalidatePath('/inventory');
}
