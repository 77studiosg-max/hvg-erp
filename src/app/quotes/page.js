export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Plus, Search, FileText, Eye } from 'lucide-react';
import Link from 'next/link';
import ConvertQuoteButton from '@/components/ConvertQuoteButton';
import { convertToSalesOrder } from '@/app/actions/quotes';

async function getQuotes() {
  return await prisma.quote.findMany({
    include: {
      customer: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export default async function QuotesPage() {
  const quotes = await getQuotes();

  return (
    <div>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Quotations</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>Create and manage quotes for your customers.</p>
        </div>
        <Link href="/quotes/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> New Quote
        </Link>
      </header>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
            <input type="text" placeholder="Search quotes..." style={{ paddingLeft: '2.5rem' }} />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
              <th style={{ padding: '1rem 1.5rem' }}>Quote #</th>
              <th style={{ padding: '1rem 1.5rem' }}>Customer</th>
              <th style={{ padding: '1rem 1.5rem' }}>Date</th>
              <th style={{ padding: '1rem 1.5rem' }}>Total</th>
              <th style={{ padding: '1rem 1.5rem' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotes.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                  No quotes found. Start by creating one.
                </td>
              </tr>
            ) : (
              quotes.map(quote => (
                <tr key={quote.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>{quote.quoteNumber}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{quote.customer.companyName}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>£{quote.totalAmount.toLocaleString()}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={`badge badge-${quote.status.toLowerCase()}`}>
                      {quote.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <Link href={`/quotes/${quote.id}`} style={{ color: 'var(--primary)', fontWeight: '600' }}>Edit</Link>
                      <Link href={`/quotes/${quote.id}/print`} target="_blank" style={{ color: '#f97316', fontWeight: '600' }}>Print</Link>
                      {quote.pdfUrl && (
                        <a href={quote.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#06b6d4', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Eye size={14} /> View
                        </a>
                      )}
                      {quote.status !== 'Converted' && (
                        <ConvertQuoteButton action={convertToSalesOrder} id={quote.id} />
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
  );
}
