'use client';

import { useState } from 'react';
import { PackageOpen } from 'lucide-react';
import DispatchSOModal from './DispatchSOModal';

export default function DispatchSOButton({ order, products }) {
  const [isOpen, setIsOpen] = useState(false);

  // If order is fully shipped, don't show the button
  const fullyShipped = order.status === 'Shipped' || order.status === 'Delivered';

  if (fullyShipped) return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="btn-primary" 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', background: '#3b82f6', border: 'none' }}
      >
        <PackageOpen size={18} /> Create Delivery Note
      </button>

      {isOpen && (
        <DispatchSOModal 
          order={order} 
          products={products} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  );
}
