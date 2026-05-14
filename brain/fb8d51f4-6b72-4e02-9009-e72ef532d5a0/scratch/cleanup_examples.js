const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const skusToDelete = ['KIT-001', 'NUT-001', 'BOLT-001'];
  
  // Delete all linked items to avoid foreign key violations
  await prisma.quoteItem.deleteMany({ where: { product: { sku: { in: skusToDelete } } } });
  await prisma.salesOrderItem.deleteMany({ where: { product: { sku: { in: skusToDelete } } } });
  await prisma.purchaseOrderItem.deleteMany({ where: { product: { sku: { in: skusToDelete } } } });
  await prisma.bOMItem.deleteMany({
    where: {
      OR: [
        { parent: { sku: { in: skusToDelete } } },
        { component: { sku: { in: skusToDelete } } }
      ]
    }
  });

  const result = await prisma.product.deleteMany({
    where: {
      sku: { in: skusToDelete }
    }
  });

  console.log(`Deleted ${result.count} example items.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
