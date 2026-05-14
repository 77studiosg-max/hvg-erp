import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PrintTrigger from '@/components/PrintTrigger';
import SaveToSupabaseButton from '@/components/SaveToSupabaseButton';
import CloseWindowButton from '@/components/CloseWindowButton';

async function getQuoteData(id) {
  const quote = await prisma.quote.findUnique({
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
  
  if (!quote) return null;

  return quote;
}

export default async function PrintQuotePage({ params }) {
  const { id } = await params;
  const quote = await getQuoteData(id);
  
  if (!quote) notFound();

  const calculateItemSalesPrice = (item) => {
    if (item.bomItems && item.bomItems.length > 0) {
      return item.bomItems.reduce((sum, b) => {
        const cost = b.unitPrice || 0;
        const marg = b.margin || 0;
        const sP = marg >= 100 ? cost : cost / (1 - marg / 100);
        return sum + (b.quantity * sP);
      }, 0);
    }
    const cost = item.unitPrice || 0;
    const itemMargin = item.margin || 0;
    return itemMargin >= 100 ? cost : cost / (1 - itemMargin / 100);
  };

  const subtotal = quote.items.reduce((sum, item) => {
    const itemSalesPrice = calculateItemSalesPrice(item);
    return sum + (item.quantity * itemSalesPrice);
  }, 0);
  
  const discountAmount = subtotal * (quote.discount / 100);
  const totalNet = subtotal - discountAmount;
  const vatAmount = totalNet * (quote.vatRate / 100);
  const grandTotal = totalNet + vatAmount;

  return (
    <div className="print-container">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        @media print {
          body { background: white !important; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          @page { 
            size: A4 portrait; 
            margin: 0; 
          }
          .print-only { 
            margin: 0 !important; 
            box-shadow: none !important; 
            width: 100% !important; 
            padding: 15mm !important;
          }
        }

        body { 
          background: #f0f2f5; 
          margin: 0; 
          font-family: 'Inter', sans-serif;
          color: #1e293b;
        }

        .print-only { 
          background: white; 
          width: 210mm; 
          min-height: 297mm; 
          margin: 40px auto; 
          padding: 20mm; 
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
        }

        .brand {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-size: 32px;
          font-weight: 800;
          color: #1a365d;
          letter-spacing: -1px;
          line-height: 1;
          margin-bottom: 4px;
        }

        .brand-tagline {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #64748b;
          font-weight: 600;
        }

        .doc-title-box {
          text-align: right;
        }

        .doc-type {
          font-size: 36px;
          font-weight: 800;
          color: #1a365d;
          text-transform: uppercase;
          margin: 0;
          line-height: 1;
        }

        .doc-meta {
          margin-top: 15px;
          display: grid;
          grid-template-columns: auto auto;
          gap: 5px 20px;
          font-size: 13px;
          justify-content: end;
        }

        .doc-meta label {
          font-weight: 600;
          color: #64748b;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          margin-bottom: 40px;
          padding-top: 20px;
          border-top: 2px solid #f1f5f9;
        }

        .info-section h4 {
          font-size: 11px;
          text-transform: uppercase;
          color: #1a365d;
          letter-spacing: 1px;
          margin-bottom: 12px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 5px;
        }

        .info-content {
          font-size: 13px;
          line-height: 1.5;
        }

        .info-content strong {
          font-size: 15px;
          display: block;
          margin-bottom: 4px;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }

        .items-table th {
          background: #1a365d;
          color: white;
          padding: 8px 10px;
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 700;
          text-align: left;
        }

        .items-table td {
          padding: 2px 10px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 12px;
          vertical-align: middle;
        }

        .pos-cell { width: 40px; text-align: center; color: #94a3b8; font-weight: 600; }
        .qty-cell { width: 60px; text-align: center; font-weight: 600; }
        .price-cell { width: 100px; text-align: right; }
        .total-cell { width: 110px; text-align: right; font-weight: 600; }

        .financials-container {
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;
        }

        .financials-box {
          width: 300px;
        }

        .fin-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 13px;
        }

        .fin-row.total {
          margin-top: 10px;
          padding: 15px 10px;
          background: #f8fafc;
          border-top: 2px solid #1a365d;
          font-size: 18px;
          font-weight: 800;
          color: #1a365d;
        }

        .notes-section {
          margin-top: auto;
          padding-top: 40px;
        }

        .notes-section h5 {
          font-size: 12px;
          text-transform: uppercase;
          color: #1a365d;
          margin-bottom: 10px;
        }

        .notes-list {
          padding-left: 20px;
          margin: 0;
          font-size: 11px;
          color: #64748b;
          line-height: 1.6;
        }

        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #94a3b8;
        }

        .bank-details {
          text-align: right;
        }
      `}} />

      <div className="no-print" style={{ position: 'fixed', top: '20px', right: '20px', display: 'flex', gap: '10px', zIndex: 1000 }}>
        <CloseWindowButton />
        <SaveToSupabaseButton 
          docId={quote.id} 
          docType="quote" 
          docNumber={quote.quoteNumber} 
        />
        <PrintTrigger />
      </div>

      <div className="print-only">
        <div className="header-top">
          <div className="brand">
            <img src="/hvg%20logo.png" alt="Hendrik Veder Group" style={{ height: '60px', objectFit: 'contain' }} />
          </div>
          <div className="doc-title-box">
            <h1 className="doc-type">Quotation</h1>
            <div className="doc-meta">
              <label>No:</label> <span>{quote.quoteNumber || 'QT-0000'}</span>
              <label>Date:</label> <span>{new Date(quote.createdAt).toLocaleDateString()}</span>
              <label>Valid Until:</label> <span>{quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-section">
            <h4>Client Information</h4>
            <div className="info-content">
              <strong>{quote.customer.companyName}</strong>
              {quote.customer.addressLine1 && <div>{quote.customer.addressLine1}</div>}
              {quote.customer.addressLine2 && <div>{quote.customer.addressLine2}</div>}
              <div>{quote.customer.city} {quote.customer.postcode}</div>
              <div>{quote.customer.country}</div>
              {quote.customer.vatNumber && <div style={{ marginTop: '8px' }}>VAT: {quote.customer.vatNumber}</div>}
            </div>
          </div>
          <div className="info-section">
            <h4>Company Details</h4>
            <div className="info-content">
              <strong>HVG Solutions Ltd</strong>
              <div>123 Engineering Way, Industrial Park</div>
              <div>Aberdeen, AB12 3XY</div>
              <div>United Kingdom</div>
              <div style={{ marginTop: '8px' }}>Email: sales@hvgsolutions.com</div>
              <div>Phone: +44 (0) 1224 555 666</div>
            </div>
          </div>
        </div>

        <table className="items-table">
          <thead>
            <tr>
              <th className="pos-cell">Pos</th>
              <th>Description</th>
              <th className="qty-cell">Qty</th>
              <th className="price-cell">Unit Price</th>
              <th className="total-cell">Total (Net)</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item, index) => {
              const itemSalesPrice = calculateItemSalesPrice(item);
              return (
                <tr key={item.id}>
                  <td className="pos-cell">{index + 1}</td>
                  <td>
                    {item.customDescription ? (
                      <div style={{ fontWeight: '700', fontSize: '13px', whiteSpace: 'pre-wrap', lineHeight: '1.2' }}>
                        {item.customDescription}
                      </div>
                    ) : (
                      <>
                        <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '1px', lineHeight: '1.2' }}>{item.product.name}</div>
                        {item.product.description && (
                          <div style={{ color: '#64748b', fontSize: '11px', lineHeight: '1.2' }}>
                            {item.product.description}
                          </div>
                        )}
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
            {quote.discount > 0 && (
              <div className="fin-row">
                <span>Global Discount ({quote.discount}%):</span>
                <span>- £{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="fin-row">
              <span>VAT ({quote.vatRate}%):</span>
              <span>£{vatAmount.toFixed(2)}</span>
            </div>
            <div className="fin-row total">
              <span>Total Amount:</span>
              <span>£{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="notes-section">
          <h5>Terms & Conditions</h5>
          <ul className="notes-list">
            <li>Quotation valid for 30 days from the date of issue.</li>
            <li>Payment Terms: Net 30 days from date of invoice.</li>
            <li>All prices are quoted in GBP (£) and exclude VAT unless stated.</li>
            <li>Delivery lead times are subject to stock availability at the time of order.</li>
            <li>Ownership of goods remains with HVG Solutions Ltd until payment is received in full.</li>
          </ul>
        </div>

        <div className="footer">
          <div>
            <div>HVG Solutions Ltd | Company Reg: SC123456 | VAT: GB987654321</div>
            <div>www.hvgsolutions.com</div>
          </div>
          <div className="bank-details">
            <div>Bank: National Scotland Bank</div>
            <div>Account: 12345678 | Sort Code: 00-11-22</div>
          </div>
        </div>
      </div>
    </div>
  );
}
