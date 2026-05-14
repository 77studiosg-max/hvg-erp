export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import QuoteForm from '@/components/QuoteForm';
import { updateQuote } from '@/app/actions/quotes';
import { FileText, ArrowLeft, Printer } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getData(id) {
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          bomItems: true
        }
      }
    }
  });
  
  if (!quote) return null;

  const [customers, products, categories] = await Promise.all([
    prisma.customer.findMany({ orderBy: { companyName: 'asc' } }),
    prisma.product.findMany({ orderBy: { name: 'asc' } }),
    prisma.productCategory.findMany({ orderBy: { name: 'asc' } })
  ]);
  
  const productsWithStock = products.map(p => ({ ...p, totalStock: p.stockLevel }));

  return { 
    quote, 
    customers, 
    products: productsWithStock,
    categories
  };
}

export default async function EditQuotePage({ params }) {
  const { id } = await params;
  const data = await getData(id);
  
  if (!data) notFound();

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <Link href="/quotes" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '1rem', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to Quotes
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <FileText size={28} className="text-primary" />
            <h1>Edit Quotation: {data.quote.quoteNumber}</h1>
          </div>
          <p style={{ color: 'var(--muted-foreground)' }}>Update quote details and line items.</p>
        </div>
        
        <Link 
          href={`/quotes/${id}/print`} 
          className="btn-secondary" 
          target="_blank"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}
        >
          <Printer size={18} /> Print / PDF
        </Link>
      </header>

      <QuoteForm 
        action={updateQuote.bind(null, id)} 
        initialData={data.quote}
        customers={data.customers} 
        products={data.products} 
        categories={data.categories}
      />
    </div>
  );
}
