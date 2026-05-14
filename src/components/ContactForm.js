'use client';

import Link from 'next/link';
import DeleteButton from './DeleteButton';
import { deleteCustomer, deleteVendor } from '@/app/actions/contacts';

export default function ContactForm({ action, type, initialData }) {
  const isVendor = type === 'vendor';
  const title = isVendor ? 'Vendor' : 'Customer';
  const cancelHref = isVendor ? '/vendors' : '/customers';
  const deleteAction = isVendor ? deleteVendor : deleteCustomer;
  
  const boundAction = initialData?.id ? action.bind(null, initialData.id) : action;

  return (
    <form action={boundAction} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
      <div style={{ padding: '0.6rem 0.8rem', background: 'var(--secondary)', borderRadius: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
          {title} Identification Number
        </span>
        <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--primary)', letterSpacing: '0.05em' }}>
          {initialData?.customerNumber || initialData?.vendorNumber || 'AUTO-GENERATED'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontWeight: '600', fontSize: '0.75rem' }}>Company Name *</label>
          <input type="text" name="companyName" defaultValue={initialData?.companyName} required style={{ padding: '0.4rem 0.6rem', fontSize: '0.875rem' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontWeight: '600', fontSize: '0.75rem' }}>Contact Name</label>
          <input type="text" name="contactName" defaultValue={initialData?.contactName} placeholder="Primary contact" style={{ padding: '0.4rem 0.6rem', fontSize: '0.875rem' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontWeight: '600', fontSize: '0.75rem' }}>Email Address</label>
          <input type="email" name="email" defaultValue={initialData?.email} placeholder="billing@company.com" style={{ padding: '0.4rem 0.6rem', fontSize: '0.875rem' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontWeight: '600', fontSize: '0.75rem' }}>Phone Number</label>
          <input type="text" name="phone" defaultValue={initialData?.phone} style={{ padding: '0.4rem 0.6rem', fontSize: '0.875rem' }} />
        </div>
      </div>

      <div style={{ border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '0.4rem', background: 'rgba(255,255,255,0.01)' }}>
        <p style={{ fontWeight: '700', fontSize: '0.7rem', marginBottom: '0.6rem', color: 'var(--primary)', textTransform: 'uppercase' }}>Address Details</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Address Line 1 *</label>
            <input type="text" name="addressLine1" defaultValue={initialData?.addressLine1} required style={{ padding: '0.4rem 0.6rem', fontSize: '0.875rem' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Address Line 2</label>
            <input type="text" name="addressLine2" defaultValue={initialData?.addressLine2} style={{ padding: '0.4rem 0.6rem', fontSize: '0.875rem' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>City *</label>
              <input type="text" name="city" defaultValue={initialData?.city} required style={{ padding: '0.4rem 0.6rem', fontSize: '0.875rem' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Postcode *</label>
              <input type="text" name="postcode" defaultValue={initialData?.postcode} required style={{ padding: '0.4rem 0.6rem', fontSize: '0.875rem' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Country</label>
              <input type="text" name="country" defaultValue={initialData?.country || 'United Kingdom'} style={{ padding: '0.4rem 0.6rem', fontSize: '0.875rem' }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontWeight: '600', fontSize: '0.75rem' }}>VAT Number</label>
          <input type="text" name="vatNumber" defaultValue={initialData?.vatNumber} placeholder="VAT ID" style={{ padding: '0.4rem 0.6rem', fontSize: '0.875rem' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontWeight: '600', fontSize: '0.75rem' }}>Company Reg No.</label>
          <input type="text" name="companyRegNumber" defaultValue={initialData?.companyRegNumber} placeholder="Registration No." style={{ padding: '0.4rem 0.6rem', fontSize: '0.875rem' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label style={{ fontWeight: '600', fontSize: '0.75rem' }}>Payment Terms</label>
        <select name="paymentTerms" defaultValue={initialData?.paymentTerms || 'Net 30'} style={{ padding: '0.4rem 0.6rem', fontSize: '0.875rem', height: 'auto' }}>
          <option value="Immediate">Due on Receipt</option>
          <option value="Net 7">Net 7 Days</option>
          <option value="Net 15">Net 15 Days</option>
          <option value="Net 30">Net 30 Days</option>
          <option value="Net 60">Net 60 Days</option>
        </select>
      </div>

      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
        {initialData?.id && (
          <div style={{ marginRight: 'auto' }}>
            <DeleteButton action={deleteAction} id={initialData.id} label={title} />
          </div>
        )}
        <Link href={cancelHref} className="btn-secondary" style={{ padding: '0.4rem 1rem' }}>
          Cancel
        </Link>
        <button type="submit" className="btn-primary" style={{ padding: '0.4rem 1rem' }}>
          Save {title}
        </button>
      </div>
    </form>
  );
}
