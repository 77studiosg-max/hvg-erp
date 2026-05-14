const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const targetCategoryName = 'Masterlink Assembly';
  const targetCategory = await prisma.productCategory.findFirst({
    where: { name: targetCategoryName }
  });

  if (!targetCategory) {
    console.error(`${targetCategoryName} category not found.`);
    return;
  }

  const subGroups = ['Crosby', 'w.Hackett', 'VB', 'Gunnebo'];
  
  for (const name of subGroups) {
    await prisma.productCategory.upsert({
      where: { 
        id: (await prisma.productCategory.findFirst({
          where: { name, parentId: targetCategory.id }
        }))?.id || 'new-id'
      },
      update: {},
      create: {
        name,
        parentId: targetCategory.id,
        unit: 'pcs'
      }
    });
  }

  console.log(`Added ${subGroups.length} subgroups to ${targetCategoryName}.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
