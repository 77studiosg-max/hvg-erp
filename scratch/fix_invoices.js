
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Attempting to fix dueDate by setting it to NULL for all invoices...');
    const result = await prisma.$executeRawUnsafe(`UPDATE Invoice SET dueDate = NULL`);
    console.log(`Updated ${result} rows.`);
    
    console.log('Verifying if we can now fetch invoices...');
    const invoices = await prisma.invoice.findMany();
    console.log(`Successfully fetched ${invoices.length} invoices.`);
  } catch (error) {
    console.error('Error fixing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
