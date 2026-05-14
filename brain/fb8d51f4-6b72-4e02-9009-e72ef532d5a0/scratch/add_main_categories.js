const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const newMainGroups = ['Hooks', 'Sockets'];
  
  for (const name of newMainGroups) {
    await prisma.productCategory.upsert({
      where: { 
        id: (await prisma.productCategory.findFirst({
          where: { name, parentId: null }
        }))?.id || 'new-main-' + name.toLowerCase()
      },
      update: {},
      create: {
        name,
        unit: 'pcs'
      }
    });
  }

  console.log(`Added ${newMainGroups.length} main categories.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
