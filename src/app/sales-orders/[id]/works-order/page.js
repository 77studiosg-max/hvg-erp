import { Fragment } from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PrintTrigger from '@/components/PrintTrigger';
import CloseWindowButton from '@/components/CloseWindowButton';

async function getOrderData(id) {
  const order = await prisma.salesOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
          bomItems: {
            include: {
              product: true
            }
          }
        }
      }
    }
  });
  
  if (!order) return null;

  return order;
}

export default async function WorksOrderPage({ params }) {
  const { id } = await params;
  const order = await getOrderData(id);
  
  if (!order) notFound();

  return (
    <div className="print-container">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        @media print {
          body { background: white !important; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          @page { size: A4 portrait; margin: 0; }
          .print-only { margin: 0 !important; box-shadow: none !important; width: 100% !important; padding: 8mm !important; }
        }

        body { background: #f0f2f5; margin: 0; font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.2; }
        .print-only { background: white; width: 210mm; min-height: 297mm; margin: 10px auto; padding: 12mm; box-shadow: 0 10px 25px rgba(0,0,0,0.1); position: relative; display: flex; flex-direction: column; }
        .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #1a365d; }
        .brand { display: flex; flex-direction: column; }
        .doc-type { font-size: 28px; font-weight: 800; color: #1a365d; text-transform: uppercase; margin: 0; line-height: 1; }
        .doc-meta { margin-top: 6px; display: grid; grid-template-columns: auto auto; gap: 2px 12px; font-size: 13px; }
        .doc-meta label { font-weight: 700; color: #64748b; }
        
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 20px; }
        .info-section h4 { font-size: 10px; text-transform: uppercase; color: #1a365d; letter-spacing: 0.5px; margin-bottom: 4px; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; }
        .info-content { font-size: 12px; line-height: 1.3; }
        .info-content strong { font-size: 13px; display: block; margin-bottom: 1px; }

        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .items-table th { background: #f8fafc; color: #1a365d; padding: 6px 8px; font-size: 11px; text-transform: uppercase; font-weight: 800; text-align: left; border-bottom: 1px solid #cbd5e1; }
        .items-table td { padding: 4px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px; vertical-align: top; }
        .qty-cell { width: 70px; text-align: center; font-weight: 700; font-size: 14px; }
        
        .bom-row td { background: #fafafa; border-bottom: 1px dashed #e2e8f0; padding: 3px 8px 3px 30px; }
        .bom-qty { font-weight: 600; color: #1a365d; }

        .notes-section { margin-top: 10px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; }
        .notes-section h4 { margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; color: #1a365d; }
        .notes-content { font-size: 12px; }

        .footer { margin-top: auto; padding-top: 10px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 9px; color: #94a3b8; }
      `}} />

      <div className="no-print" style={{ position: 'fixed', top: '20px', right: '20px', display: 'flex', gap: '10px', zIndex: 1000 }}>
        <CloseWindowButton />
        <PrintTrigger />
      </div>

      <div className="print-only">
        <div className="header-top">
          <div className="brand">
            <img src="/hvg%20logo.png" alt="Hendrik Veder Group" style={{ height: '40px', objectFit: 'contain', marginBottom: '5px' }} />
            <div className="doc-meta">
              <label>Order No:</label> <span>{order.orderNumber}</span>
              <label>Date:</label> <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 className="doc-type">Works Order</h1>
            <p style={{ margin: '2px 0 0 0', color: '#64748b', fontWeight: '500', fontSize: '13px' }}>Production & Assembly Instructions</p>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-section">
            <h4>Customer</h4>
            <div className="info-content">
              <strong>{order.customer.companyName}</strong>
              {order.customer.contactName && <div>Attn: {order.customer.contactName}</div>}
            </div>
          </div>
          <div className="info-section">
            <h4>Workshop</h4>
            <div className="info-content">
              <strong>HVG Solutions - Production Facility</strong>
            </div>
          </div>
        </div>

        <table className="items-table">
          <thead>
            <tr>
              <th style={{ width: '30px' }}>#</th>
              <th>Item Description & Components</th>
              <th className="qty-cell">Qty</th>
              <th style={{ width: '80px' }}>Unit</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <Fragment key={item.id}>
                <tr>
                  <td style={{ fontWeight: '700' }}>{index + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <div style={{ fontWeight: '800', fontSize: '14px' }}>{item.product.name}</div>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '500' }}>{item.product.sku}</div>
                    </div>
                    {item.customDescription && (
                      <div style={{ marginTop: '3px', whiteSpace: 'pre-wrap', fontSize: '11px', color: '#334155', background: '#f8fafc', borderLeft: '3px solid #cbd5e1', padding: '4px 8px' }}>
                        {item.customDescription}
                      </div>
                    )}
                  </td>
                  <td className="qty-cell">{item.quantity}</td>
                  <td style={{ textTransform: 'uppercase', color: '#64748b', fontSize: '10px', fontWeight: '600' }}>{item.product.unit || 'pcs'}</td>
                </tr>
                {item.bomItems && item.bomItems.length > 0 && item.bomItems.map((bom, bIndex) => (
                  <tr key={`${item.id}-bom-${bIndex}`} className="bom-row">
                    <td></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <div style={{ fontWeight: '600', fontSize: '13px' }}>{bom.product.name}</div>
                        <div style={{ fontSize: '9px', color: '#94a3b8' }}>{bom.product.sku}</div>
                      </div>
                    </td>
                    <td className="qty-cell">
                      <span className="bom-qty">{(bom.quantity * item.quantity).toFixed(2)}</span>
                    </td>
                    <td style={{ textTransform: 'uppercase', color: '#94a3b8', fontSize: '9px' }}>{bom.product.unit || 'pcs'}</td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>

        <div className="notes-section">
          <h4>Workshop Notes / QC Checklist</h4>
          <div className="notes-content">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', padding: '4px 0' }}>[ ] Materials Verified</div>
              <div style={{ borderBottom: '1px solid #e2e8f0', padding: '4px 0' }}>[ ] Dimensions Checked</div>
              <div style={{ borderBottom: '1px solid #e2e8f0', padding: '4px 0' }}>[ ] Assembly Standards Met</div>
              <div style={{ borderBottom: '1px solid #e2e8f0', padding: '4px 0' }}>[ ] Visual Inspection Passed</div>
            </div>
          </div>
        </div>

        <div className="footer">
          <div>Internal Document | Printed on {new Date().toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
