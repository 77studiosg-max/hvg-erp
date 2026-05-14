'use client';

import { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { uploadDocument, getDocumentPath } from '@/lib/storage';
import { updateDocumentPdfUrl } from '@/app/actions/storage';

export default function SaveToSupabaseButton({ docId, docType, docNumber }) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', null

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      // 1. Select the element to capture
      const element = document.querySelector('.print-only');
      if (!element) throw new Error('Print element not found');

      // 2. Capture as canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
      });

      // 3. Convert to PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      const pdfBlob = pdf.output('blob');

      // 4. Upload to Supabase Storage
      const path = getDocumentPath(docType, docNumber);
      const publicUrl = await uploadDocument('documents', path, pdfBlob);

      // 5. Update Database
      const result = await updateDocumentPdfUrl(docType, docId, publicUrl);

      if (result.success) {
        setSaveStatus('success');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <button 
        onClick={handleSave} 
        disabled={isSaving}
        style={{ 
          background: saveStatus === 'success' ? '#10b981' : '#8b5cf6', 
          color: 'white', 
          border: 'none', 
          padding: '10px 20px', 
          borderRadius: '5px', 
          cursor: isSaving ? 'wait' : 'pointer', 
          fontWeight: 'bold',
          opacity: isSaving ? 0.7 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        {isSaving ? (
          <>
            <span className="animate-spin">🌀</span> Saving...
          </>
        ) : saveStatus === 'success' ? (
          '✓ Saved to Supabase'
        ) : (
          'Save to Supabase'
        )}
      </button>
      {saveStatus === 'error' && (
        <span style={{ color: '#ef4444', fontSize: '11px', textAlign: 'center' }}>
          Error saving. Try again.
        </span>
      )}
    </div>
  );
}
