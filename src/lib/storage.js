import { supabase } from './supabase';

/**
 * Uploads a PDF file (as a Buffer or Blob) to Supabase Storage
 * @param {string} bucket - The name of the bucket (e.g., 'documents')
 * @param {string} path - The path/filename within the bucket
 * @param {Buffer | Blob | ArrayBuffer} fileBody - The file content
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export async function uploadDocument(bucket, path, fileBody) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, fileBody, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (error) {
    throw new Error(`Error uploading document: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Helper to extract filename from a document record
 * @param {string} type - 'invoice', 'quote', etc.
 * @param {string} number - The document number (e.g. INV-0001)
 * @returns {string}
 */
export function getDocumentPath(type, number) {
  return `${type}s/${number}_${Date.now()}.pdf`;
}
