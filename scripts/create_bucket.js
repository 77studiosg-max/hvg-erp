const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createBucket() {
  try {
    console.log('Attempting to create bucket "documents" in Supabase Storage...');
    
    // Insert bucket into storage.buckets table
    await prisma.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public)
      VALUES ('documents', 'documents', true)
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('Bucket "documents" created (or already exists).');

    // Add a policy to allow public read access
    // This is often needed for public buckets to be accessible via URL
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE policyname = 'Public Access' AND tablename = 'objects' AND schemaname = 'storage'
        ) THEN
          CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
        END IF;
      END
      $$;
    `);

    console.log('Public read policy added to "documents" bucket.');
  } catch (error) {
    console.error('Error creating bucket:', error);
    console.log('\nNote: If this failed, you may need to create the bucket manually in the Supabase Dashboard under the "Storage" section.');
  } finally {
    await prisma.$disconnect();
  }
}

createBucket();
