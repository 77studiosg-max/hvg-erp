import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Search, FileText, Download, Printer, Eye } from 'lucide-react';

async function getInvoices() {
  return await prisma.invoice.findMany({
    include: {
      customer: true,
      salesOrder: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <FileText size={28} style={{ color: '#8b5cf6' }} />
            <h1 style={{ margin: 0 }}>Invoices</h1>
          </div>
          <p style={{ color: 'var(--muted-foreground)', margin: 0 }}>Manage customer billing and payments.</p>
        </div>
      </header>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
              <input 
                type="text" 
                placeholder="Search invoices..." 
                style={{ width: '100%', paddingLeft: '2.5rem' }}
              />
            </div>
            <select style={{ width: '200px', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}>
              <option value="">All Statuses</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--muted-foreground)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                <th style={{ padding: '1rem 1.5rem' }}>Invoice No</th>
                <th style={{ padding: '1rem 1.5rem' }}>Date</th>
                <th style={{ padding: '1rem 1.5rem' }}>Customer</th>
                <th style={{ padding: '1rem 1.5rem' }}>Related SO</th>
                <th style={{ padding: '1rem 1.5rem' }}>Due Date</th>
                <th style={{ padding: '1rem 1.5rem' }}>Total</th>
                <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <FileText size={48} style={{ opacity: 0.2 }} />
                      <span>No invoices found. Generate invoices from fulfilled Sales Orders.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: '700', color: 'var(--foreground)' }}>{inv.invoiceNumber}</td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>{inv.customer?.companyName}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {inv.salesOrderId ? (
                        <Link href={`/sales-orders/${inv.salesOrderId}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500', fontSize: '0.875rem' }}>
                          {inv.salesOrder?.orderNumber}
                        </Link>
                      ) : <span style={{ opacity: 0.3 }}>---</span>}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : <span style={{ opacity: 0.3 }}>---</span>}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: '800', fontSize: '0.9375rem' }}>£{inv.totalAmount.toFixed(2)}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span className={`badge badge-${inv.status.toLowerCase()}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Link href={`/invoices/${inv.id}`} style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.875rem', textDecoration: 'none' }}>
                          Edit
                        </Link>
                        <Link href={`/invoices/${inv.id}/print`} target="_blank" style={{ color: '#f97316', fontWeight: '700', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Printer size={14} /> Print
                        </Link>
                        {inv.pdfUrl && (
                          <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#06b6d4', fontWeight: '700', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Eye size={14} /> View
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
