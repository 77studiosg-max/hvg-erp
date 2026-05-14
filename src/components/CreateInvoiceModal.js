'use client';

import { useState } from 'react';
import { X, CheckCircle, FileText } from 'lucide-react';
import { createInvoiceFromSO } from '@/app/actions/invoicing';
import { useRouter } from 'next/navigation';

export default function CreateInvoiceModal({ order, products, onClose }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize state with quantities remaining to be invoiced
  // We can only invoice what has been DELIVERED but NOT YET INVOICED.
  const [invoiceData, setInvoiceData] = useState(
    order.items.map(item => {
      const delivered = item.deliveredQuantity || 0;
      const invoiced = item.invoicedQuantity || 0;
      const invoiceable = Math.max(0, delivered - invoiced);
      return {
        id: item.id,
        productId: item.productId,
        customDescription: item.customDescription || '',
        unitPrice: item.unitPrice,
        delivered: delivered,
        previouslyInvoiced: invoiced,
        toInvoice: invoiceable,
      };
    })
  );

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? `${product.sku} | ${product.name}` : 'Unknown Product';
  };

  const handleQuantityChange = (id, value) => {
    setInvoiceData(prev => prev.map(item => 
      item.id === id ? { ...item, toInvoice: Math.max(0, parseFloat(value) || 0) } : item
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const itemsToInvoice = invoiceData.map(item => ({
        id: item.id,
        productId: item.productId,
        customDescription: item.customDescription,
        unitPrice: item.unitPrice,
        quantityToInvoice: item.toInvoice
      })).filter(item => item.quantityToInvoice > 0);
      
      if (itemsToInvoice.length > 0) {
        const res = await createInvoiceFromSO(order.id, itemsToInvoice);
        if (res.success && res.invoiceId) {
          router.push(`/invoices/${res.invoiceId}`);
        }
      } else {
        router.refresh();
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to create invoice:', error);
      setIsSubmitting(false);
    }
  };

  // Check if there is anything to invoice
  const hasInvoiceableItems = invoiceData.some(i => (i.delivered - i.previouslyInvoiced) > 0);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '800px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={24} style={{ color: 'var(--primary)' }} />
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Create Invoice (SO: {order.orderNumber})</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}>
            <X size={24} />
          </button>
        </div>
        
        {!hasInvoiceableItems ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--status-warning)' }}>
            There are no delivered items left to invoice. You must dispatch goods before you can invoice them.
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
              Enter the quantity of items you want to bill now. You can only invoice items that have already been delivered.
            </p>

            <form onSubmit={handleSubmit}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--muted-foreground)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem' }}>Product</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Delivered</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Already Invoiced</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Invoiceable</th>
                    <th style={{ padding: '0.75rem', width: '150px' }}>Invoicing Now</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.map(item => {
                    const invoiceable = Math.max(0, item.delivered - item.previouslyInvoiced);
                    const isFullyInvoiced = invoiceable === 0;
                    
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', fontWeight: '500' }}>
                          {getProductName(item.productId)}
                        </td>
                        <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>{item.delivered}</td>
                        <td style={{ padding: '1rem 0.75rem', textAlign: 'center', color: item.previouslyInvoiced > 0 ? 'var(--status-success)' : 'inherit' }}>
                          {item.previouslyInvoiced}
                        </td>
                        <td style={{ padding: '1rem 0.75rem', textAlign: 'center', fontWeight: '600', color: isFullyInvoiced ? 'var(--status-success)' : 'var(--status-warning)' }}>
                          {isFullyInvoiced ? 'Done' : invoiceable}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {isFullyInvoiced ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--status-success)', fontSize: '0.875rem' }}>
                              <CheckCircle size={16} /> Fully Billed
                            </span>
                          ) : (
                            <input 
                              type="number" 
                              min="0" 
                              max={invoiceable} 
                              step="0.01"
                              value={item.toInvoice} 
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
                <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ background: '#6366f1', color: '#fff', border: 'none' }}>
                  {isSubmitting ? 'Creating...' : 'Generate Invoice'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
