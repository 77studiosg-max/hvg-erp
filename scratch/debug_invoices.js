
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Fetching all invoices...');
    const invoices = await prisma.invoice.findMany();
    console.log(`Successfully fetched ${invoices.length} invoices.`);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    
    console.log('\nTrying to fetch invoices one by one to find the culprit...');
    // We can't really do findMany if it's broken at the engine level, 
    // but maybe we can try raw queries to see the data.
    try {
        const rawInvoices = await prisma.$queryRaw`SELECT * FROM Invoice`;
        console.log('Raw invoices fetched:', JSON.stringify(rawInvoices, null, 2));
    } catch (rawError) {
        console.error('Raw query failed:', rawError);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
