'use client';

import { Trash2, Loader2, Check, X } from 'lucide-react';
import { useState, useTransition } from 'react';

export default function DeleteButton({ action, id, label }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      try {
        await action(id);
      } catch (error) {
        console.error("Delete failed:", error);
        alert(error.message || "Failed to delete record.");
        setIsConfirming(false);
      }
    });
  };

  const toggleConfirm = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsConfirming(true);
  };

  const cancelConfirm = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsConfirming(false);
  };

  if (isPending) {
    return (
      <div style={{ padding: '0.25rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={14} className="animate-spin" />
      </div>
    );
  }

  if (isConfirming) {
    return (
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px', 
          background: 'rgba(239, 68, 68, 0.05)', 
          padding: '2px 4px', 
          borderRadius: '4px',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          animation: 'fadeIn 0.2s ease'
        }}
        onMouseLeave={() => setIsConfirming(false)}
      >
        <span style={{ fontSize: '10px', fontWeight: '800', color: '#ef4444', textTransform: 'uppercase', marginRight: '2px' }}>OK?</span>
        <button 
          onClick={handleDelete}
          style={{ background: '#22c55e', border: 'none', padding: '2px', borderRadius: '3px', cursor: 'pointer', color: 'white', display: 'flex' }}
          title="Confirm Delete"
        >
          <Check size={12} />
        </button>
        <button 
          onClick={cancelConfirm}
          style={{ background: '#ef4444', border: 'none', padding: '2px', borderRadius: '3px', cursor: 'pointer', color: 'white', display: 'flex' }}
          title="Cancel"
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleConfirm}
      style={{ 
        background: 'none',
        border: 'none',
        color: 'var(--muted-foreground)',
        padding: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.2s ease',
        borderRadius: '4px'
      }}
      className="delete-icon-btn"
      title={`Delete ${label}`}
    >
      <Trash2 size={16} />
      <style dangerouslySetInnerHTML={{ __html: `
        .delete-icon-btn:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444 !important; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}} />
    </button>
  );
}
