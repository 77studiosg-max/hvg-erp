export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Users, Mail, Phone, MapPin, ArrowLeft, Edit, Copy } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { deleteCustomer, copyCustomerToVendor } from '@/app/actions/contacts';

async function getCustomer(id) {
  return await prisma.customer.findUnique({
    where: { id }
  });
}

export default async function CustomerDetailPage({ params }) {
  const { id } = await params;
  const customer = await getCustomer(id);

  if (!customer) {
    notFound();
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <Link href="/customers" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Back to Customers
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h1 style={{ margin: 0 }}>{customer.companyName}</h1>
              <span className="badge badge-info" style={{ letterSpacing: '0.05em' }}>{customer.customerNumber}</span>
            </div>
            <p style={{ color: 'var(--muted-foreground)' }}>Customer Profile & Contact Information</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <form action={copyCustomerToVendor.bind(null, id)}>
              <button type="submit" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Copy size={18} /> Copy to Vendor
              </button>
            </form>
            <Link href={`/customers/${id}/edit`} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Edit size={18} /> Edit Customer
            </Link>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Contact Info Card */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} className="text-primary" /> Contact Details
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Contact Name
                </label>
                <div style={{ fontWeight: '600' }}>{customer.contactName || 'N/A'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Email Address
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={14} className="text-muted-foreground" />
                  {customer.email || 'N/A'}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Phone Number
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={14} className="text-muted-foreground" />
                  {customer.phone || 'N/A'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Payment Terms
                </label>
                <span className="badge badge-info">{customer.paymentTerms}</span>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Tax ID / VAT
                </label>
                <div>{customer.vatNumber || 'Not provided'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Company Reg
                </label>
                <div>{customer.companyRegNumber || 'Not provided'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} className="text-primary" /> Billing Address
          </h3>
          
          <div style={{ lineHeight: '1.6' }}>
            <div style={{ fontWeight: '600' }}>{customer.companyName}</div>
            {customer.addressLine1 && <div>{customer.addressLine1}</div>}
            {customer.addressLine2 && <div>{customer.addressLine2}</div>}
            <div>{customer.city}</div>
            <div>{customer.postcode}</div>
            <div style={{ fontWeight: '600', marginTop: '0.5rem' }}>{customer.country}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
