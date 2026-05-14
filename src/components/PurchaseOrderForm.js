'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Save, X, Search, ChevronRight, Package, AlertCircle } from 'lucide-react';

export default function PurchaseOrderForm({ action, initialData, vendors, products, categories = [] }) {
  const [items, setItems] = useState(initialData?.items || []);
  const [vendorId, setVendorId] = useState(initialData?.vendorId || '');
  const [status, setStatus] = useState(initialData?.status || 'Pending');

  // Pre-process items to find their categories
  useEffect(() => {
    if (initialData?.items && products.length > 0) {
      const enhancedItems = initialData.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (product && product.categoryId) {
          const cat = categories.find(c => c.id === product.categoryId);
          if (cat) {
            if (cat.parentId) {
              return { ...item, mainGroupId: cat.parentId, subgroupId: cat.id };
            } else {
              return { ...item, mainGroupId: cat.id, subgroupId: '' };
            }
          }
        }
        return { ...item, mainGroupId: '', subgroupId: '' };
      });
      setItems(enhancedItems);
    }
  }, [initialData?.items, products, categories]);

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), productId: '', quantity: 1, unitPrice: 0, mainGroupId: '', subgroupId: '' }]);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'mainGroupId') {
          updated.subgroupId = '';
          updated.productId = '';
        } else if (field === 'subgroupId') {
          updated.productId = '';
        } else if (field === 'productId') {
          const product = products.find(p => p.id === value);
          if (product) updated.unitPrice = product.price;
        }
        return updated;
      }
      return item;
    }));
  };

  const mainGroups = useMemo(() => categories.filter(c => !c.parentId), [categories]);
  const getSubGroups = (mainId) => categories.filter(c => c.parentId === mainId);
  const getProducts = (catId, mainId) => {
    if (catId) return products.filter(p => p.categoryId === catId);
    if (mainId) return products.filter(p => p.categoryId === mainId);
    return [];
  };

  const calculateItemTotal = (item) => {
    return (item.quantity || 0) * (item.unitPrice || 0);
  };

  const grandTotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);

  const getProductStock = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? (product.totalStock || 0) : null;
  };

  return (
    <form action={action} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <input type="hidden" name="itemsJson" value={JSON.stringify(items)} />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: 'span 2' }}>
          <label style={{ fontWeight: '700', fontSize: '0.875rem' }}>Vendor *</label>
          <select name="vendorId" value={vendorId} onChange={(e) => setVendorId(e.target.value)} required>
            <option value="">-- Select Vendor --</option>
            {vendors.map(v => (
              <option key={v.id} value={v.id}>{v.companyName} ({v.vendorNumber})</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: '700', fontSize: '0.875rem' }}>Status</label>
          <select name="status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Pending">Pending</option>
            <option value="Ordered">Ordered</option>
            <option value="Partially Received">Partially Received</option>
            <option value="Received">Received</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '700' }}>Order Items</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)', fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>
                <th style={{ padding: '0.5rem', width: '30px' }}>Pos</th>
                <th style={{ padding: '0.5rem' }}>Item Selection (Hierarchical)</th>
                <th style={{ padding: '0.5rem', width: '80px' }}>Qty</th>
                <th style={{ padding: '0.5rem', width: '120px' }}>Unit Cost</th>
                <th style={{ padding: '0.5rem', width: '120px', textAlign: 'right' }}>Total Cost</th>
                <th style={{ padding: '0.5rem', width: '30px' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>No items added yet.</td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const stock = getProductStock(item.productId);
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.4rem', color: 'var(--muted-foreground)', fontSize: '0.75rem', fontWeight: 'bold' }}>{index + 1}.</td>
                      <td style={{ padding: '0.4rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <select value={item.mainGroupId} onChange={(e) => updateItem(item.id, 'mainGroupId', e.target.value)} style={{ width: '150px', fontSize: '0.75rem' }}>
                            <option value="">-- Group --</option>
                            {mainGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                          </select>
                          <ChevronRight size={12} style={{ opacity: 0.3 }} />
                          <select value={item.productId} onChange={(e) => updateItem(item.id, 'productId', e.target.value)} style={{ flex: 1, fontSize: '0.75rem', fontWeight: '600' }} disabled={!item.mainGroupId}>
                            <option value="">-- Select Item --</option>
                            {getProducts(item.subgroupId, item.mainGroupId).map(p => (
                              <option key={p.id} value={p.id}>{p.sku} | {p.name}</option>
                            ))}
                          </select>
                          {item.productId && (
                            <div style={{ padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: '700', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                              Curr. Stock: {stock}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.4rem' }}>
                        <input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} style={{ fontSize: '0.8125rem' }} />
                      </td>
                      <td style={{ padding: '0.4rem' }}>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '0.3rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>£</span>
                          <input type="number" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} step="0.01" style={{ paddingLeft: '1rem', fontSize: '0.8125rem' }} />
                        </div>
                      </td>
                      <td style={{ padding: '0.4rem', textAlign: 'right', fontWeight: '700' }}>
                        £{calculateItemTotal(item).toFixed(2)}
                      </td>
                      <td style={{ padding: '0.4rem', textAlign: 'center' }}>
                        <button type="button" onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--status-danger)', cursor: 'pointer' }}>
                          <X size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end', borderTop: '2px solid var(--border)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '2rem', fontSize: '1.25rem', fontWeight: '800', color: '#6366f1' }}>
            <span>Order Total Cost:</span>
            <span>£{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', marginTop: '1rem' }}>
        <button type="button" onClick={addItem} className="btn-secondary" style={{ padding: '0.6rem 1.5rem' }}>
          <Plus size={18} /> Add Item
        </button>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/purchase-orders" className="btn-secondary" style={{ padding: '0.6rem 1.5rem' }}>Close</Link>
          <button type="submit" className="btn-primary" style={{ padding: '0.6rem 2rem', background: '#6366f1' }}>
            <Save size={18} style={{ marginRight: '0.5rem' }} /> Save PO
          </button>
        </div>
      </div>
    </form>
  );
}
