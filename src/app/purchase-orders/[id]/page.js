export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import PurchaseOrderForm from '@/components/PurchaseOrderForm';
import { updatePurchaseOrder } from '@/app/actions/purchase-orders';
import { Truck, ArrowLeft, Printer } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReceivePOButton from '@/components/ReceivePOButton';

async function getData(id) {
  const order = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      items: true
    }
  });
  
  if (!order) return null;

  const [vendors, productsRaw, categories] = await Promise.all([
    prisma.vendor.findMany({ orderBy: { companyName: 'asc' } }),
    prisma.product.findMany({ orderBy: { name: 'asc' } }),
    prisma.productCategory.findMany({ orderBy: { name: 'asc' } })
  ]);
  
  const products = productsRaw.map(p => ({ ...p, totalStock: p.stockLevel }));
  
  return { 
    order,
    vendors, 
    products,
    categories
  };
}

export default async function EditPurchaseOrderPage({ params }) {
  const { id } = await params;
  const data = await getData(id);
  
  if (!data) notFound();

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <Link href="/purchase-orders" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '1rem', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to POs
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Truck size={28} style={{ color: '#6366f1' }} />
            <h1>Purchase Order: {data.order.poNumber}</h1>
          </div>
          <p style={{ color: 'var(--muted-foreground)' }}>Track supplier delivery and update stock levels.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <ReceivePOButton order={data.order} products={data.products} />
          <Link 
            href={`/purchase-orders/${id}/print`} 
            className="btn-secondary" 
            target="_blank"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}
          >
            <Printer size={18} /> Print PO
          </Link>
        </div>
      </header>

      <PurchaseOrderForm 
        action={updatePurchaseOrder.bind(null, id)} 
        initialData={data.order}
        vendors={data.vendors} 
        products={data.products} 
        categories={data.categories}
      />
    </div>
  );
}
