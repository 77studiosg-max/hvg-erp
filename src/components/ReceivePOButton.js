'use client';

import { useState } from 'react';
import { PackageCheck } from 'lucide-react';
import ReceivePOModal from './ReceivePOModal';

export default function ReceivePOButton({ order, products }) {
  const [isOpen, setIsOpen] = useState(false);

  // If order is fully received, don't show the button or show it disabled
  const fullyReceived = order.status === 'Received';

  if (fullyReceived) return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="btn-primary" 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', background: 'var(--status-success)', border: 'none' }}
      >
        <PackageCheck size={18} /> Book In Goods
      </button>

      {isOpen && (
        <ReceivePOModal 
          order={order} 
          products={products} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  );
}
