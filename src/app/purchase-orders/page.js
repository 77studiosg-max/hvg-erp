import { prisma } from '@/lib/prisma';
import { Plus, Search, Truck } from 'lucide-react';
import Link from 'next/link';

async function getPurchaseOrders() {
  return await prisma.purchaseOrder.findMany({
    select: {
      id: true,
      poNumber: true,
      vendorId: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      updatedAt: true,
      vendor: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export default async function PurchaseOrdersPage() {
  const orders = await getPurchaseOrders();

  return (
    <div>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Purchase Orders</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>Manage procurement and track supplier deliveries.</p>
        </div>
        <Link href="/purchase-orders/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#6366f1' }}>
          <Plus size={18} /> New Purchase Order
        </Link>
      </header>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
            <input type="text" placeholder="Search POs..." style={{ paddingLeft: '2.5rem' }} />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
              <th style={{ padding: '1rem 1.5rem' }}>PO #</th>
              <th style={{ padding: '1rem 1.5rem' }}>Vendor</th>
              <th style={{ padding: '1rem 1.5rem' }}>Date</th>
              <th style={{ padding: '1rem 1.5rem' }}>Total Cost</th>
              <th style={{ padding: '1rem 1.5rem' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                  No purchase orders found.
                </td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>{order.poNumber}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{order.vendor.companyName}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>£{order.totalAmount.toLocaleString()}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={`badge`} style={{ 
                      backgroundColor: order.status === 'Received' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                      color: order.status === 'Received' ? '#22c55e' : '#6366f1',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <Link href={`/purchase-orders/${order.id}`} style={{ color: '#6366f1', fontWeight: '600' }}>Edit</Link>
                      <Link href={`/purchase-orders/${order.id}/print`} target="_blank" style={{ color: 'var(--muted-foreground)', fontWeight: '600' }}>PDF</Link>
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
