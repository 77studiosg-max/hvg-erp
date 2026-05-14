export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import PurchaseOrderForm from '@/components/PurchaseOrderForm';
import { createPurchaseOrder } from '@/app/actions/purchase-orders';
import { Truck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

async function getData() {
  const [vendors, productsRaw, categories] = await Promise.all([
    prisma.vendor.findMany({ orderBy: { companyName: 'asc' } }),
    prisma.product.findMany({ orderBy: { name: 'asc' } }),
    prisma.productCategory.findMany({ orderBy: { name: 'asc' } })
  ]);
  
  const products = productsRaw.map(p => ({ ...p, totalStock: p.stockLevel }));
  
  return { vendors, products, categories };
}

export default async function NewPurchaseOrderPage({ searchParams }) {
  const params = await searchParams;
  const itemId = params?.itemId;
  const data = await getData();
  
  let initialData = null;
  if (itemId) {
    const product = data.products.find(p => p.id === itemId);
    if (product) {
      initialData = {
        items: [{
          id: crypto.randomUUID(),
          productId: product.id,
          quantity: 1,
          unitPrice: product.price,
          mainGroupId: '',
          subgroupId: ''
        }]
      };
    }
  }
  
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <Link href="/purchase-orders" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '1rem', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to POs
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Truck size={28} style={{ color: '#6366f1' }} />
          <h1>New Purchase Order</h1>
        </div>
        <p style={{ color: 'var(--muted-foreground)' }}>Create an order to buy stock from your suppliers.</p>
      </header>

      <PurchaseOrderForm 
        action={createPurchaseOrder} 
        vendors={data.vendors} 
        products={data.products} 
        categories={data.categories}
        initialData={initialData}
      />
    </div>
  );
}
