export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Truck, Mail, Phone, MapPin, ArrowLeft, Edit, Copy } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { deleteVendor, copyVendorToCustomer } from '@/app/actions/contacts';

async function getVendor(id) {
  return await prisma.vendor.findUnique({
    where: { id }
  });
}

export default async function VendorDetailPage({ params }) {
  const { id } = await params;
  const vendor = await getVendor(id);

  if (!vendor) {
    notFound();
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <Link href="/vendors" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Back to Vendors
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h1 style={{ margin: 0 }}>{vendor.companyName}</h1>
              <span className="badge badge-info" style={{ letterSpacing: '0.05em' }}>{vendor.vendorNumber}</span>
            </div>
            <p style={{ color: 'var(--muted-foreground)' }}>Vendor Profile & Supplier Information</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <form action={copyVendorToCustomer.bind(null, id)}>
              <button type="submit" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Copy size={18} /> Copy to Customer
              </button>
            </form>
            <Link href={`/vendors/${id}/edit`} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Edit size={18} /> Edit Vendor
            </Link>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Contact Info Card */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Truck size={20} className="text-primary" /> Supplier Details
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Contact Name
                </label>
                <div style={{ fontWeight: '600' }}>{vendor.contactName || 'N/A'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Email Address
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={14} className="text-muted-foreground" />
                  {vendor.email || 'N/A'}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Phone Number
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={14} className="text-muted-foreground" />
                  {vendor.phone || 'N/A'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Payment Terms
                </label>
                <span className="badge badge-info">{vendor.paymentTerms}</span>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Tax ID / VAT
                </label>
                <div>{vendor.vatNumber || 'Not provided'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Company Reg
                </label>
                <div>{vendor.companyRegNumber || 'Not provided'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} className="text-primary" /> Supplier Address
          </h3>
          
          <div style={{ lineHeight: '1.6' }}>
            <div style={{ fontWeight: '600' }}>{vendor.companyName}</div>
            {vendor.addressLine1 && <div>{vendor.addressLine1}</div>}
            {vendor.addressLine2 && <div>{vendor.addressLine2}</div>}
            <div>{vendor.city}</div>
            <div>{vendor.postcode}</div>
            <div style={{ fontWeight: '600', marginTop: '0.5rem' }}>{vendor.country}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
