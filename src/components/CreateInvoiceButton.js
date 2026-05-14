'use client';

import { useState } from 'react';
import { FilePlus } from 'lucide-react';
import CreateInvoiceModal from './CreateInvoiceModal';

export default function CreateInvoiceButton({ order, products }) {
  const [isOpen, setIsOpen] = useState(false);

  // If order is fully invoiced, don't show the button
  // Actually, we should check if there are ANY delivered items that haven't been invoiced.
  const hasInvoiceableItems = order.items.some(i => (i.deliveredQuantity || 0) > (i.invoicedQuantity || 0));

  if (!hasInvoiceableItems) return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="btn-primary" 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', background: '#8b5cf6', border: 'none' }}
      >
        <FilePlus size={18} /> Create Invoice
      </button>

      {isOpen && (
        <CreateInvoiceModal 
          order={order} 
          products={products} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  );
}
