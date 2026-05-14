'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createProduct, updateProduct } from '../app/inventory/actions';

export default function ProductForm({ categories, preSelectedId, initialData, isEdit }) {
  const [selectedMain, setSelectedMain] = useState('');
  const [selectedSub, setSelectedSub] = useState('');
  const [selectedDia, setSelectedDia] = useState('');
  const [unit, setUnit] = useState(initialData?.unit || 'pcs');

  // Filter categories
  const mainGroups = categories.filter(c => !c.parentId);
  const subGroups = categories.filter(c => c.parentId === selectedMain);
  const diameters = categories.filter(c => c.parentId === selectedSub);

  // Initialize with pre-selected ID or initialData logic
  useEffect(() => {
    const targetId = initialData?.categoryId || preSelectedId;
    if (targetId) {
      const selected = categories.find(c => c.id === targetId);
      if (selected) {
        // If it's a 3rd level (diameter)
        if (selected.parent?.parent) {
          setSelectedMain(selected.parent.parentId);
          setSelectedSub(selected.parentId);
          setSelectedDia(selected.id);
        } 
        // If it's a 2nd level (subgroup)
        else if (selected.parent) {
          setSelectedMain(selected.parentId);
          setSelectedSub(selected.id);
          setSelectedDia('');
        }
        // If it's a 1st level (main)
        else {
          setSelectedMain(selected.id);
          setSelectedSub('');
          setSelectedDia('');
        }
        
        if (selected.unit && !initialData) setUnit(selected.unit);
      }
    }
  }, [preSelectedId, initialData, categories]);

  // Update unit when selection changes (only if not editing or if manually changed)
  useEffect(() => {
    if (isEdit) return; // Don't auto-override unit when editing unless specifically needed
    const activeId = selectedDia || selectedSub || selectedMain;
    const active = categories.find(c => c.id === activeId);
    if (active?.unit) setUnit(active.unit);
  }, [selectedMain, selectedSub, selectedDia, categories, isEdit]);

  const action = isEdit ? updateProduct : createProduct;

  return (
    <form action={action} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {isEdit && <input type="hidden" name="id" value={initialData.id} />}
      <input type="hidden" name="categoryId" value={selectedDia || selectedSub || selectedMain} />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: '600', fontSize: '0.875rem' }}>Product Name *</label>
          <input 
            type="text" 
            name="name" 
            placeholder="e.g. 12mm Wire Rope" 
            defaultValue={initialData?.name || ''}
            required 
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: '600', fontSize: '0.875rem' }}>SKU / Reference *</label>
          <input 
            type="text" 
            name="sku" 
            placeholder="e.g. WR-12-STEEL" 
            defaultValue={initialData?.sku || ''}
            required 
          />
        </div>
      </div>

      <div style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.02)' }}>
        <p style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--primary)' }}>Product Group Hierarchy</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Main Group</label>
            <select 
              value={selectedMain} 
              onChange={(e) => {
                setSelectedMain(e.target.value);
                setSelectedSub('');
                setSelectedDia('');
              }}
            >
              <option value="">Select Group...</option>
              {mainGroups.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Subgroup</label>
            <select 
              value={selectedSub} 
              onChange={(e) => {
                setSelectedSub(e.target.value);
                setSelectedDia('');
              }}
              disabled={!selectedMain}
            >
              <option value="">Select Subgroup...</option>
              {subGroups.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Diameter / Size</label>
            <select 
              value={selectedDia} 
              onChange={(e) => setSelectedDia(e.target.value)}
              disabled={!selectedSub}
            >
              <option value="">Select Size...</option>
              {diameters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: '600', fontSize: '0.875rem' }}>Unit Price (£)</label>
          <input 
            type="number" 
            step="0.0001" 
            name="price" 
            placeholder="0.00" 
            defaultValue={initialData?.price || ''}
            required 
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: '600', fontSize: '0.875rem' }}>Unit of Measure</label>
          <input 
            type="text" 
            name="unit" 
            value={unit} 
            onChange={(e) => setUnit(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: '600', fontSize: '0.875rem' }}>Stock Level</label>
          <input 
            type="number" 
            name="stockLevel" 
            defaultValue={initialData?.stockLevel || "0"} 
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: '600', fontSize: '0.875rem' }}>Item Type</label>
          <select name="isBOM" defaultValue={initialData?.isBOM ? "true" : "false"}>
            <option value="false">Single Item</option>
            {categories.find(c => c.id === (selectedDia || selectedSub || selectedMain))?.bomEnabled && (
              <option value="true">BOM Kit (Assembly)</option>
            )}
          </select>
        </div>
      </div>

      {['Masterlink', 'Masterlink Assembly', 'Hooks', 'Shackles'].includes(categories.find(c => c.id === selectedMain)?.name) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: '600', fontSize: '0.875rem' }}>Working Load Limit (WLL)</label>
          <input 
            type="text" 
            name="wll" 
            placeholder="e.g. 5.0t" 
            defaultValue={initialData?.wll || ''}
          />
        </div>
      )}

      {['Wire Rope', 'Sockets'].includes(categories.find(c => c.id === selectedMain)?.name) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: '600', fontSize: '0.875rem' }}>Minimum Breaking Load (MBL)</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="number" 
              step="0.01"
              name="mblValue" 
              placeholder="Value" 
              defaultValue={initialData?.mblValue || ''}
              style={{ flex: 2 }}
            />
            <select name="mblUnit" defaultValue={initialData?.mblUnit || 'KN'} style={{ flex: 1 }}>
              <option value="TE">TE</option>
              <option value="TON">TON</option>
              <option value="KN">KN</option>
            </select>
          </div>
        </div>
      )}

      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <Link href={isEdit ? `/inventory/${initialData.id}` : "/inventory"} className="btn-secondary">
          Cancel
        </Link>
        <button type="submit" className="btn-primary">
          {isEdit ? 'Update Item' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
