const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const masterlink = await prisma.productCategory.findFirst({
    where: { name: 'Masterlink' }
  });

  if (!masterlink) {
    console.error('Masterlink category not found.');
    return;
  }

  const subGroups = ['Crosby', 'w.Hackett', 'VB', 'Gunnebo'];
  
  for (const name of subGroups) {
    await prisma.productCategory.upsert({
      where: { 
        id: (await prisma.productCategory.findFirst({
          where: { name, parentId: masterlink.id }
        }))?.id || 'new-id'
      },
      update: {},
      create: {
        name,
        parentId: masterlink.id,
        unit: 'pcs'
      }
    });
  }

  console.log(`Added ${subGroups.length} subgroups to Masterlink.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
