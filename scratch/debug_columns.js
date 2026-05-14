
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Fetching invoice IDs...');
    const ids = await prisma.invoice.findMany({
      select: { id: true, invoiceNumber: true }
    });
    console.log(`Found ${ids.length} invoices:`, ids);
    
    // Now try to fetch one by one with all fields to find the broken one
    for (const inv of ids) {
      try {
        await prisma.invoice.findUnique({ where: { id: inv.id } });
        console.log(`Invoice ${inv.invoiceNumber} (${inv.id}) is OK`);
      } catch (e) {
        console.error(`Invoice ${inv.invoiceNumber} (${inv.id}) is BROKEN:`, e.message);
      }
    }

    // Check specific columns
    const columns = ['status', 'totalAmount', 'vatRate', 'discount', 'dueDate', 'createdAt', 'updatedAt'];
    for (const col of columns) {
        try {
            await prisma.invoice.findMany({ select: { [col]: true } });
            console.log(`Column ${col} is OK`);
        } catch (e) {
            console.error(`Column ${col} is BROKEN:`, e.message);
        }
    }

  } catch (error) {
    console.error('Error in main:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
