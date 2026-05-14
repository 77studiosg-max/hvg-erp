import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PrintTrigger from '@/components/PrintTrigger';
import SaveToSupabaseButton from '@/components/SaveToSupabaseButton';
import CloseWindowButton from '@/components/CloseWindowButton';

async function getDeliveryNoteData(id) {
  const note = await prisma.deliveryNote.findUnique({
    where: { id },
    include: {
      salesOrder: {
        include: {
          customer: true,
          items: true
        }
      },
      items: {
        include: {
          product: true
        }
      }
    }
  });
  
  if (!note) return null;

  const salesOrder = note.salesOrder;
  if (!salesOrder) return null;

  // Auto-update SO status if not already delivered (requested: status change on print if fulfilled)
  if (salesOrder.status !== 'Delivered') {
    const totalOrdered = salesOrder.items.reduce((acc, i) => acc + (i.quantity || 0), 0);
    const totalDelivered = salesOrder.items.reduce((acc, i) => acc + (i.deliveredQuantity || 0), 0);
    
    if (totalDelivered >= totalOrdered && totalOrdered > 0) {
      await prisma.salesOrder.update({
        where: { id: salesOrder.id },
        data: { status: 'Delivered' }
      });
      salesOrder.status = 'Delivered'; // Update local object for template
    }
  }

  return {
    ...note,
    orderNumber: salesOrder.orderNumber,
    customer: salesOrder.customer,
    items: note.items
  };
}

export default async function PrintDeliveryNotePage({ params }) {
  const { id } = await params;
  const note = await getDeliveryNoteData(id);
  
  if (!note) notFound();

  return (
    <div className="print-container">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        @media print {
          body { background: white !important; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          @page { size: A4 portrait; margin: 0; }
          .print-only { margin: 0 !important; box-shadow: none !important; width: 100% !important; padding: 15mm !important; }
        }

        body { background: #f0f2f5; margin: 0; font-family: 'Inter', sans-serif; color: #1e293b; }
        .print-only { background: white; width: 210mm; min-height: 297mm; margin: 40px auto; padding: 20mm; box-shadow: 0 10px 25px rgba(0,0,0,0.1); position: relative; display: flex; flex-direction: column; }
        .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
        .brand { display: flex; flex-direction: column; }
        .brand-name { font-size: 32px; font-weight: 800; color: #1a365d; letter-spacing: -1px; line-height: 1; margin-bottom: 4px; }
        .brand-tagline { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; font-weight: 600; }
        .doc-type { font-size: 36px; font-weight: 800; color: #3b82f6; text-transform: uppercase; margin: 0; line-height: 1; text-align: right; }
        .doc-meta { margin-top: 15px; display: grid; grid-template-columns: auto auto; gap: 5px 20px; font-size: 13px; justify-content: end; }
        .doc-meta label { font-weight: 600; color: #64748b; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-bottom: 40px; padding-top: 20px; border-top: 2px solid #f1f5f9; }
        .info-section h4 { font-size: 11px; text-transform: uppercase; color: #1a365d; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
        .info-content { font-size: 13px; line-height: 1.5; }
        .info-content strong { font-size: 15px; display: block; margin-bottom: 4px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { background: #1a365d; color: white; padding: 8px 10px; font-size: 11px; text-transform: uppercase; font-weight: 700; text-align: left; }
        .items-table td { padding: 4px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; vertical-align: middle; }
        .qty-cell { width: 80px; text-align: center; font-weight: 600; font-size: 14px !important; }
        .footer { margin-top: auto; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
        .signatures { display: flex; justify-content: space-between; margin-top: 50px; gap: 50px; }
        .signature-box { flex: 1; border-top: 1px solid #cbd5e1; padding-top: 5px; font-size: 11px; color: #64748b; }
      `}} />

      <div className="no-print" style={{ position: 'fixed', top: '20px', right: '20px', display: 'flex', gap: '10px', zIndex: 1000 }}>
        <CloseWindowButton />
        <SaveToSupabaseButton 
          docId={note.id} 
          docType="deliveryNote" 
          docNumber={note.noteNumber} 
        />
        <PrintTrigger />
      </div>

      <div className="print-only">
        <div className="header-top">
          <div className="brand">
            <span className="brand-name">HVG SOLUTIONS</span>
            <span className="brand-tagline">Industrial Lifting & Rigging Systems</span>
          </div>
          <div>
            <h1 className="doc-type">Delivery Note</h1>
            <div className="doc-meta">
              <label>Note No:</label> <span>{note.noteNumber}</span>
              <label>Sales Order:</label> <span>{note.orderNumber}</span>
              <label>Date:</label> <span>{new Date(note.date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-section">
            <h4>Deliver To</h4>
            <div className="info-content">
              <strong>{note.customer.companyName}</strong>
              {note.customer.addressLine1 && <div>{note.customer.addressLine1}</div>}
              <div>{note.customer.city} {note.customer.postcode}</div>
              <div>{note.customer.country}</div>
              <div style={{ marginTop: '8px' }}>Attn: {note.customer.contactName || 'Receiving Dept'}</div>
            </div>
          </div>
          <div className="info-section">
            <h4>Dispatch From</h4>
            <div className="info-content">
              <strong>HVG Solutions Ltd</strong>
              <div>123 Engineering Way, Industrial Park</div>
              <div>Aberdeen, AB12 3XY</div>
            </div>
          </div>
        </div>

        <table className="items-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>Pos</th>
              <th>Description</th>
              <th className="qty-cell">Qty Delivered</th>
            </tr>
          </thead>
          <tbody>
            {note.items.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>
                  <div style={{ fontWeight: '700' }}>{item.product.name}</div>
                  {(item.customDescription || item.product.description) && (
                    <div style={{ color: '#64748b', fontSize: '11px', whiteSpace: 'pre-wrap' }}>
                      {item.customDescription || item.product.description}
                    </div>
                  )}
                  <div style={{ color: '#94a3b8', fontSize: '10px', marginTop: '2px' }}>SKU: {item.product.sku}</div>
                </td>
                <td className="qty-cell">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="signatures">
          <div className="signature-box">
            Dispatched By (Print Name & Sign):
          </div>
          <div className="signature-box">
            Received By (Print Name & Sign):
          </div>
          <div className="signature-box" style={{ maxWidth: '150px' }}>
            Date Received:
          </div>
        </div>

        <div className="footer">
          <div>HVG Solutions Ltd | Company Reg: SC123456</div>
          <div style={{ textAlign: 'right' }}>Please retain this document for your records.</div>
        </div>
      </div>
    </div>
  );
}
