const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find the 'Ferrules' category
  const ferrules = await prisma.productCategory.findFirst({
    where: { name: 'Ferrules' }
  });

  if (!ferrules) {
    console.error('Ferrules category not found.');
    return;
  }

  const subGroups = ['Aluminium', 'Copper', 'Steel Sleeve', 'Steel Ferrule'];
  
  for (const name of subGroups) {
    await prisma.productCategory.upsert({
      where: { 
        // This is tricky if there's no unique constraint on name + parentId
        // But I'll just check if it exists first
        id: (await prisma.productCategory.findFirst({
          where: { name, parentId: ferrules.id }
        }))?.id || 'new-id'
      },
      update: {},
      create: {
        name,
        parentId: ferrules.id,
        unit: 'pcs'
      }
    });
  }

  console.log(`Added ${subGroups.length} subgroups to Ferrules.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
