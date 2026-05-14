import { prisma } from '@/lib/prisma';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductForm from '@/components/ProductForm';

async function getProduct(id) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      bomItems: {
        include: { component: true }
      }
    }
  });
  if (!product) notFound();
  return product;
}

async function getCategories() {
  return await prisma.productCategory.findMany({
    include: { parent: { include: { parent: true } } },
    orderBy: { name: 'asc' }
  });
}

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  const categories = await getCategories();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link href={`/inventory/${id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <ArrowLeft size={16} /> Back to Details
      </Link>

      <header style={{ marginBottom: '2rem' }}>
        <h1>Edit Item: {product.name}</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>Update the specifications, pricing, or stock level.</p>
      </header>

      <ProductForm 
        categories={categories} 
        initialData={product} 
        isEdit={true}
      />
    </div>
  );
}
