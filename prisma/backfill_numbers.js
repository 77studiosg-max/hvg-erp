const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.$queryRawUnsafe(`SELECT id FROM Customer WHERE customerNumber IS NULL OR customerNumber = ''`);
  console.log(`Found ${customers.length} customers without numbers.`);
  
  for (let i = 0; i < customers.length; i++) {
    const num = `C${String(i + 1).padStart(4, '0')}`;
    await prisma.$executeRawUnsafe(`UPDATE Customer SET customerNumber = ? WHERE id = ?`, num, customers[i].id);
    console.log(`Updated customer ${customers[i].id} to ${num}`);
  }

  const vendors = await prisma.$queryRawUnsafe(`SELECT id FROM Vendor WHERE vendorNumber IS NULL OR vendorNumber = ''`);
  console.log(`Found ${vendors.length} vendors without numbers.`);
  
  for (let i = 0; i < vendors.length; i++) {
    const num = `V${String(i + 1).padStart(4, '0')}`;
    await prisma.$executeRawUnsafe(`UPDATE Vendor SET vendorNumber = ? WHERE id = ?`, num, vendors[i].id);
    console.log(`Updated vendor ${vendors[i].id} to ${num}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
