export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Package, ArrowLeft, Layers, List } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getProduct(id) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      bomItems: {
        include: { component: true }
      },
      usedInBOM: {
        include: { parent: true }
      }
    }
  });
  if (!product) notFound();
  return product;
}

import { deleteProduct } from '../actions';
import DeleteButton from '@/components/DeleteButton';

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);

  return (
    <div>
      <Link href="/inventory" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <ArrowLeft size={16} /> Back to Inventory
      </Link>

      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <h1>{product.name}</h1>
            <span className="badge badge-info">{product.sku}</span>
          </div>
          <p style={{ color: 'var(--muted-foreground)' }}>{product.description || 'No description provided.'}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <DeleteButton id={product.id} onDelete={deleteProduct} title="Product" />
          <Link href={`/inventory/${product.id}/edit`} className="btn-primary">
            Edit Item
          </Link>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Package size={20} className="text-primary" />
            <h3 style={{ margin: 0 }}>Item Specifications</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--muted-foreground)' }}>Category</span>
              <span style={{ fontWeight: '600' }}>{product.category?.name || 'None'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--muted-foreground)' }}>Unit Price</span>
              <span style={{ fontWeight: '600' }}>£{product.price.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--muted-foreground)' }}>Current Stock</span>
              <span style={{ fontWeight: '600', color: 'var(--status-success)' }}>{product.stockLevel} units</span>
            </div>
            {product.wll && (
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>WLL</span>
                <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{product.wll}</span>
              </div>
            )}
            {product.mblValue && (
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>MBL</span>
                <span style={{ fontWeight: '600', color: 'var(--status-info)' }}>{product.mblValue} {product.mblUnit}</span>
              </div>
            )}
          </div>
        </div>

        {product.isBOM ? (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Layers size={20} className="text-primary" />
              <h3 style={{ margin: 0 }}>Bill of Materials (BOM)</h3>
            </div>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              This item is a kit composed of the following components:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {product.bomItems.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--secondary)', borderRadius: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{item.component.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{item.component.sku}</div>
                  </div>
                  <div style={{ fontWeight: '700' }}>x{item.quantity}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <List size={20} className="text-primary" />
              <h3 style={{ margin: 0 }}>Usage in BOM</h3>
            </div>
            {product.usedInBOM.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Used as a component in:</p>
                {product.usedInBOM.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--secondary)', borderRadius: '0.5rem' }}>
                    <span style={{ fontWeight: '600' }}>{item.parent.name}</span>
                    <span style={{ color: 'var(--muted-foreground)' }}>Qty: {item.quantity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--muted-foreground)' }}>This item is not used in any Bill of Materials.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
