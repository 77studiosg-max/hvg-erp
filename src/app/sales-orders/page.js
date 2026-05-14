export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Plus, ShoppingCart, Eye } from 'lucide-react';
import Link from 'next/link';

async function getSalesOrders() {
  const orders = await prisma.salesOrder.findMany({
    include: {
      customer: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return orders;
}

export default async function SalesOrdersPage() {
  const orders = await getSalesOrders();

  return (
    <div>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Sales Orders</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>Track orders from acceptance to fulfillment and invoicing.</p>
        </div>
        <Link href="/sales-orders/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> New Sales Order
        </Link>
      </header>

      <div className="card" style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
              <th style={{ padding: '1rem 1.5rem' }}>Order #</th>
              <th style={{ padding: '1rem 1.5rem' }}>Customer</th>
              <th style={{ padding: '1rem 1.5rem' }}>Date</th>
              <th style={{ padding: '1rem 1.5rem' }}>Total</th>
              <th style={{ padding: '1rem 1.5rem' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem' }}>Workflow</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                  No sales orders found.
                </td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>{order.orderNumber || '---'}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{order.customer.companyName}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '---'}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>£{order.totalAmount.toLocaleString()}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={`badge badge-${order.status.toLowerCase() === 'pending' ? 'pending' : 'success'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <Link href={`/sales-orders/${order.id}`} style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.875rem' }}>Edit</Link>
                      <Link href={`/sales-orders/${order.id}/print`} target="_blank" style={{ color: '#f97316', fontWeight: '600', fontSize: '0.875rem' }}>Print</Link>
                      {order.pdfUrl && (
                        <a href={order.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#06b6d4', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Eye size={14} /> View
                        </a>
                      )}
                      <div style={{ width: '1px', height: '1.25rem', background: 'var(--border)', margin: '0 0.25rem' }}></div>
                      <Link href={`/sales-orders/${order.id}`} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', textDecoration: 'none' }}>Ship</Link>
                      <Link href={`/sales-orders/${order.id}`} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', textDecoration: 'none' }}>Invoice</Link>
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
