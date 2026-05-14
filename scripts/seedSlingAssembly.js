const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding WR SLING ASSEMBLY...');

  // 1. Create or find category
  let category = await prisma.productCategory.findFirst({
    where: { name: 'WR SLING ASSEMBLY' }
  });

  if (!category) {
    category = await prisma.productCategory.create({
      data: {
        name: 'WR SLING ASSEMBLY',
        description: 'Wire Rope Sling Assemblies with dynamic BOMs',
      }
    });
    console.log('Created category WR SLING ASSEMBLY');
  } else {
    console.log('Category WR SLING ASSEMBLY already exists');
  }

  // 2. Create products
  const productsToCreate = [
    { sku: 'WRS-1L', name: '1leg', description: '1-leg wire rope sling assembly' },
    { sku: 'WRS-2L', name: '2legs', description: '2-leg wire rope sling assembly' },
    { sku: 'WRS-3L', name: '3legs', description: '3-leg wire rope sling assembly' },
    { sku: 'WRS-4L', name: '4legs', description: '4-leg wire rope sling assembly' },
    { sku: 'WRS-5L', name: '5legs', description: '5-leg wire rope sling assembly' },
  ];

  for (const prod of productsToCreate) {
    const existing = await prisma.product.findUnique({ where: { sku: prod.sku } });
    if (!existing) {
      await prisma.product.create({
        data: {
          sku: prod.sku,
          name: prod.name,
          description: prod.description,
          price: 0,
          stockLevel: 0,
          categoryId: category.id,
          unit: 'pcs',
          isBOM: true // Since it's a dynamic BOM assembly
        }
      });
      console.log(`Created product ${prod.name}`);
    } else {
      console.log(`Product ${prod.name} already exists`);
      // Update category just in case
      await prisma.product.update({
        where: { id: existing.id },
        data: { categoryId: category.id, isBOM: true }
      });
    }
  }

  console.log('Seeding complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
