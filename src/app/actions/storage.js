'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Updates the pdfUrl field for a given document
 * @param {string} type - 'invoice', 'quote', 'salesOrder', 'purchaseOrder', 'deliveryNote'
 * @param {string} id - The document ID
 * @param {string} url - The Supabase Storage URL
 */
export async function updateDocumentPdfUrl(type, id, url) {
  try {
    const model = type === 'salesOrder' ? 'salesOrder' : 
                  type === 'purchaseOrder' ? 'purchaseOrder' : 
                  type === 'deliveryNote' ? 'deliveryNote' : 
                  type.toLowerCase();

    await prisma[model].update({
      where: { id },
      data: { pdfUrl: url }
    });

    revalidatePath(`/${type}s`);
    revalidatePath(`/${type}s/${id}`);
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating PDF URL for ${type}:`, error);
    return { success: false, error: error.message };
  }
}
