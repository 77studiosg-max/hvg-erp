import { prisma } from '@/lib/prisma';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ContactForm from '@/components/ContactForm';
import { updateCustomer } from '@/app/actions/contacts';
import { notFound } from 'next/navigation';

async function getCustomer(id) {
  return await prisma.customer.findUnique({
    where: { id }
  });
}

export default async function EditCustomerPage({ params }) {
  const { id } = await params;
  const customer = await getCustomer(id);

  if (!customer) {
    notFound();
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link href={`/customers/${id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <ArrowLeft size={16} /> Back to Details
      </Link>

      <header style={{ marginBottom: '2rem' }}>
        <h1>Edit Customer</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>Update company details and billing information.</p>
      </header>

      <ContactForm action={updateCustomer} type="customer" initialData={customer} />
    </div>
  );
}
