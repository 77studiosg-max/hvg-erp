export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import SalesOrderForm from '@/components/SalesOrderForm';
import { updateSalesOrder } from '@/app/actions/sales-orders';
import { ShoppingCart, ArrowLeft, Printer, FileText } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import DispatchSOButton from '@/components/DispatchSOButton';
import CreateInvoiceButton from '@/components/CreateInvoiceButton';

async function getData(id) {
  const order = await prisma.salesOrder.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          bomItems: true
        }
      }
    }
  });
  
  if (!order) return null;

  const [customers, products, categories, vendors, deliveryNotes, invoices] = await Promise.all([
    prisma.customer.findMany({ orderBy: { companyName: 'asc' } }),
    prisma.product.findMany({ orderBy: { name: 'asc' } }),
    prisma.productCategory.findMany({ orderBy: { name: 'asc' } }),
    prisma.vendor.findMany({ orderBy: { companyName: 'asc' } }),
    prisma.deliveryNote.findMany({ where: { salesOrderId: id }, orderBy: { date: 'desc' } }),
    prisma.invoice.findMany({ where: { salesOrderId: id }, orderBy: { createdAt: 'desc' } })
  ]);
  
  // Products need totalStock alias for Form compatibility if expected
  const productsWithStock = products.map(p => ({ ...p, totalStock: p.stockLevel }));

  return { 
    order, 
    customers, 
    products: productsWithStock,
    categories,
    vendors,
    deliveryNotes,
    invoices
  };
}

export default async function EditSalesOrderPage({ params }) {
  const { id } = await params;
  const data = await getData(id);
  
  if (!data) notFound();

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <Link href="/sales-orders" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '1rem', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to Orders
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <ShoppingCart size={28} style={{ color: '#10b981' }} />
            <h1>Sales Order: <span style={{ color: '#059669' }}>{data.order.orderNumber}</span></h1>
          </div>
          <p style={{ color: 'var(--muted-foreground)' }}>Manage fulfillment, shipping and invoicing status.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <CreateInvoiceButton order={data.order} products={data.products} />
          <DispatchSOButton order={data.order} products={data.products} />
          <Link 
            href={`/sales-orders/${id}/works-order`} 
            className="btn-secondary" 
            target="_blank"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}
          >
            <FileText size={18} /> Works Order
          </Link>
          <Link 
            href={`/sales-orders/${id}/print`} 
            className="btn-secondary" 
            target="_blank"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', backgroundColor: 'rgba(249, 115, 22, 0.1)', color: '#f97316', border: '1px solid rgba(249, 115, 22, 0.2)' }}
          >
            <Printer size={18} /> Print Order
          </Link>
        </div>
      </header>

      <SalesOrderForm 
        action={updateSalesOrder.bind(null, id)} 
        initialData={data.order}
        customers={data.customers} 
        products={data.products} 
        categories={data.categories}
        vendors={data.vendors}
      />

      {data.deliveryNotes && data.deliveryNotes.length > 0 && (
        <div className="card" style={{ padding: '1rem', marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} style={{ color: 'var(--primary)' }} />
            Delivery Notes (Dispatch History)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--muted-foreground)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem' }}>Date</th>
                <th style={{ padding: '0.75rem' }}>Note Number</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.deliveryNotes.map(note => (
                <tr key={note.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                    {new Date(note.date).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    {note.noteNumber}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    <Link 
                      href={`/delivery-notes/${note.id}/print`} 
                      className="btn-secondary" 
                      target="_blank"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
                    >
                      <Printer size={14} style={{ marginRight: '0.25rem' }} /> Print
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.invoices && data.invoices.length > 0 && (
        <div className="card" style={{ padding: '1rem', marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} style={{ color: '#8b5cf6' }} />
            Invoices
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--muted-foreground)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem' }}>Date</th>
                <th style={{ padding: '0.75rem' }}>Invoice Number</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    {inv.invoiceNumber}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '600',
                      backgroundColor: inv.status === 'Paid' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: inv.status === 'Paid' ? '#22c55e' : '#ef4444'
                    }}>
                      {inv.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '700' }}>
                    £{inv.totalAmount.toFixed(2)}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    <Link 
                      href={`/invoices/${inv.id}`} 
                      className="btn-secondary" 
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
                    >
                      View
                    </Link>
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
