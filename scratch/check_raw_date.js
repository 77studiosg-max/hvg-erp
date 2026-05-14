
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Fetching raw dueDate as string...');
    // We can use TYPEOF or just cast to see what's in there
    const result = await prisma.$queryRawUnsafe(`SELECT id, invoiceNumber, dueDate, TYPEOF(dueDate) as type FROM Invoice`);
    console.log('Raw result:', result);
  } catch (error) {
    console.error('Error fetching raw data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
