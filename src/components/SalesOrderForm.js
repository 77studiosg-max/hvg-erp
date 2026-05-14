'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Save, X, Search, Percent, Calculator, ChevronRight, ChevronDown, Package, AlertCircle, ShoppingCart, Layers } from 'lucide-react';
import { createPOFromItems } from '@/app/actions/purchase-orders';

export default function SalesOrderForm({ action, initialData, customers, products, categories = [], vendors = [] }) {
  const [items, setItems] = useState(() => {
    return (initialData?.items?.map(i => {
      let mainGroupId = '';
      let subgroupId = '';
      let subSubgroupId = '';
      
      if (i.productId && products.length > 0) {
        const product = products.find(p => p.id === i.productId);
        if (product && product.categoryId) {
          const cat = categories.find(c => c.id === product.categoryId);
          if (cat) {
            const p1 = cat.parentId ? categories.find(c => c.id === cat.parentId) : null;
            const p2 = p1 && p1.parentId ? categories.find(c => c.id === p1.parentId) : null;
            
            if (p2) {
              mainGroupId = p2.id;
              subgroupId = p1.id;
              subSubgroupId = cat.id;
            } else if (p1) {
              mainGroupId = p1.id;
              subgroupId = cat.id;
              subSubgroupId = '';
            } else {
              mainGroupId = cat.id;
              subgroupId = '';
              subSubgroupId = '';
            }
          }
        }
      }

      return {
        ...i,
        mainGroupId,
        subgroupId,
        subSubgroupId,
        customDescription: i.customDescription || '',
        bomItems: i.bomItems?.map(bom => {
          let bMainGroupId = '';
          let bSubgroupId = '';
          let bSubSubgroupId = '';
          if (bom.productId) {
            const bProd = products.find(p => p.id === bom.productId);
            if (bProd && bProd.categoryId) {
              const bCat = categories.find(c => c.id === bProd.categoryId);
              if (bCat) {
                const bp1 = bCat.parentId ? categories.find(c => c.id === bCat.parentId) : null;
                const bp2 = bp1 && bp1.parentId ? categories.find(c => c.id === bp1.parentId) : null;
                
                if (bp2) {
                  bMainGroupId = bp2.id;
                  bSubgroupId = bp1.id;
                  bSubSubgroupId = bCat.id;
                } else if (bp1) {
                  bMainGroupId = bp1.id;
                  bSubgroupId = bCat.id;
                  bSubSubgroupId = '';
                } else {
                  bMainGroupId = bCat.id;
                  bSubgroupId = '';
                  bSubSubgroupId = '';
                }
              }
            }
          }
          return { ...bom, mainGroupId: bMainGroupId, subgroupId: bSubgroupId, subSubgroupId: bSubSubgroupId };
        }) || [],
        isCollapsed: true
      };
    }) || []);
  });
  const [customerId, setCustomerId] = useState(initialData?.customerId || '');
  const [status, setStatus] = useState(initialData?.status || 'Pending');
  const [vatRate, setVatRate] = useState(initialData?.vatRate ?? 20);
  const [globalDiscount, setGlobalDiscount] = useState(initialData?.discount ?? 0);
  const [selectedForPo, setSelectedForPo] = useState(new Set());
  const [poVendorId, setPoVendorId] = useState('');
  const [isCreatingPo, setIsCreatingPo] = useState(false);

  const togglePoSelection = (itemId) => {
    const newSelection = new Set(selectedForPo);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedForPo(newSelection);
  };

  const handleCreatePO = async () => {
    if (!poVendorId || selectedForPo.size === 0) return;
    setIsCreatingPo(true);
    try {
      const itemsToPo = items.filter(i => selectedForPo.has(i.id));
      const res = await createPOFromItems(poVendorId, itemsToPo);
      if (res?.success) {
        alert('Purchase Order Created Successfully!');
        setSelectedForPo(new Set());
      }
    } catch (e) {
      console.error(e);
      alert('Failed to create PO');
    }
    setIsCreatingPo(false);
  };

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), productId: '', quantity: 1, unitPrice: 0, margin: 0, mainGroupId: '', subgroupId: '', subSubgroupId: '', customDescription: '', bomItems: [] }]);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
    if (selectedForPo.has(id)) {
      const newSel = new Set(selectedForPo);
      newSel.delete(id);
      setSelectedForPo(newSel);
    }
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'mainGroupId') {
          updated.subgroupId = '';
          updated.subSubgroupId = '';
          updated.productId = '';
        } else if (field === 'subgroupId') {
          updated.subSubgroupId = '';
          updated.productId = '';
        } else if (field === 'subSubgroupId') {
          updated.productId = '';
        } else if (field === 'productId') {
          const product = products.find(p => p.id === value);
          if (product) {
            updated.unitPrice = product.price;
            if (!product.isBOM) {
              updated.bomItems = [];
              updated.customDescription = '';
            }
          }
        }
        return updated;
      }
      return item;
    }));
  };

  // BOM Actions
  const addBomItem = (parentId) => {
    setItems(items.map(item => {
      if (item.id === parentId) {
        return {
          ...item,
          bomItems: [...(item.bomItems || []), { id: crypto.randomUUID(), productId: '', quantity: 1, unitPrice: 0, margin: 0, mainGroupId: '', subgroupId: '', subSubgroupId: '' }]
        };
      }
      return item;
    }));
  };

  const removeBomItem = (parentId, bomId) => {
    setItems(items.map(item => {
      if (item.id === parentId) {
        return {
          ...item,
          bomItems: item.bomItems.filter(b => b.id !== bomId)
        };
      }
      return item;
    }));
  };

  const updateBomItem = (parentId, bomId, field, value) => {
    setItems(items.map(item => {
      if (item.id === parentId) {
        const updatedBom = item.bomItems.map(b => {
          if (b.id === bomId) {
            const upB = { ...b, [field]: value };
            if (field === 'mainGroupId') { upB.subgroupId = ''; upB.subSubgroupId = ''; upB.productId = ''; }
            else if (field === 'subgroupId') { upB.subSubgroupId = ''; upB.productId = ''; }
            else if (field === 'subSubgroupId') { upB.productId = ''; }
            else if (field === 'productId') {
              const product = products.find(p => p.id === value);
              if (product) upB.unitPrice = product.price;
            }
            return upB;
          }
          return b;
        });
        return { ...item, bomItems: updatedBom };
      }
      return item;
    }));
  };

  const mainGroups = useMemo(() => categories.filter(c => !c.parentId), [categories]);
  const getSubGroups = (mainId) => categories.filter(c => c.parentId === mainId);
  const getProducts = (subSubId, subId, mainId) => {
    const targetId = subSubId || subId || mainId;
    if (!targetId) return [];
    
    const descendantIds = [targetId];
    const findChildren = (parentId) => {
      categories.filter(c => c.parentId === parentId).forEach(child => {
        descendantIds.push(child.id);
        findChildren(child.id);
      });
    };
    findChildren(targetId);
    
    return products.filter(p => descendantIds.includes(p.categoryId));
  };

  const isBOMProduct = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product || !product.isBOM) return false;
    
    let currentCat = categories.find(c => c.id === product.categoryId);
    while (currentCat) {
      if (currentCat.bomEnabled) return true;
      if (!currentCat.parentId) break;
      currentCat = categories.find(c => c.id === currentCat.parentId);
    }
    return false;
  };

  const calculateBOMItemSalesPrice = (b) => {
    const cost = b.unitPrice || 0;
    const marg = b.margin || 0;
    if (marg >= 100) return cost;
    return cost / (1 - marg / 100);
  };

  const calculateItemSalesPrice = (item) => {
    if (isBOMProduct(item.productId) && item.bomItems?.length > 0) {
      return item.bomItems.reduce((sum, b) => sum + (calculateBOMItemSalesPrice(b) * b.quantity), 0);
    }
    const cost = item.unitPrice || 0;
    const itemMargin = item.margin || 0;
    if (itemMargin >= 100) return cost;
    return cost / (1 - itemMargin / 100);
  };

  const calculateItemCostPrice = (item) => {
    if (isBOMProduct(item.productId) && item.bomItems?.length > 0) {
      return item.bomItems.reduce((sum, b) => sum + ((b.unitPrice || 0) * b.quantity), 0);
    }
    return item.unitPrice || 0;
  };

  const calculateItemTotal = (item) => {
    return item.quantity * calculateItemSalesPrice(item);
  };

  const subtotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const discountAmount = subtotal * (globalDiscount / 100);
  const totalAfterDiscount = subtotal - discountAmount;
  const vatAmount = totalAfterDiscount * (vatRate / 100);
  const grandTotal = totalAfterDiscount + vatAmount;

  const getProductStock = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? (product.totalStock || 0) : null;
  };

  const productQuantities = useMemo(() => {
    const totals = {};
    items.forEach(item => {
      if (item.productId) {
        totals[item.productId] = (totals[item.productId] || 0) + (parseFloat(item.quantity) || 0);
      }
    });
    return totals;
  }, [items]);

  const isLocked = status === 'Delivered' || status === 'Invoiced';

  return (
    <form action={action} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <fieldset disabled={isLocked} style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <style>{`
        @keyframes premium-pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.3); border-color: rgba(239, 68, 68, 0.8); }
          50% { box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 1); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); border-color: rgba(239, 68, 68, 0.8); }
        }
        .qty-warning {
          animation: premium-pulse 2.5s ease-in-out infinite !important;
          border: 1px solid #ef4444 !important;
          color: #ef4444 !important;
          background-color: rgba(239, 68, 68, 0.05) !important;
          border-radius: 4px;
        }
      `}</style>
      <input type="hidden" name="itemsJson" value={JSON.stringify(items)} />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: 'span 2' }}>
          <label style={{ fontWeight: '700', fontSize: '0.875rem' }}>Customer *</label>
          <select name="customerId" value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
            <option value="">-- Select Customer --</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.companyName} ({c.customerNumber})</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: '700', fontSize: '0.875rem' }}>Status</label>
          <select name="status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Pending">Pending</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Invoiced">Invoiced</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>


      <div>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '700' }}>Line Items</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '1100px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)', fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>
                <th style={{ padding: '0.5rem', width: '30px', textAlign: 'center' }} title="Select for PO">PO</th>
                <th style={{ padding: '0.5rem', width: '30px' }}>Pos</th>
                <th style={{ padding: '0.5rem' }}>Group Hierarchy / Selection</th>
                <th style={{ padding: '0.5rem', width: '60px' }}>Qty</th>
                <th style={{ padding: '0.5rem', width: '100px' }}>Cost Price</th>
                <th style={{ padding: '0.5rem', width: '80px' }}>Margin %</th>
                <th style={{ padding: '0.5rem', width: '100px', textAlign: 'right' }}>Sales Price</th>
                <th style={{ padding: '0.5rem', width: '100px', textAlign: 'right' }}>Line Total</th>
                <th style={{ padding: '0.5rem', width: '30px' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
                    No items added.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const stock = getProductStock(item.productId);
                  const isBom = isBOMProduct(item.productId);
                  const totalRequested = productQuantities[item.productId] || 0;
                  const needsPo = !isBom && stock !== null && totalRequested > stock && item.quantity > 0;
                  
                  const isFullyDelivered = (item.deliveredQuantity || 0) >= item.quantity && item.quantity > 0;
                  const isPartiallyDelivered = (item.deliveredQuantity || 0) > 0 && !isFullyDelivered;
                  
                  const itemCost = calculateItemCostPrice(item);
                  const itemSalesPrice = calculateItemSalesPrice(item);
                  const itemTotal = calculateItemTotal(item);

                  return (
                    <tr key={item.id}>
                      <td colSpan="9" style={{ padding: '0.2rem 0' }}>
                        <div style={{ 
                          background: isFullyDelivered ? 'rgba(16, 185, 129, 0.1)' : 
                                      isPartiallyDelivered ? 'rgba(245, 158, 11, 0.1)' : 
                                      needsPo ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.12)', 
                          border: `1px solid ${
                            isFullyDelivered ? '#10b981' : 
                            isPartiallyDelivered ? '#f59e0b' : 
                            needsPo ? 'rgba(239, 68, 68, 0.5)' : 'var(--border)'
                          }`,
                          borderRadius: '0.5rem',
                          padding: '0.4rem 0.8rem',
                          boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.1)',
                          position: 'relative',
                          transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
                          cursor: 'default'
                        }}>
                          <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                          <div style={{ width: '30px', padding: '0.4rem', textAlign: 'center' }}>
                            {needsPo && (
                              <input 
                                type="checkbox" 
                                checked={selectedForPo.has(item.id)} 
                                onChange={() => togglePoSelection(item.id)}
                                style={{ cursor: 'pointer' }}
                              />
                            )}
                          </div>
                          <div style={{ width: '30px', padding: '0.4rem', color: 'var(--muted-foreground)', fontSize: '0.75rem', fontWeight: 'bold', textAlign: 'center' }}>
                            {index + 1}.
                          </div>
                          <div style={{ flex: 1, padding: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                              <select 
                                value={item.mainGroupId} 
                                onChange={(e) => updateItem(item.id, 'mainGroupId', e.target.value)}
                                style={{ width: '120px', fontSize: '0.75rem', padding: '0.3rem' }}
                              >
                                <option value="">-- Main Group --</option>
                                {mainGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                              </select>
                              <ChevronRight size={12} style={{ opacity: 0.3 }} />
                              <select 
                                value={item.subgroupId} 
                                onChange={(e) => updateItem(item.id, 'subgroupId', e.target.value)}
                                style={{ width: '120px', fontSize: '0.75rem', padding: '0.3rem' }}
                                disabled={!item.mainGroupId}
                              >
                                <option value="">-- Subgroup --</option>
                                {getSubGroups(item.mainGroupId).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                              </select>

                              {item.subgroupId && getSubGroups(item.subgroupId).length > 0 && (
                                <>
                                  <ChevronRight size={12} style={{ opacity: 0.3 }} />
                                  <select 
                                    value={item.subSubgroupId || ''} 
                                    onChange={(e) => updateItem(item.id, 'subSubgroupId', e.target.value)}
                                    style={{ width: '120px', fontSize: '0.75rem', padding: '0.3rem' }}
                                  >
                                    <option value="">-- Sub-sub --</option>
                                    {getSubGroups(item.subgroupId).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                  </select>
                                </>
                              )}

                              <ChevronRight size={12} style={{ opacity: 0.3 }} />
                              <div style={{ flex: 1, minWidth: '180px', position: 'relative' }}>
                                  <select 
                                    value={item.productId} 
                                    onChange={(e) => updateItem(item.id, 'productId', e.target.value)}
                                    style={{ width: '100%', fontSize: '0.75rem', padding: '0.3rem', fontWeight: '600', color: item.productId ? 'transparent' : 'inherit' }}
                                    disabled={!item.mainGroupId}
                                  >
                                    <option value="">-- Select Item --</option>
                                    {getProducts(item.subSubgroupId, item.subgroupId, item.mainGroupId).map(p => (
                                      <option key={p.id} value={p.id} style={{ color: 'var(--foreground)' }}>
                                        {p.name} (Stock: {p.totalStock ?? 0}) {p.mblValue ? `[MBL: ${p.mblValue} ${p.mblUnit || 'kN'}]` : ''}
                                      </option>
                                    ))}
                                  </select>
                                  {item.productId && (
                                    <div style={{ 
                                      position: 'absolute', left: '0.4rem', top: '50%', transform: 'translateY(-50%)', 
                                      pointerEvents: 'none', fontSize: '0.75rem', fontWeight: '600', color: 'var(--foreground)',
                                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 'calc(100% - 2rem)',
                                      display: 'flex', alignItems: 'center', gap: '0.4rem'
                                    }}>
                                      <span>{products.find(p => p.id === item.productId)?.name}</span>
                                      {products.find(p => p.id === item.productId)?.mblValue && (
                                        <span style={{ color: '#f59e0b', fontSize: '0.65rem', background: 'rgba(245, 158, 11, 0.1)', padding: '0.05rem 0.3rem', borderRadius: '0.2rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                          MBL: {products.find(p => p.id === item.productId).mblValue} {products.find(p => p.id === item.productId).mblUnit || 'kN'}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              
                              {item.productId && !isBom && (
                                  <div style={{ 
                                    marginLeft: '0.5rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: '700',
                                    backgroundColor: stock > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: stock > 0 ? '#22c55e' : '#ef4444',
                                    border: `1px solid ${stock > 0 ? '#22c55e' : '#ef4444'}`
                                  }}>
                                    Stock: {stock}
                                  </div>
                              )}
                              {isBom && (
                                <div style={{ marginLeft: '0.5rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: '700', backgroundColor: '#8b5cf620', color: '#8b5cf6', border: '1px solid #8b5cf6' }}>
                                  ASSEMBLY
                                </div>
                              )}
                            </div>

                            {isBom && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.4rem' }}>
                                <label style={{ fontSize: '0.65rem', fontWeight: '800', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                                  Sling Specification / Description (Printable):
                                </label>
                                <textarea 
                                  placeholder="Enter detailed description for this sling (e.g. 4-leg wire rope sling, 5m length, Masterlink HA25ML, Hooks with safety latches...)"
                                  value={item.customDescription}
                                  onChange={(e) => updateItem(item.id, 'customDescription', e.target.value)}
                                  style={{ 
                                    width: '100%', 
                                    fontSize: '0.875rem', 
                                    padding: '0.6rem', 
                                    border: '1px solid rgba(99, 102, 241, 0.4)',
                                    borderRadius: '0.25rem',
                                    background: 'rgba(0, 0, 0, 0.25)',
                                    color: '#ffffff',
                                    fontWeight: '500',
                                    minHeight: '80px',
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                    lineHeight: '1.5'
                                  }}
                                />
                              </div>
                            )}
                          </div>
                          
                          <div style={{ width: '60px', padding: '0.4rem' }}>
                            <input 
                              type="number" 
                              value={item.quantity} 
                              onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              step="any"
                              min="0"
                              className={needsPo ? "qty-warning" : ""}
                              style={{ 
                                width: '100%', fontSize: '0.8125rem', padding: '0.3rem', boxSizing: 'border-box',
                                color: (item.deliveredQuantity || 0) >= item.quantity && item.quantity > 0 ? '#10b981' : 'inherit',
                                fontWeight: (item.deliveredQuantity || 0) >= item.quantity && item.quantity > 0 ? '700' : 'normal'
                              }}
                            />
                          </div>
                          <div style={{ width: '100px', padding: '0.4rem' }}>
                            <div style={{ position: 'relative' }}>
                              <span style={{ position: 'absolute', left: '0.3rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', fontSize: '0.7rem' }}>£</span>
                              <input 
                                type="number" 
                                value={isBom ? itemCost.toFixed(2) : item.unitPrice} 
                                onChange={(e) => !isBom && updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                step="0.01"
                                disabled={isBom}
                                style={{ width: '100%', paddingLeft: '1rem', fontSize: '0.8125rem', paddingRight: '0.3rem', paddingTop: '0.3rem', paddingBottom: '0.3rem', background: isBom ? 'var(--secondary)' : 'var(--background)' }}
                              />
                            </div>
                          </div>
                          <div style={{ width: '80px', padding: '0.4rem' }}>
                            <div style={{ position: 'relative' }}>
                              <input 
                                type="number" 
                                value={item.margin || 0} 
                                onChange={(e) => !isBom && updateItem(item.id, 'margin', parseFloat(e.target.value) || 0)}
                                step="0.1"
                                disabled={isBom}
                                style={{ width: '100%', paddingRight: '0.8rem', fontSize: '0.8125rem', textAlign: 'right', padding: '0.3rem', background: isBom ? 'var(--secondary)' : 'var(--background)' }}
                              />
                              <span style={{ position: 'absolute', right: '0.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', fontSize: '0.7rem' }}>%</span>
                            </div>
                          </div>
                          <div style={{ width: '100px', padding: '0.4rem', textAlign: 'right', fontSize: '0.8125rem', color: 'var(--foreground)', fontWeight: '600' }}>
                            £{itemSalesPrice.toFixed(2)}
                          </div>
                          <div style={{ width: '100px', padding: '0.4rem', textAlign: 'right', fontWeight: '700', fontSize: '0.875rem' }}>
                            £{itemTotal.toFixed(2)}
                          </div>
                          <div style={{ width: '30px', padding: '0.4rem', textAlign: 'center' }}>
                            {!isLocked && (
                              <button type="button" onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--status-danger)', cursor: 'pointer' }}>
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* BOM CONFIGURATOR SUB-TABLE */}
                        {isBom && (
                          <div style={{ 
                            marginLeft: '70px', 
                            marginTop: '0.5rem',
                            marginBottom: item.isCollapsed ? '0.5rem' : '1rem', 
                            padding: item.isCollapsed ? '0.4rem 1rem' : '1rem', 
                            background: '#f8fafc', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: '0.5rem' 
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: item.isCollapsed ? '0' : '0.5rem' }}>
                              <div 
                                onClick={() => !isLocked && updateItem(item.id, 'isCollapsed', !item.isCollapsed)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: !isLocked ? 'pointer' : 'default', color: '#334155' }}
                              >
                                {item.isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                                <h4 style={{ margin: 0, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <Layers size={14} /> Assembly Components (BOM for 1 unit)
                                </h4>
                                {item.isCollapsed && (
                                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic' }}>
                                    ({item.bomItems?.length || 0} components) - Click to expand
                                  </span>
                                )}
                              </div>
                              {!isLocked && (
                                <button type="button" onClick={() => addBomItem(item.id)} className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                                  <Plus size={12} /> Add Component
                                </button>
                              )}
                            </div>
                            
                            {!item.isCollapsed && (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid #cbd5e1', fontSize: '0.65rem', color: '#64748b', textAlign: 'left' }}>
                                  <th style={{ padding: '0.3rem' }}>Component</th>
                                  <th style={{ padding: '0.3rem', width: '60px' }}>Qty</th>
                                  <th style={{ padding: '0.3rem', width: '90px' }}>Cost Price</th>
                                  <th style={{ padding: '0.3rem', width: '70px' }}>Margin %</th>
                                  <th style={{ padding: '0.3rem', width: '90px', textAlign: 'right' }}>Sales Price</th>
                                  <th style={{ padding: '0.3rem', width: '30px' }}></th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.bomItems?.map((bom, bIndex) => {
                                  const bomStock = getProductStock(bom.productId);
                                  return (
                                    <tr key={bom.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                      <td style={{ padding: '0.3rem' }}>
                                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                          <select 
                                            value={bom.mainGroupId || ''} 
                                            onChange={(e) => updateBomItem(item.id, bom.id, 'mainGroupId', e.target.value)}
                                            style={{ width: '100px', fontSize: '0.75rem', padding: '0.3rem' }}
                                          >
                                            <option value="">-- Group --</option>
                                            {mainGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                          </select>
                                          <ChevronRight size={10} style={{ opacity: 0.3 }} />
                                          <select 
                                            value={bom.subgroupId || ''} 
                                            onChange={(e) => updateBomItem(item.id, bom.id, 'subgroupId', e.target.value)}
                                            style={{ width: '100px', fontSize: '0.75rem', padding: '0.3rem' }}
                                            disabled={!bom.mainGroupId}
                                          >
                                            <option value="">-- Sub --</option>
                                            {getSubGroups(bom.mainGroupId).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                          </select>

                                          {bom.subgroupId && getSubGroups(bom.subgroupId).length > 0 && (
                                            <>
                                              <ChevronRight size={10} style={{ opacity: 0.3 }} />
                                              <select 
                                                value={bom.subSubgroupId || ''} 
                                                onChange={(e) => updateBomItem(item.id, bom.id, 'subSubgroupId', e.target.value)}
                                                style={{ width: '100px', fontSize: '0.75rem', padding: '0.3rem' }}
                                              >
                                                <option value="">-- Sub2 --</option>
                                                {getSubGroups(bom.subgroupId).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                              </select>
                                            </>
                                          )}

                                          <ChevronRight size={10} style={{ opacity: 0.3 }} />
                                          <div style={{ flex: 1, minWidth: '150px', position: 'relative' }}>
                                              <select 
                                                value={bom.productId || ''} 
                                                onChange={(e) => updateBomItem(item.id, bom.id, 'productId', e.target.value)}
                                                style={{ width: '100%', fontSize: '0.75rem', padding: '0.3rem', fontWeight: '600', color: bom.productId ? 'transparent' : 'inherit' }}
                                                disabled={!bom.mainGroupId}
                                              >
                                                <option value="">-- Component --</option>
                                                {getProducts(bom.subSubgroupId, bom.subgroupId, bom.mainGroupId).map(p => (
                                                  <option key={p.id} value={p.id} style={{ color: 'var(--foreground)' }}>
                                                  {p.name} (Stock: {p.totalStock ?? 0}) {p.mblValue ? `[MBL: ${p.mblValue} ${p.mblUnit || 'kN'}]` : ''}
                                                </option>
                                                ))}
                                              </select>
                                              {bom.productId && (
                                                <div style={{ 
                                                  position: 'absolute', left: '0.4rem', top: '50%', transform: 'translateY(-50%)', 
                                                  pointerEvents: 'none', fontSize: '0.75rem', fontWeight: '600', color: 'var(--foreground)',
                                                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 'calc(100% - 2rem)',
                                                  display: 'flex', alignItems: 'center', gap: '0.4rem'
                                                }}>
                                                  <span>{products.find(p => p.id === bom.productId)?.name}</span>
                                                  {products.find(p => p.id === bom.productId)?.mblValue && (
                                                    <span style={{ color: '#f59e0b', fontSize: '0.65rem', background: 'rgba(245, 158, 11, 0.1)', padding: '0.05rem 0.3rem', borderRadius: '0.2rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                                      MBL: {products.find(p => p.id === bom.productId).mblValue} {products.find(p => p.id === bom.productId).mblUnit || 'kN'}
                                                    </span>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          {bom.productId && (
                                               <div style={{ 
                                                 padding: '0.15rem 0.4rem', borderRadius: '0.2rem', fontSize: '0.65rem', fontWeight: '700',
                                                 backgroundColor: bomStock > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                 color: bomStock > 0 ? '#22c55e' : '#ef4444',
                                                 border: `1px solid ${bomStock > 0 ? '#22c55e' : '#ef4444'}`,
                                                 whiteSpace: 'nowrap'
                                               }}>
                                                 Stock: {bomStock}
                                               </div>
                                          )}
                                        </div>
                                      </td>
                                      <td style={{ padding: '0.3rem' }}>
                                        <input 
                                          type="number" value={bom.quantity} step="any" min="0"
                                          onChange={(e) => updateBomItem(item.id, bom.id, 'quantity', parseFloat(e.target.value) || 0)}
                                          style={{ width: '100%', fontSize: '0.75rem', padding: '0.2rem' }}
                                        />
                                      </td>
                                      <td style={{ padding: '0.3rem' }}>
                                        <div style={{ position: 'relative' }}>
                                          <span style={{ position: 'absolute', left: '0.2rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.6rem' }}>£</span>
                                          <input 
                                            type="number" value={bom.unitPrice} step="0.01" min="0"
                                            onChange={(e) => updateBomItem(item.id, bom.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                            style={{ width: '100%', paddingLeft: '0.8rem', fontSize: '0.75rem', paddingRight: '0.2rem', padding: '0.2rem 0.2rem 0.2rem 0.8rem' }}
                                          />
                                        </div>
                                      </td>
                                      <td style={{ padding: '0.3rem' }}>
                                        <div style={{ position: 'relative' }}>
                                          <input 
                                            type="number" value={bom.margin || 0} step="0.1"
                                            onChange={(e) => updateBomItem(item.id, bom.id, 'margin', parseFloat(e.target.value) || 0)}
                                            style={{ width: '100%', paddingRight: '0.8rem', fontSize: '0.75rem', textAlign: 'right', padding: '0.2rem 0.8rem 0.2rem 0.2rem' }}
                                          />
                                          <span style={{ position: 'absolute', right: '0.2rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.6rem' }}>%</span>
                                        </div>
                                      </td>
                                      <td style={{ padding: '0.3rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: 'var(--foreground)' }}>
                                        £{calculateBOMItemSalesPrice(bom).toFixed(2)}
                                      </td>
                                      <td style={{ padding: '0.3rem', textAlign: 'center' }}>
                                        {!isLocked && (
                                          <button type="button" onClick={() => removeBomItem(item.id, bom.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                            <X size={12} />
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                                {(!item.bomItems || item.bomItems.length === 0) && (
                                  <tr>
                                    <td colSpan="6" style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
                                      No components added. This assembly has 0 cost.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                            )}
                          </div>
                        )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '2rem', padding: '0.75rem 1rem', background: 'var(--secondary)', borderRadius: '0.5rem', width: 'fit-content', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '140px' }}>
              <label style={{ fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--muted-foreground)' }}>
                <Calculator size={12} /> Discount (%)
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="number" 
                  name="discount" 
                  value={globalDiscount} 
                  onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                  step="0.1"
                  style={{ paddingRight: '1.5rem', fontSize: '0.8125rem', padding: '0.35rem 0.5rem' }}
                />
                <span style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', fontSize: '0.75rem' }}>%</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '160px' }}>
              <label style={{ fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--muted-foreground)' }}>
                <Percent size={12} /> VAT Rate
              </label>
              <select 
                name="vatRate" 
                value={vatRate} 
                onChange={(e) => setVatRate(parseFloat(e.target.value))}
                style={{ fontSize: '0.8125rem', padding: '0.35rem 0.5rem' }}
              >
                <option value="0">0% (Zero)</option>
                <option value="5">5% (Reduced)</option>
                <option value="20">20% (Std)</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end', borderTop: '2px solid var(--border)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '2rem', fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
            <span>Subtotal (Net):</span>
            <span style={{ width: '100px', textAlign: 'right' }}>£{subtotal.toFixed(2)}</span>
          </div>
          {globalDiscount > 0 && (
            <div style={{ display: 'flex', gap: '2rem', fontSize: '0.8125rem', color: 'var(--status-danger)' }}>
              <span>Global Discount ({globalDiscount}%):</span>
              <span style={{ width: '100px', textAlign: 'right' }}>- £{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: '2rem', fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
            <span>VAT ({vatRate}%):</span>
            <span style={{ width: '100px', textAlign: 'right' }}>+ £{vatAmount.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', gap: '2rem', fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.5rem' }}>
            <span>Grand Total:</span>
            <span style={{ width: '120px', textAlign: 'right' }}>£{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {selectedForPo.size > 0 && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.5)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ShoppingCart size={20} color="#6366f1" />
              <span style={{ fontWeight: '600', color: '#1e293b' }}>
                Create PO for {selectedForPo.size} item(s)
              </span>
              <select 
                value={poVendorId} 
                onChange={(e) => setPoVendorId(e.target.value)}
                style={{ padding: '0.4rem', borderRadius: '0.25rem', border: '1px solid var(--border)', fontSize: '0.875rem' }}
              >
                <option value="">-- Select Vendor --</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.companyName}</option>
                ))}
              </select>
            </div>
            <button 
              type="button" 
              onClick={handleCreatePO} 
              disabled={!poVendorId || isCreatingPo}
              className="btn-primary" 
              style={{ background: '#6366f1', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
            >
              {isCreatingPo ? 'Creating PO...' : 'Create Purchase Order'}
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', marginTop: '1rem' }}>
        {!isLocked ? (
          <button type="button" onClick={addItem} className="btn-secondary" style={{ padding: '0.6rem 1.5rem' }}>
            <Plus size={18} /> Add Item
          </button>
        ) : <div />}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/sales-orders" className="btn-secondary" style={{ padding: '0.6rem 1.5rem' }}>Close</Link>
          {!isLocked && (
            <button type="submit" className="btn-primary" style={{ padding: '0.6rem 2rem' }}>
              <Save size={18} style={{ marginRight: '0.5rem' }} /> Save Order
            </button>
          )}
        </div>
      </div>
      </fieldset>
    </form>
  );
}
