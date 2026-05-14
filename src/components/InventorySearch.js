'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';

function InventorySearchInner({ initialValue }) {
  const [value, setValue] = useState(initialValue || '');
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const createQueryString = useCallback(
    (name, val) => {
      const params = new URLSearchParams(searchParams.toString());
      if (val) {
        params.set(name, val);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQ = searchParams.get('q') || '';
      if (value !== currentQ) {
        router.push(`${pathname}?${createQueryString('q', value)}`, { scroll: false });
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [value, pathname, router, createQueryString, searchParams]);

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
      <input 
        type="text" 
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search SKU, Name, Category, Price, Stock..." 
        style={{ paddingLeft: '2.5rem' }}
      />
    </div>
  );
}

export default function InventorySearch(props) {
  return (
    <Suspense fallback={<div style={{ height: '40px', background: 'var(--secondary)', borderRadius: '0.375rem' }} />}>
      <InventorySearchInner {...props} />
    </Suspense>
  );
}

