import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ContactForm from '@/components/ContactForm';
import { createVendor } from '@/app/actions/contacts';

export default function NewVendorPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/vendors" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <ArrowLeft size={16} /> Back to Vendors
      </Link>

      <header style={{ marginBottom: '2rem' }}>
        <h1>Add New Vendor</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>Enter supplier details and purchase terms for procurement.</p>
      </header>

      <ContactForm action={createVendor} type="vendor" />
    </div>
  );
}
