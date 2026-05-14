'use client';

import { useState } from 'react';
import { X, CheckCircle, Package } from 'lucide-react';
import { receivePOItems } from '@/app/actions/purchase-orders';
import { useRouter } from 'next/navigation';

export default function ReceivePOModal({ order, products, onClose }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize state with quantities remaining to be received
  const [receiveData, setReceiveData] = useState(
    order.items.map(item => ({
      id: item.id,
      productId: item.productId,
      ordered: item.quantity,
      previouslyReceived: item.receivedQuantity || 0,
      toReceive: Math.max(0, item.quantity - (item.receivedQuantity || 0)),
    }))
  );

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? `${product.sku} | ${product.name}` : 'Unknown Product';
  };

  const handleQuantityChange = (id, value) => {
    setReceiveData(prev => prev.map(item => 
      item.id === id ? { ...item, toReceive: Math.max(0, parseFloat(value) || 0) } : item
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const itemsToReceive = receiveData.map(item => ({
        id: item.id,
        productId: item.productId,
        quantityToReceive: item.toReceive
      })).filter(item => item.quantityToReceive > 0);
      
      if (itemsToReceive.length > 0) {
        await receivePOItems(order.id, itemsToReceive);
      }
      
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Failed to receive items:', error);
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
            <Package size={24} style={{ color: 'var(--primary)' }} />
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Book In Goods (PO: {order.poNumber})</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}>
            <X size={24} />
          </button>
        </div>
        
        <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
          Enter the quantity of items received to update stock levels. You can do a partial receipt.
        </p>

        <form onSubmit={handleSubmit}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--muted-foreground)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem' }}>Product</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Ordered</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Already Recv.</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Remaining</th>
                <th style={{ padding: '0.75rem', width: '150px' }}>Now Receiving</th>
              </tr>
            </thead>
            <tbody>
              {receiveData.map(item => {
                const remaining = Math.max(0, item.ordered - item.previouslyReceived);
                const isFullyReceived = remaining === 0;
                
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', fontWeight: '500' }}>
                      {getProductName(item.productId)}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>{item.ordered}</td>
                    <td style={{ padding: '1rem 0.75rem', textAlign: 'center', color: item.previouslyReceived > 0 ? 'var(--status-success)' : 'inherit' }}>
                      {item.previouslyReceived}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', textAlign: 'center', fontWeight: '600', color: isFullyReceived ? 'var(--status-success)' : 'var(--status-warning)' }}>
                      {isFullyReceived ? 'Done' : remaining}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {isFullyReceived ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--status-success)', fontSize: '0.875rem' }}>
                          <CheckCircle size={16} /> Fully Received
                        </span>
                      ) : (
                        <input 
                          type="number" 
                          min="0" 
                          max={remaining * 2} // allow over-receiving just in case
                          step="0.01"
                          value={item.toReceive} 
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
            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ background: 'var(--status-success)', color: '#fff', border: 'none' }}>
              {isSubmitting ? 'Booking In...' : 'Confirm Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
