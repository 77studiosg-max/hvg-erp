export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer, FileText, CheckCircle, CreditCard } from 'lucide-react';

async function getInvoiceData(id) {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      salesOrder: true,
      items: {
        include: {
          product: true
        }
      }
    }
  });

  if (!invoice) return null;

  // Transform for compatibility with existing UI
  return {
    ...invoice,
    companyName: invoice.customer?.companyName,
    email: invoice.customer?.email,
    phone: invoice.customer?.phone,
    addressLine1: invoice.customer?.addressLine1,
    city: invoice.customer?.city,
    postcode: invoice.customer?.postcode,
    country: invoice.customer?.country,
    orderNumber: invoice.salesOrder?.orderNumber,
    items: invoice.items.map(item => ({
      ...item,
      productName: item.product?.name,
      product_sku: item.product?.sku
    }))
  };
}

export default async function InvoiceDetailsPage({ params }) {
  const { id } = await params;
  const invoice = await getInvoiceData(id);
  
  if (!invoice) notFound();

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <Link href="/invoices" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '1rem', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to Invoices
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <FileText size={28} style={{ color: '#8b5cf6' }} />
            <h1>Invoice: {invoice.invoiceNumber}</h1>
            <span style={{ 
              marginLeft: '1rem', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: '600',
              backgroundColor: invoice.status === 'Paid' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: invoice.status === 'Paid' ? '#22c55e' : '#ef4444'
            }}>
              {invoice.status}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link 
            href={`/invoices/${id}/print`} 
            className="btn-primary" 
            target="_blank"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#8b5cf6', border: 'none' }}
          >
            <Printer size={18} /> Print Invoice
          </Link>
        </div>
      </header>

      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Bill To</h3>
            <div style={{ fontWeight: '600', fontSize: '1.125rem', marginBottom: '0.25rem' }}>{invoice.companyName}</div>
            {invoice.addressLine1 && <div>{invoice.addressLine1}</div>}
            <div>{invoice.city} {invoice.postcode}</div>
            <div>{invoice.country}</div>
            {invoice.email && <div style={{ marginTop: '0.5rem', color: 'var(--muted-foreground)' }}>{invoice.email}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Invoice Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', justifyContent: 'end' }}>
              <div style={{ color: 'var(--muted-foreground)' }}>Date:</div>
              <div style={{ fontWeight: '500' }}>{new Date(invoice.createdAt).toLocaleDateString()}</div>
              
              <div style={{ color: 'var(--muted-foreground)' }}>Due Date:</div>
              <div style={{ fontWeight: '500' }}>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</div>
              
              <div style={{ color: 'var(--muted-foreground)' }}>Sales Order:</div>
              <div style={{ fontWeight: '500' }}>
                {invoice.salesOrderId ? (
                  <Link href={`/sales-orders/${invoice.salesOrderId}`} style={{ color: 'var(--primary)' }}>{invoice.orderNumber}</Link>
                ) : '-'}
              </div>
            </div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)', color: 'var(--muted-foreground)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '0.75rem' }}>Product</th>
              <th style={{ padding: '0.75rem', textAlign: 'center' }}>Qty</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>Unit Price</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total (Net)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem 0.75rem' }}>
                  <div style={{ fontWeight: '600' }}>{item.productName}</div>
                  {item.customDescription && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>
                      {item.customDescription}
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>SKU: {item.product_sku}</div>
                </td>
                <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>£{item.unitPrice.toFixed(2)}</td>
                <td style={{ padding: '1rem 0.75rem', textAlign: 'right', fontWeight: '600' }}>
                  £{(item.quantity * item.unitPrice).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '300px', borderTop: '2px solid var(--border)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--muted-foreground)' }}>
              <span>Subtotal:</span>
              <span>£{(invoice.totalAmount / 1.20).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--muted-foreground)' }}>
              <span>VAT (20%):</span>
              <span>£{(invoice.totalAmount - (invoice.totalAmount / 1.20)).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '800', color: 'var(--foreground)' }}>
              <span>Total Due:</span>
              <span>£{invoice.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
