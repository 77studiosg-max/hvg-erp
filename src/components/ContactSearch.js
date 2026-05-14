'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function ContactSearchInner({ placeholder }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (query) {
        params.set('q', query);
      } else {
        params.delete('q');
      }
      router.push(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, pathname, router, searchParams]);

  return (
    <div className="search-container" style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
      <Search 
        size={18} 
        style={{ 
          position: 'absolute', 
          left: '1rem', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          color: 'var(--muted-foreground)' 
        }} 
      />
      <input
        type="text"
        placeholder={placeholder || "Search contacts..."}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem 1rem 0.75rem 3rem',
          borderRadius: '0.75rem',
          border: '1px solid var(--border)',
          background: 'var(--secondary)',
          fontSize: '0.875rem'
        }}
      />
    </div>
  );
}

export default function ContactSearch(props) {
  return (
    <Suspense fallback={<div style={{ height: '40px', background: 'var(--secondary)', borderRadius: '0.75rem' }} />}>
      <ContactSearchInner {...props} />
    </Suspense>
  );
}

