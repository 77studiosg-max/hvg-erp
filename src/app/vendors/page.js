import { prisma } from '@/lib/prisma';
import { Truck, Plus, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import ContactSearch from '@/components/ContactSearch';

async function getVendors(query) {
  const where = query ? {
    OR: [
      { companyName: { contains: query } },
      { contactName: { contains: query } },
      { email: { contains: query } }
    ]
  } : {};

  return await prisma.vendor.findMany({
    where,
    orderBy: { companyName: 'asc' }
  });
}

export default async function VendorsPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q;
  const vendors = await getVendors(query);

  return (
    <div>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Vendors</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>Manage your suppliers and purchase order information.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ContactSearch placeholder="Search vendors..." />
          <Link href="/vendors/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: 'fit-content' }}>
            <Plus size={18} /> New Vendor
          </Link>
        </div>
      </header>

      {vendors.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Truck size={32} style={{ color: 'var(--primary)' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Vendors Yet</h2>
          <p style={{ color: 'var(--muted-foreground)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Start building your supplier database by adding your first vendor. This is required for purchase orders.
          </p>
          <Link href="/vendors/new" className="btn-primary">
            Add Your First Vendor
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Company</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Contact</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Contact Details</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Location</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map(vendor => (
                <tr key={vendor.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '0.4rem 0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--muted-foreground)', background: 'var(--secondary)', padding: '0.1rem 0.4rem', borderRadius: '0.25rem' }}>
                         {vendor.vendorNumber}
                       </span>
                       <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.875rem' }}>{vendor.companyName}</span>
                       <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>({vendor.paymentTerms})</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}>{vendor.contactName || 'N/A'}</td>
                  <td style={{ padding: '0.4rem 0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Mail size={12} /> {vendor.email || 'N/A'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Phone size={12} /> {vendor.phone || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.4rem 0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                      <MapPin size={12} /> {vendor.city}, {vendor.postcode}
                    </div>
                  </td>
                  <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Link 
                        href={`/vendors/${vendor.id}`} 
                        className="btn-primary"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem' }}
                      >
                        View
                      </Link>
                      <Link 
                        href={`/vendors/${vendor.id}/edit`} 
                        className="btn-secondary"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem' }}
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
