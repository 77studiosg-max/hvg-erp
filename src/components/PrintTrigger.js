'use client';

export default function PrintTrigger() {
  return (
    <button 
      onClick={() => window.print()} 
      style={{ 
        background: '#1a365d', 
        color: 'white', 
        border: 'none', 
        padding: '10px 20px', 
        borderRadius: '5px', 
        cursor: 'pointer', 
        fontWeight: 'bold' 
      }}
    >
      Confirm & Print PDF
    </button>
  );
}
