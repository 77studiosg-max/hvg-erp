export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import SalesOrderForm from '@/components/SalesOrderForm';
import { createSalesOrder } from '@/app/actions/sales-orders';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

async function getData() {
  const [customers, productsRaw, categories, vendors] = await Promise.all([
    prisma.customer.findMany({ orderBy: { companyName: 'asc' } }),
    prisma.product.findMany({ orderBy: { name: 'asc' } }),
    prisma.productCategory.findMany({ orderBy: { name: 'asc' } }),
    prisma.vendor.findMany({ orderBy: { companyName: 'asc' } })
  ]);
  
  const products = productsRaw.map(p => ({ ...p, totalStock: p.stockLevel }));
  
  return { customers, products, categories, vendors };
}

export default async function NewSalesOrderPage() {
  const data = await getData();
  
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <Link href="/sales-orders" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '1rem', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Orders
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <ShoppingCart size={28} style={{ color: '#10b981' }} />
          <h1>New Sales Order</h1>
        </div>
        <p style={{ color: 'var(--muted-foreground)' }}>Create a formal order directly without a preceding quotation.</p>
      </header>

      <SalesOrderForm 
        action={createSalesOrder} 
        customers={data.customers} 
        products={data.products} 
        categories={data.categories}
        vendors={data.vendors}
      />
    </div>
  );
}
