const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.customer.findFirst({
    where: { email: 'contact@acme.com' }
  });
  
  if (!customer) {
    console.log("Customer not found.");
    return;
  }
  
  const id = customer.id;
  
  // Delete related items (cascading manually due to SQLite limitations/Prisma raw)
  // Payments link to Invoices
  await prisma.$executeRawUnsafe(`DELETE FROM Payment WHERE invoiceId IN (SELECT id FROM Invoice WHERE customerId = ?)`, id);
  // Items link to SalesOrders
  await prisma.$executeRawUnsafe(`DELETE FROM SalesOrderItem WHERE salesOrderId IN (SELECT id FROM SalesOrder WHERE customerId = ?)`, id);
  // Items link to Quotes
  await prisma.$executeRawUnsafe(`DELETE FROM QuoteItem WHERE quoteId IN (SELECT id FROM Quote WHERE customerId = ?)`, id);
  
  // Now delete the main records
  await prisma.$executeRawUnsafe(`DELETE FROM Invoice WHERE customerId = ?`, id);
  await prisma.$executeRawUnsafe(`DELETE FROM SalesOrder WHERE customerId = ?`, id);
  await prisma.$executeRawUnsafe(`DELETE FROM Quote WHERE customerId = ?`, id);
  
  // Finally delete the customer
  await prisma.$executeRawUnsafe(`DELETE FROM Customer WHERE id = ?`, id);
  
  console.log(`Deleted customer ${id} and all related records.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
