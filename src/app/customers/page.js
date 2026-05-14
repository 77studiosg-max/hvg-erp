export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Users, Plus, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import ContactSearch from '@/components/ContactSearch';

async function getCustomers(query) {
  const where = query ? {
    OR: [
      { companyName: { contains: query } },
      { contactName: { contains: query } },
      { email: { contains: query } }
    ]
  } : {};

  return await prisma.customer.findMany({
    where,
    orderBy: { companyName: 'asc' }
  });
}

export default async function CustomersPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q;
  const customers = await getCustomers(query);

  return (
    <div>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Customers</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>Manage your client database and billing information.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ContactSearch placeholder="Search customers..." />
          <Link href="/customers/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: 'fit-content' }}>
            <Plus size={18} /> New Customer
          </Link>
        </div>
      </header>

      {customers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Users size={32} style={{ color: 'var(--primary)' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Customers Yet</h2>
          <p style={{ color: 'var(--muted-foreground)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Start building your database by adding your first customer. You'll need this for quotes and invoices.
          </p>
          <Link href="/customers/new" className="btn-primary">
            Add Your First Customer
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
              {customers.map(customer => (
                <tr key={customer.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '0.4rem 0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--muted-foreground)', background: 'var(--secondary)', padding: '0.1rem 0.4rem', borderRadius: '0.25rem' }}>
                        {customer.customerNumber}
                      </span>
                      <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.875rem' }}>{customer.companyName}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>({customer.paymentTerms})</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}>{customer.contactName || 'N/A'}</td>
                  <td style={{ padding: '0.4rem 0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Mail size={12} /> {customer.email || 'N/A'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Phone size={12} /> {customer.phone || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.4rem 0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                      <MapPin size={12} /> {customer.city}, {customer.postcode}
                    </div>
                  </td>
                  <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Link 
                        href={`/customers/${customer.id}`} 
                        className="btn-primary"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem' }}
                      >
                        View
                      </Link>
                      <Link 
                        href={`/customers/${customer.id}/edit`} 
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
