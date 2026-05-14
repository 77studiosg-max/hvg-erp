'use client';

import { X } from 'lucide-react';

export default function CloseWindowButton() {
  return (
    <button 
      onClick={() => window.close()} 
      style={{ 
        background: '#e2e8f0', 
        color: '#475569', 
        border: 'none', 
        padding: '10px 20px', 
        borderRadius: '5px', 
        cursor: 'pointer', 
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}
    >
      <X size={18} /> Close Preview
    </button>
  );
}
