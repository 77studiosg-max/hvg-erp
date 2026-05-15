'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  ShoppingCart, 
  Truck, 
  Receipt, 
  Settings,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useState, useEffect, Suspense } from 'react';

function SidebarInner({ categories = [] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategoryId = searchParams.get('category');
  const { theme, toggleTheme } = useTheme();
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState({});
  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Vendors', href: '/vendors', icon: Users },
    { name: 'Inventory', href: '/inventory', icon: Package, hasDropdown: true },
    { name: 'Quotes', href: '/quotes', icon: FileText },
    { name: 'Sales Orders', href: '/sales-orders', icon: ShoppingCart },
    { name: 'Delivery Notes', href: '/delivery-notes', icon: Truck },
    { name: 'Invoices', href: '/invoices', icon: Receipt },
  ];

  useEffect(() => {
    if (pathname.startsWith('/inventory')) {
      setInventoryOpen(true);
    }
    
    // Auto-expand parents and the active category itself
    if (activeCategoryId) {
      const expandHierarchy = (cats) => {
        let found = false;
        for (const cat of cats) {
          // If this is the active category, expand it
          if (cat.id === activeCategoryId) {
            if (cat.subcategories && cat.subcategories.length > 0) {
              setOpenCategories(prev => ({ ...prev, [cat.id]: true }));
            }
            found = true;
          } 
          // If a child is active, expand this parent
          else if (cat.subcategories && expandHierarchy(cat.subcategories)) {
            setOpenCategories(prev => ({ ...prev, [cat.id]: true }));
            found = true;
          }
        }
        return found;
      };
      expandHierarchy(categories);
    }
  }, [pathname, activeCategoryId, categories]);

  const toggleCategory = (id) => {
    setOpenCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isCategoryActive = (cat) => {
    if (cat.id === activeCategoryId) return true;
    if (cat.subcategories) {
      return cat.subcategories.some(sub => isCategoryActive(sub));
    }
    return false;
  };

  return (
    <aside className="sidebar">
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/hvg%20logo.png" alt="Hendrik Veder Group" style={{ height: '40px', maxWidth: '160px', objectFit: 'contain' }} />
        </Link>
        <button 
          onClick={toggleTheme}
          style={{ padding: '0.5rem', background: 'none', border: '1px solid var(--border)', borderRadius: '0.4rem', cursor: 'pointer' }}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, overflowY: 'auto' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isInventory = item.name === 'Inventory';
          
          return (
            <div key={item.name}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Link 
                  href={item.href}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    background: isActive ? 'var(--secondary)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                    fontWeight: isActive ? '600' : '500',
                    transition: 'all 0.2s',
                    flex: 1
                  }}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </Link>
                {item.hasDropdown && (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      if (isInventory) setInventoryOpen(!inventoryOpen);
                    }}
                    style={{ 
                      padding: '0.5rem', 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--muted-foreground)',
                      cursor: 'pointer'
                    }}
                  >
                    {inventoryOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                )}
              </div>

              {isInventory && inventoryOpen && (
                <div style={{ marginLeft: '0.5rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.125rem', borderLeft: '1px solid var(--border)' }}>
                  {categories.map(cat => {
                    const isActive = activeCategoryId === cat.id;
                    const isParentActive = isCategoryActive(cat);
                    
                    return (
                    <div key={cat.id}>
                      <div 
                        onClick={(e) => cat.subcategories.length > 0 && toggleCategory(cat.id)}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          padding: '0.5rem 1rem', 
                          cursor: cat.subcategories.length > 0 ? 'pointer' : 'default',
                          borderRadius: '0.375rem',
                          background: isActive ? 'var(--primary)' : (isParentActive ? 'var(--secondary)' : 'transparent'),
                          color: isActive ? '#ffffff' : (isParentActive ? 'var(--primary)' : 'inherit'),
                          transition: 'all 0.2s',
                          borderLeft: isParentActive && !isActive ? '3px solid var(--primary)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive && !isParentActive) e.currentTarget.style.background = 'var(--secondary)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive && !isParentActive) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <Link 
                          href={`/inventory?category=${cat.id}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{ 
                            fontSize: '0.875rem', 
                            color: isActive ? '#ffffff' : (isParentActive ? 'var(--primary)' : 'var(--foreground)'), 
                            flex: 1, 
                            fontWeight: isParentActive ? '700' : '500' 
                          }}
                        >
                          {cat.name}
                        </Link>
                        {cat.subcategories.length > 0 && (
                          <span style={{ color: isActive ? '#ffffff' : (isParentActive ? 'var(--primary)' : 'var(--muted-foreground)') }}>
                            {openCategories[cat.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </span>
                        )}
                      </div>
                      
                      {openCategories[cat.id] && cat.subcategories.map(sub => {
                        const isSubActive = activeCategoryId === sub.id;
                        const isSubParentActive = isCategoryActive(sub);
                        
                        return (
                        <div key={sub.id} style={{ marginLeft: '1rem', borderLeft: '1px solid var(--border)' }}>
                          <div 
                            onClick={(e) => sub.subcategories?.length > 0 && toggleCategory(sub.id)}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              padding: '0.4rem 1rem',
                              cursor: sub.subcategories?.length > 0 ? 'pointer' : 'default',
                              borderRadius: '0.375rem',
                              background: isSubActive ? 'var(--primary)' : (isSubParentActive ? 'var(--secondary)' : 'transparent'),
                              color: isSubActive ? '#ffffff' : (isSubParentActive ? 'var(--primary)' : 'inherit'),
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              if (!isSubActive && !isSubParentActive) e.currentTarget.style.background = 'var(--secondary)';
                            }}
                            onMouseLeave={(e) => {
                              if (!isSubActive && !isSubParentActive) e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <Link 
                              href={`/inventory?category=${sub.id}`}
                              onClick={(e) => e.stopPropagation()}
                              style={{ 
                                fontSize: '0.8125rem', 
                                color: isSubActive ? '#ffffff' : (isSubParentActive ? 'var(--primary)' : 'var(--muted-foreground)'),
                                flex: 1,
                                fontWeight: isSubParentActive ? '600' : '400'
                              }}
                            >
                              {sub.name}
                            </Link>
                            {sub.subcategories?.length > 0 && (
                              <span style={{ color: isSubActive ? '#ffffff' : (isSubParentActive ? 'var(--primary)' : 'var(--muted-foreground)') }}>
                                {openCategories[sub.id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                              </span>
                            )}
                          </div>
                          
                          {openCategories[sub.id] && sub.subcategories.map(dia => (
                            <Link 
                              key={dia.id}
                              href={`/inventory?category=${dia.id}`}
                              style={{ 
                                display: 'block', 
                                padding: '0.3rem 2rem', 
                                fontSize: '0.75rem', 
                                color: activeCategoryId === dia.id ? 'var(--primary)' : 'var(--muted-foreground)',
                                background: activeCategoryId === dia.id ? 'var(--secondary)' : 'transparent',
                                borderRadius: '0.25rem',
                                fontWeight: activeCategoryId === dia.id ? '600' : '400',
                                opacity: activeCategoryId === dia.id ? 1 : 0.7,
                                transition: 'all 0.2s'
                              }}
                            >
                              {dia.name}
                            </Link>
                          ))}
                        </div>
                      )})}
                    </div>
                  )})}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <Link 
          href="/settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            color: 'var(--muted-foreground)'
          }}
        >
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}

export default function Sidebar(props) {
  return (
    <Suspense fallback={<aside className="sidebar"><div className="sidebar-skeleton" /></aside>}>
      <SidebarInner {...props} />
    </Suspense>
  );
}

