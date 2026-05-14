'use client';

import { ShoppingCart } from 'lucide-react';
import { useFormStatus } from 'react-dom';

export default function ConvertQuoteButton({ action, id }) {
  const { pending } = useFormStatus();

  return (
    <form action={() => action(id)}>
      <button 
        type="submit"
        disabled={pending}
        style={{ 
          background: 'none', 
          color: '#10b981', // emerald-500
          fontWeight: '600', 
          padding: 0,
          border: 'none',
          cursor: pending ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.875rem',
          opacity: pending ? 0.5 : 1
        }}
      >
        <ShoppingCart size={16} />
        {pending ? 'Converting...' : 'Convert to SO'}
      </button>
    </form>
  );
}
