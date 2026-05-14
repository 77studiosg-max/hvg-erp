const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const targetCategoryNames = ['Masterlink', 'Masterlink Assembly'];
  
  for (const parentName of targetCategoryNames) {
    const parent = await prisma.productCategory.findFirst({
      where: { name: parentName }
    });

    if (!parent) {
      console.log(`Parent ${parentName} not found.`);
      continue;
    }

    // 1. Rename 'w.Hackett' to 'WH'
    const wh = await prisma.productCategory.findFirst({
      where: { name: 'w.Hackett', parentId: parent.id }
    });
    if (wh) {
      await prisma.productCategory.update({
        where: { id: wh.id },
        data: { name: 'WH' }
      });
      console.log(`Renamed w.Hackett to WH in ${parentName}`);
    }

    // 2. Add 'GN'
    await prisma.productCategory.upsert({
      where: { 
        id: (await prisma.productCategory.findFirst({
          where: { name: 'GN', parentId: parent.id }
        }))?.id || 'new-id-gn-' + parent.id.substring(0, 5)
      },
      update: {},
      create: {
        name: 'GN',
        parentId: parent.id,
        unit: 'pcs'
      }
    });
    console.log(`Added GN to ${parentName}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
