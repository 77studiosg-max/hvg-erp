import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ContactForm from '@/components/ContactForm';
import { createCustomer } from '@/app/actions/contacts';

export default function NewCustomerPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/customers" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <ArrowLeft size={16} /> Back to Customers
      </Link>

      <header style={{ marginBottom: '2rem' }}>
        <h1>Add New Customer</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>Enter company details and billing information for invoicing.</p>
      </header>

      <ContactForm action={createCustomer} type="customer" />
    </div>
  );
}
