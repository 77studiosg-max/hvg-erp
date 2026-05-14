'use client';

import { useState } from 'react';
import { X, CheckCircle, Truck } from 'lucide-react';
import { dispatchSalesOrder } from '@/app/actions/so-dispatch';
import { useRouter } from 'next/navigation';

export default function DispatchSOModal({ order, products, onClose }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize state with quantities remaining to be dispatched
  const [dispatchData, setDispatchData] = useState(
    order.items.map(item => ({
      id: item.id,
      productId: item.productId,
      customDescription: item.customDescription || '',
      ordered: item.quantity,
      previouslyDelivered: item.deliveredQuantity || 0,
      toDispatch: Math.max(0, item.quantity - (item.deliveredQuantity || 0)),
    }))
  );

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? `${product.sku} | ${product.name}` : 'Unknown Product';
  };

  const handleQuantityChange = (id, value) => {
    setDispatchData(prev => prev.map(item => 
      item.id === id ? { ...item, toDispatch: Math.max(0, parseFloat(value) || 0) } : item
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const itemsToDispatch = dispatchData.map(item => ({
        id: item.id,
        productId: item.productId,
        customDescription: item.customDescription,
        quantityToDispatch: item.toDispatch
      })).filter(item => item.quantityToDispatch > 0);
      
      if (itemsToDispatch.length > 0) {
        const res = await dispatchSalesOrder(order.id, itemsToDispatch);
        if (res.success && res.deliveryNoteId) {
          // Could redirect to print page here, or just refresh and let them click it.
          // Let's just refresh the page so they see the Delivery Note in the list.
        }
      }
      
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Failed to dispatch items:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '800px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Truck size={24} style={{ color: 'var(--primary)' }} />
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Dispatch Goods (SO: {order.orderNumber})</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}>
            <X size={24} />
          </button>
        </div>
        
        <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
          Enter the quantity of items you are dispatching now. This will create a Delivery Note and decrement stock.
        </p>

        <form onSubmit={handleSubmit}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--muted-foreground)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem' }}>Product</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Ordered</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Previously Sent</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Remaining</th>
                <th style={{ padding: '0.75rem', width: '150px' }}>Dispatching Now</th>
              </tr>
            </thead>
            <tbody>
              {dispatchData.map(item => {
                const remaining = Math.max(0, item.ordered - item.previouslyDelivered);
                const isFullyDispatched = remaining === 0;
                
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', fontWeight: '500' }}>
                      {getProductName(item.productId)}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>{item.ordered}</td>
                    <td style={{ padding: '1rem 0.75rem', textAlign: 'center', color: item.previouslyDelivered > 0 ? 'var(--status-success)' : 'inherit' }}>
                      {item.previouslyDelivered}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', textAlign: 'center', fontWeight: '600', color: isFullyDispatched ? 'var(--status-success)' : 'var(--status-warning)' }}>
                      {isFullyDispatched ? 'Done' : remaining}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {isFullyDispatched ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--status-success)', fontSize: '0.875rem' }}>
                          <CheckCircle size={16} /> Fully Sent
                        </span>
                      ) : (
                        <input 
                          type="number" 
                          min="0" 
                          max={remaining * 2} // allow over-dispatch just in case
                          step="0.01"
                          value={item.toDispatch} 
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)' }}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ background: '#3b82f6', color: '#fff', border: 'none' }}>
              {isSubmitting ? 'Creating Delivery Note...' : 'Create Delivery Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
