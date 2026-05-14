'use client';

import { Plus, X, FolderTree } from 'lucide-react';
import { useState } from 'react';
import DeleteButton from './DeleteButton';

export default function CategoryManager({ parentCategories, allCategories, createCategoryAction, deleteCategoryAction, updateCategoryAction, toggleBOMAction }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const startEditing = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    try {
      await updateCategoryAction(id, editName);
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update category:", error);
      alert("Failed to update category name.");
    }
  };

  return (
    <div style={{ transition: 'all 0.3s ease', gridColumn: '1 / -1' }}>
      {!isOpen ? (
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderTree size={20} style={{ color: 'var(--primary)' }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>Inventory Groups</h2>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', margin: 0 }}>
                Manage your inventory hierarchy and subgroups.
              </p>
            </div>
            <button 
              onClick={() => setIsOpen(true)}
              className="btn-primary" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                marginLeft: 'auto'
              }}
            >
              <Plus size={16} /> Manage
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Add New Category Section */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={20} className="text-primary" />
                <h3 style={{ margin: 0 }}>Add New Group/Subgroup</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form 
              action={async (formData) => {
                await createCategoryAction(formData);
                // We keep it open to see the new item in the list
              }} 
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', fontSize: '0.875rem' }}>Category Name</label>
                <input type="text" name="name" placeholder="e.g. Hooks, Wire Rope..." required />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', fontSize: '0.875rem' }}>Parent Group (Optional)</label>
                <select name="parentId">
                  <option value="none">-- Main Group (No Parent) --</option>
                  {parentCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                  Select a parent if this is a subgroup.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                <input type="checkbox" name="bomEnabled" value="true" id="bomEnabled" style={{ width: 'auto' }} />
                <label htmlFor="bomEnabled" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
                  <strong>Enable Dynamic BOM</strong> for this group
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Close
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                  Create Category
                </button>
              </div>
            </form>
          </div>

          {/* Existing Categories List */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <FolderTree size={20} className="text-primary" />
              <h3 style={{ margin: 0 }}>Inventory Structure</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {parentCategories.length === 0 ? (
                <p style={{ color: 'var(--muted-foreground)', textAlign: 'center', padding: '2rem' }}>
                  No categories defined yet.
                </p>
              ) : (
                parentCategories.map(parent => (
                  <div key={parent.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      {editingId === parent.id ? (
                        <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                          <input 
                            type="text" 
                            value={editName} 
                            onChange={(e) => setEditName(e.target.value)}
                            style={{ padding: '0.25rem 0.5rem', flex: 1 }}
                            autoFocus
                          />
                          <button onClick={() => handleUpdate(parent.id)} className="btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Save</button>
                          <button onClick={cancelEditing} className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Cancel</button>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                            <span style={{ fontWeight: '700', color: 'var(--primary)', flex: 1 }}>{parent.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: parent.bomEnabled ? 'var(--primary)' : 'var(--muted-foreground)', cursor: 'pointer', background: parent.bomEnabled ? 'rgba(59, 130, 246, 0.1)' : 'transparent', padding: '0.2rem 0.5rem', borderRadius: '1rem', border: `1px solid ${parent.bomEnabled ? 'var(--primary)' : 'var(--border)'}` }}>
                                <input 
                                  type="checkbox" 
                                  checked={!!parent.bomEnabled} 
                                  onChange={(e) => toggleBOMAction(parent.id, e.target.checked)}
                                  style={{ width: 'auto', margin: 0 }}
                                />
                                BOM
                              </label>
                              <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', minWidth: '60px' }}>{parent._count?.products || 0} items</span>
                              <button 
                                onClick={() => startEditing(parent)}
                                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}
                              >
                                Edit
                              </button>
                              <DeleteButton id={parent.id} action={deleteCategoryAction} label="Category" />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Subcategories */}
                    {allCategories.filter(c => c.parentId === parent.id).map(child => (
                      <div key={child.id} style={{ marginLeft: '1.5rem', padding: '0.4rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                        {editingId === child.id ? (
                          <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                            <input 
                              type="text" 
                              value={editName} 
                              onChange={(e) => setEditName(e.target.value)}
                              style={{ padding: '0.2rem 0.5rem', flex: 1, fontSize: '0.8125rem' }}
                              autoFocus
                            />
                            <button onClick={() => handleUpdate(child.id)} className="btn-primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>Save</button>
                            <button onClick={cancelEditing} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>Cancel</button>
                          </div>
                        ) : (
                          <>
                            <span style={{ color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                              <span style={{ color: 'var(--muted-foreground)' }}>└</span> {child.name}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.65rem', color: child.bomEnabled ? 'var(--primary)' : 'var(--muted-foreground)', cursor: 'pointer', background: child.bomEnabled ? 'rgba(59, 130, 246, 0.05)' : 'transparent', padding: '0.1rem 0.4rem', borderRadius: '1rem', border: `1px solid ${child.bomEnabled ? 'var(--primary)' : 'var(--border)'}` }}>
                                <input 
                                  type="checkbox" 
                                  checked={!!child.bomEnabled} 
                                  onChange={(e) => toggleBOMAction(child.id, e.target.checked)}
                                  style={{ width: 'auto', margin: 0 }}
                                />
                                BOM
                              </label>
                              <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', minWidth: '50px' }}>{child._count?.products || 0} items</span>
                              <button 
                                onClick={() => startEditing(child)}
                                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}
                              >
                                Edit
                              </button>
                              <DeleteButton id={child.id} action={deleteCategoryAction} label="Subgroup" />
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
