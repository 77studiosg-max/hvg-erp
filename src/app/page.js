import { prisma } from '@/lib/prisma';
import { 
  TrendingUp, 
  ShoppingCart, 
  Clock, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

async function getStats() {
  const [salesCount, pendingOrders, unpaidInvoices, revenueData] = await Promise.all([
    prisma.salesOrder.count(),
    prisma.salesOrder.count({ where: { status: 'Pending' } }),
    prisma.invoice.count({ where: { status: 'Unpaid' } }),
    prisma.invoice.aggregate({
      _sum: {
        totalAmount: true
      }
    })
  ]);

  const recentOrders = await prisma.salesOrder.findMany({
    take: 5,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      customer: true
    }
  });

  return {
    salesCount,
    pendingOrders,
    unpaidInvoices,
    revenue: revenueData._sum.totalAmount || 0,
    recentOrders
  };
}

export default async function Dashboard() {
  const stats = await getStats();

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Business Overview</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>Welcome back. Here's what's happening today.</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', fontWeight: '500' }}>Total Revenue</p>
              <h2 style={{ margin: '0.5rem 0' }}>£{stats.revenue.toLocaleString()}</h2>
            </div>
            <div style={{ padding: '0.75rem', background: 'var(--secondary)', borderRadius: '0.75rem', color: 'var(--primary)' }}>
              <TrendingUp size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--status-success)', display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={16} /> 12%
            </span>
            <span style={{ color: 'var(--muted-foreground)' }}>vs last month</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', fontWeight: '500' }}>Sales Orders</p>
              <h2 style={{ margin: '0.5rem 0' }}>{stats.salesCount}</h2>
            </div>
            <div style={{ padding: '0.75rem', background: 'var(--secondary)', borderRadius: '0.75rem', color: 'var(--primary)' }}>
              <ShoppingCart size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--status-success)', display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={16} /> 5%
            </span>
            <span style={{ color: 'var(--muted-foreground)' }}>new orders</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', fontWeight: '500' }}>Pending Fulfilment</p>
              <h2 style={{ margin: '0.5rem 0' }}>{stats.pendingOrders}</h2>
            </div>
            <div style={{ padding: '0.75rem', background: '#fffbeb', borderRadius: '0.75rem', color: '#b45309' }}>
              <Clock size={24} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--muted-foreground)' }}>Requires attention</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', fontWeight: '500' }}>Unpaid Invoices</p>
              <h2 style={{ margin: '0.5rem 0' }}>{stats.unpaidInvoices}</h2>
            </div>
            <div style={{ padding: '0.75rem', background: '#fef2f2', borderRadius: '0.75rem', color: '#b91c1c' }}>
              <AlertCircle size={24} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--status-danger)' }}>{stats.unpaidInvoices} overdue</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Recent Sales Orders</h3>
            <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>View All</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
                <th style={{ padding: '1rem 1.5rem' }}>Order #</th>
                <th style={{ padding: '1rem 1.5rem' }}>Customer</th>
                <th style={{ padding: '1rem 1.5rem' }}>Amount</th>
                <th style={{ padding: '1rem 1.5rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>{order.orderNumber || '---'}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{order.customer.companyName}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>£{order.totalAmount.toLocaleString()}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={`badge badge-${order.status.toLowerCase() === 'pending' ? 'pending' : 'success'}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="btn-primary" style={{ textAlign: 'left' }}>+ New Quote</button>
            <button className="btn-secondary" style={{ textAlign: 'left' }}>+ New Purchase Order</button>
            <button className="btn-secondary" style={{ textAlign: 'left' }}>Add Product</button>
          </div>
        </div>
      </div>
    </div>
  );
}
