import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PrintTrigger from '@/components/PrintTrigger';
import SaveToSupabaseButton from '@/components/SaveToSupabaseButton';
import CloseWindowButton from '@/components/CloseWindowButton';

async function getOrderData(id) {
  const order = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      vendor: true,
      items: {
        include: {
          product: true
        }
      }
    }
  });
  
  if (!order) return null;

  return order;
}

export default async function PrintPOPage({ params }) {
  const { id } = await params;
  const order = await getOrderData(id);
  
  if (!order) notFound();

  const totalAmount = order.totalAmount;

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
        .doc-type { font-size: 36px; font-weight: 800; color: #6366f1; text-transform: uppercase; margin: 0; line-height: 1; text-align: right; }
        .doc-meta { margin-top: 15px; display: grid; grid-template-columns: auto auto; gap: 5px 20px; font-size: 13px; justify-content: end; }
        .doc-meta label { font-weight: 600; color: #64748b; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-bottom: 40px; padding-top: 20px; border-top: 2px solid #f1f5f9; }
        .info-section h4 { font-size: 11px; text-transform: uppercase; color: #1a365d; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
        .info-content { font-size: 13px; line-height: 1.5; }
        .info-content strong { font-size: 15px; display: block; margin-bottom: 4px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { background: #1a365d; color: white; padding: 8px 10px; font-size: 11px; text-transform: uppercase; font-weight: 700; text-align: left; }
        .items-table td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; vertical-align: middle; }
        .financials-container { display: flex; justify-content: flex-end; margin-top: 10px; }
        .financials-box { width: 300px; }
        .fin-row.total { margin-top: 10px; padding: 15px 10px; background: #f8fafc; border-top: 2px solid #6366f1; font-size: 18px; font-weight: 800; color: #1a365d; display: flex; justify-content: space-between; }
        .footer { margin-top: auto; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
      `}} />

      <div className="no-print" style={{ position: 'fixed', top: '20px', right: '20px', display: 'flex', gap: '10px', zIndex: 1000 }}>
        <CloseWindowButton />
        <SaveToSupabaseButton 
          docId={order.id} 
          docType="purchaseOrder" 
          docNumber={order.poNumber} 
        />
        <PrintTrigger />
      </div>

      <div className="print-only">
        <div className="header-top">
          <div className="brand">
            <img src="/hvg%20logo.png" alt="Hendrik Veder Group" style={{ height: '60px', objectFit: 'contain' }} />
          </div>
          <div>
            <h1 className="doc-type">Purchase Order</h1>
            <div className="doc-meta">
              <label>PO No:</label> <span>{order.poNumber}</span>
              <label>Date:</label> <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-section">
            <h4>Supplier Information</h4>
            <div className="info-content">
              <strong>{order.vendor.companyName}</strong>
              {order.vendor.addressLine1 && <div>{order.vendor.addressLine1}</div>}
              <div>{order.vendor.city} {order.vendor.postcode}</div>
              <div>{order.vendor.country}</div>
              {order.vendor.vendorNumber && <div style={{ marginTop: '8px' }}>Supplier ID: {order.vendor.vendorNumber}</div>}
            </div>
          </div>
          <div className="info-section">
            <h4>Deliver To</h4>
            <div className="info-content">
              <strong>HVG Solutions Ltd - Warehouse</strong>
              <div>123 Engineering Way, Industrial Park</div>
              <div>Aberdeen, AB12 3XY</div>
              <div>United Kingdom</div>
            </div>
          </div>
        </div>

        <table className="items-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>Pos</th>
              <th>Item / Description</th>
              <th style={{ width: '80px', textAlignment: 'center' }}>Qty</th>
              <th style={{ width: '120px', textAlign: 'right' }}>Unit Cost</th>
              <th style={{ width: '120px', textAlign: 'right' }}>Total Cost</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>
                  <div style={{ fontWeight: '700' }}>{item.product.name}</div>
                  <div style={{ color: '#64748b', fontSize: '11px' }}>SKU: {item.product.sku}</div>
                </td>
                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right' }}>£{item.unitPrice.toFixed(2)}</td>
                <td style={{ textAlign: 'right' }}>£{(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="financials-container">
          <div className="financials-box">
            <div className="fin-row total">
              <span>Grand Total Cost:</span>
              <span>£{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="footer">
          <div>HVG Solutions Ltd | 123 Engineering Way, Aberdeen | www.hvgsolutions.com</div>
          <div style={{ textAlign: 'right' }}>Authorized Signature: _______________________</div>
        </div>
      </div>
    </div>
  );
}
