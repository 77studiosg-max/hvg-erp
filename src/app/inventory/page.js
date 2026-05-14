export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Package, Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import InventorySearch from '@/components/InventorySearch';

async function getInventory(categoryId, query) {
  const where = {};
  if (categoryId) where.categoryId = categoryId;
  if (query) {
    where.OR = [
      { sku: { contains: query } },
      { name: { contains: query } },
      { category: { name: { contains: query } } },
      { wll: { contains: query } },
      { mblUnit: { contains: query } }
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      purchaseItems: {
        where: { purchaseOrder: { status: { notIn: ['Received', 'Cancelled'] } } },
        select: { quantity: true, receivedQuantity: true }
      },
      salesItems: {
        where: { salesOrder: { status: { notIn: ['Shipped', 'Delivered', 'Cancelled'] } } },
        select: { quantity: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const productsWithTotals = products.map(p => {
    const orderedQuantity = p.purchaseItems.reduce((acc, poi) => acc + (poi.quantity - (poi.receivedQuantity || 0)), 0);
    const allocatedQuantity = p.salesItems.reduce((acc, soi) => acc + (soi.quantity || 0), 0);
    
    return {
      ...p,
      orderedQuantity,
      allocatedQuantity,
      categoryName: p.category?.name
    };
  });
  
  let currentCategory = null;
  if (categoryId) {
    currentCategory = await prisma.productCategory.findUnique({
      where: { id: categoryId }
    });
  }

  return { products: productsWithTotals, currentCategory };
}

import { deleteProduct } from './actions';
import DeleteButton from '@/components/DeleteButton';

export default async function InventoryPage({ searchParams }) {
  const params = await searchParams;
  const categoryId = params?.category;
  const query = params?.q;
  const { products, currentCategory } = await getInventory(categoryId, query);

  return (
    <div>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>{currentCategory ? `Inventory: ${currentCategory.name}` : 'All Inventory & Products'}</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>
            {currentCategory 
              ? `Showing items in ${currentCategory.name}` 
              : 'Manage your catalog, stock levels, and Bill of Materials.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {currentCategory && (
            <Link href="/inventory" className="btn-secondary">
              Show All
            </Link>
          )}
          <Link href={`/inventory/new${categoryId ? `?categoryId=${categoryId}` : ''}`} className="btn-primary">
            <Plus size={18} /> Add Item
          </Link>
        </div>
      </header>

      <div className="card" style={{ padding: 0 }}>
        <div className="search-container" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <InventorySearch initialValue={query} />
          <button className="btn-secondary" style={{ width: 'auto', pointerEvents: 'none', opacity: 0.7 }}>
            <Filter size={18} /> Filters
          </button>
        </div>

        {!categoryId && !query ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            <div style={{ marginBottom: '1.5rem', display: 'inline-flex', padding: '1rem', borderRadius: '1rem', background: 'var(--secondary)' }}>
              <Package size={48} style={{ color: 'var(--primary)' }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--foreground)' }}>Welcome to Inventory Management</h2>
            <p style={{ maxWidth: '400px', margin: '0 auto' }}>
              Select a category from the sidebar or start searching above to find specific items in your catalog.
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--muted-foreground)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '0.75rem 1rem' }}>SKU</th>
                <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem' }}>Price</th>
                <th style={{ padding: '0.75rem 1rem' }}>Stock</th>
                <th style={{ padding: '0.75rem 1rem' }}>Allocated</th>
                <th style={{ padding: '0.75rem 1rem' }}>Ordered</th>
                <th style={{ padding: '0.75rem 1rem' }}>Spec</th>
                <th style={{ padding: '0.75rem 1rem' }}>Unit</th>
                <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="inventory-row" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.6rem 1rem', fontWeight: '600', fontSize: '0.875rem' }}>{product.sku}</td>
                  <td style={{ padding: '0.6rem 1rem', fontSize: '0.875rem' }}>{product.name}</td>
                  <td style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>{product.category?.name || 'Uncategorized'}</td>
                  <td style={{ padding: '0.6rem 1rem', fontSize: '0.875rem', fontWeight: '500' }}>£{product.price.toFixed(2)}</td>
                  <td style={{ padding: '0.6rem 1rem', fontSize: '0.875rem' }}>
                    <span style={{ 
                      color: product.stockLevel < 20 ? 'var(--status-danger)' : 'inherit',
                      fontWeight: product.stockLevel < 20 ? '700' : '500'
                    }}>
                      {product.stockLevel}
                    </span>
                  </td>
                  <td style={{ padding: '0.6rem 1rem', fontSize: '0.875rem', fontWeight: '600', color: '#3b82f6' }}>
                    {product.allocatedQuantity > 0 ? product.allocatedQuantity : '-'}
                  </td>
                  <td style={{ padding: '0.6rem 1rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--status-warning)' }}>
                    {product.orderedQuantity > 0 ? `+${product.orderedQuantity}` : '-'}
                  </td>
                  <td style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem' }}>
                    {product.wll && <span style={{ color: 'var(--primary)', fontWeight: '600', display: 'block' }}>WLL: {product.wll}</span>}
                    {product.mblValue && <span style={{ color: 'var(--status-info)', fontWeight: '600', display: 'block' }}>MBL: {product.mblValue}{product.mblUnit}</span>}
                    {!product.wll && !product.mblValue && <span style={{ color: 'var(--muted-foreground)' }}>-</span>}
                  </td>
                  <td style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>{product.unit}</td>
                  <td style={{ padding: '0.6rem 1rem' }}>
                    {product.isBOM ? (
                      <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>BOM Kit</span>
                    ) : (
                      <span className="badge badge-info" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>Single Item</span>
                    )}
                  </td>
                  <td style={{ padding: '0.6rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Link href={`/purchase-orders/new?itemId=${product.id}`} style={{ color: 'var(--status-warning)', fontWeight: '600', fontSize: '0.8125rem' }} title="Create Purchase Order">
                        PO
                      </Link>
                      <Link href={`/inventory/${product.id}`} style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.8125rem' }}>
                        Edit
                      </Link>
                      <DeleteButton id={product.id} action={deleteProduct} label="Product" />
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="10" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                    No products found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
