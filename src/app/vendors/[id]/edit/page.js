import { prisma } from '@/lib/prisma';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ContactForm from '@/components/ContactForm';
import { updateVendor } from '@/app/actions/contacts';
import { notFound } from 'next/navigation';

async function getVendor(id) {
  return await prisma.vendor.findUnique({
    where: { id }
  });
}

export default async function EditVendorPage({ params }) {
  const { id } = await params;
  const vendor = await getVendor(id);

  if (!vendor) {
    notFound();
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link href={`/vendors/${id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <ArrowLeft size={16} /> Back to Details
      </Link>

      <header style={{ marginBottom: '2rem' }}>
        <h1>Edit Vendor</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>Update supplier details and purchase information.</p>
      </header>

      <ContactForm action={updateVendor} type="vendor" initialData={vendor} />
    </div>
  );
}
