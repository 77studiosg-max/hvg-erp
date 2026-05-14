import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PrintTrigger from '@/components/PrintTrigger';
import SaveToSupabaseButton from '@/components/SaveToSupabaseButton';
import CloseWindowButton from '@/components/CloseWindowButton';

async function getOrderData(id) {
  const order = await prisma.salesOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
          bomItems: true
        }
      }
    }
  });
  
  if (!order) return null;

  return order;
}

export default async function PrintOrderPage({ params }) {
  const { id } = await params;
  const order = await getOrderData(id);
  
  if (!order) notFound();

  const calculateItemSalesPrice = (item) => {
    if (item.bomItems && item.bomItems.length > 0) {
      return item.bomItems.reduce((sum, b) => {
        const cost = b.unitPrice || 0;
        const marg = b.margin || 0;
        const sP = marg >= 100 ? cost : cost / (1 - marg / 100);
        return sum + (b.quantity * sP);
      }, 0);
    }
    return item.unitPrice || 0;
  };

  const subtotal = order.items.reduce((sum, item) => {
    const itemSalesPrice = calculateItemSalesPrice(item);
    return sum + (item.quantity * itemSalesPrice);
  }, 0);
  const discountAmount = subtotal * ((order.discount || 0) / 100);
  const totalAfterDiscount = subtotal - discountAmount;
  const vatAmount = totalAfterDiscount * ((order.vatRate || 20) / 100);
  const grandTotal = order.totalAmount;

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
        .doc-type { font-size: 36px; font-weight: 800; color: #10b981; text-transform: uppercase; margin: 0; line-height: 1; text-align: right; }
        .doc-meta { margin-top: 15px; display: grid; grid-template-columns: auto auto; gap: 5px 20px; font-size: 13px; justify-content: end; }
        .doc-meta label { font-weight: 600; color: #64748b; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-bottom: 40px; padding-top: 20px; border-top: 2px solid #f1f5f9; }
        .info-section h4 { font-size: 11px; text-transform: uppercase; color: #1a365d; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
        .info-content { font-size: 13px; line-height: 1.5; }
        .info-content strong { font-size: 15px; display: block; margin-bottom: 4px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { background: #1a365d; color: white; padding: 8px 10px; font-size: 11px; text-transform: uppercase; font-weight: 700; text-align: left; }
        .items-table td { padding: 4px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; vertical-align: middle; }
        .qty-cell { width: 60px; text-align: center; font-weight: 600; }
        .price-cell { width: 100px; text-align: right; }
        .total-cell { width: 110px; text-align: right; font-weight: 600; }
        .financials-container { display: flex; justify-content: flex-end; margin-top: 10px; }
        .financials-box { width: 300px; }
        .fin-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; }
        .fin-row.total { margin-top: 10px; padding: 15px 10px; background: #f8fafc; border-top: 2px solid #10b981; font-size: 18px; font-weight: 800; color: #1a365d; }
        .footer { margin-top: auto; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
      `}} />

      <div className="no-print" style={{ position: 'fixed', top: '20px', right: '20px', display: 'flex', gap: '10px', zIndex: 1000 }}>
        <CloseWindowButton />
        <SaveToSupabaseButton 
          docId={order.id} 
          docType="salesOrder" 
          docNumber={order.orderNumber} 
        />
        <PrintTrigger />
      </div>

      <div className="print-only">
        <div className="header-top">
          <div className="brand">
            <img src="/hvg%20logo.png" alt="Hendrik Veder Group" style={{ height: '60px', objectFit: 'contain' }} />
          </div>
          <div>
            <h1 className="doc-type">Sales Order</h1>
            <div className="doc-meta">
              <label>Order No:</label> <span>{order.orderNumber}</span>
              <label>Date:</label> <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              <label>Status:</label> <span>{order.status}</span>
            </div>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-section">
            <h4>Client Information</h4>
            <div className="info-content">
              <strong>{order.customer.companyName}</strong>
              {order.customer.addressLine1 && <div>{order.customer.addressLine1}</div>}
              <div>{order.customer.city} {order.customer.postcode}</div>
              <div>{order.customer.country}</div>
            </div>
          </div>
          <div className="info-section">
            <h4>Fulfillment From</h4>
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
              <th className="qty-cell">Qty</th>
              <th className="price-cell">Unit Price</th>
              <th className="total-cell">Total (Net)</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => {
              const itemSalesPrice = calculateItemSalesPrice(item);
              return (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    {item.customDescription ? (
                      <div style={{ fontWeight: '700', fontSize: '13px', whiteSpace: 'pre-wrap', lineHeight: '1.2' }}>
                        {item.customDescription}
                      </div>
                    ) : (
                      <>
                        <div style={{ fontWeight: '700' }}>{item.product.name}</div>
                        {item.product.description && (
                          <div style={{ color: '#64748b', fontSize: '11px' }}>
                            {item.product.description}
                          </div>
                        )}
                        <div style={{ color: '#94a3b8', fontSize: '10px', marginTop: '2px' }}>SKU: {item.product.sku}</div>
                      </>
                    )}
                  </td>
                  <td className="qty-cell">{item.quantity}</td>
                  <td className="price-cell">£{itemSalesPrice.toFixed(2)}</td>
                  <td className="total-cell">£{(item.quantity * itemSalesPrice).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="financials-container">
          <div className="financials-box">
            <div className="fin-row">
              <span>Subtotal:</span>
              <span>£{subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="fin-row" style={{ color: '#ef4444' }}>
                <span>Global Discount ({order.discount}%):</span>
                <span>- £{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="fin-row">
              <span>VAT ({order.vatRate || 20}%):</span>
              <span>£{vatAmount.toFixed(2)}</span>
            </div>
            <div className="fin-row total">
              <span>Order Total Amount:</span>
              <span>£{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="footer">
          <div>HVG Solutions Ltd | Company Reg: SC123456 | VAT: GB987654321</div>
          <div style={{ textAlign: 'right' }}>Bank: National Scotland Bank | Account: 12345678</div>
        </div>
      </div>
    </div>
  );
}
