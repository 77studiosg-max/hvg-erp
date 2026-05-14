import { prisma } from '@/lib/prisma';
import { Settings } from 'lucide-react';
import { createCategory, deleteCategory, updateCategory, toggleCategoryBOM } from '@/app/actions/settings';
import DeleteButton from '@/components/DeleteButton';
import CategoryManager from '@/components/CategoryManager';

async function getCategories() {
  return await prisma.productCategory.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { name: 'asc' }
  });
}

export default async function SettingsPage() {
  const categories = await getCategories();
  const parentCategories = categories.filter(c => !c.parentId);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Settings size={28} className="text-primary" />
          <h1>Settings</h1>
        </div>
        <p style={{ color: 'var(--muted-foreground)' }}>Configure your ERP system groups and inventory structure.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Add New Category Section - Now using Expandable Manager */}
          <CategoryManager 
            parentCategories={parentCategories} 
            allCategories={categories}
            createCategoryAction={createCategory} 
            deleteCategoryAction={deleteCategory}
            updateCategoryAction={updateCategory}
            toggleBOMAction={toggleCategoryBOM}
          />
      </div>
    </div>
  );
}
