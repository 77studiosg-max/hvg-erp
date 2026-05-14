export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import QuoteForm from '@/components/QuoteForm';
import { createQuote } from '@/app/actions/quotes';
import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

async function getData() {
  const [customers, productsRaw, categories] = await Promise.all([
    prisma.customer.findMany({ orderBy: { companyName: 'asc' } }),
    prisma.product.findMany({ orderBy: { name: 'asc' } }),
    prisma.productCategory.findMany({ orderBy: { name: 'asc' } })
  ]);
  
  const products = productsRaw.map(p => ({ ...p, totalStock: p.stockLevel }));
  
  return { customers, products, categories };
}

export default async function NewQuotePage() {
  const { customers, products, categories } = await getData();

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <Link href="/quotes" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '1rem', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Quotes
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <FileText size={28} className="text-primary" />
          <h1>New Quotation</h1>
        </div>
        <p style={{ color: 'var(--muted-foreground)' }}>Create a new professional quote for your customer.</p>
      </header>

      <QuoteForm 
        action={createQuote} 
        customers={customers} 
        products={products} 
        categories={categories}
      />
    </div>
  );
}
