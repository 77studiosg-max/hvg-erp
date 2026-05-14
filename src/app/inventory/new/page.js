export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ProductForm from '@/components/ProductForm';

async function getCategories() {
  const allCategories = await prisma.productCategory.findMany({
    include: { parent: { include: { parent: true } } },
    orderBy: { name: 'asc' }
  });
  return allCategories;
}

export default async function NewProductPage({ searchParams }) {
  const params = await searchParams;
  const preSelectedId = params?.categoryId;
  const categories = await getCategories();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/inventory" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <ArrowLeft size={16} /> Back to Inventory
      </Link>

      <header style={{ marginBottom: '2rem' }}>
        <h1>Add New Inventory Item</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>Define a new product or assembly for your catalog.</p>
      </header>

      <ProductForm categories={categories} preSelectedId={preSelectedId} />
    </div>
  );
}
