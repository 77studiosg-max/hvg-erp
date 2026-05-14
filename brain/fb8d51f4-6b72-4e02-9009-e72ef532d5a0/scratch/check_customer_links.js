const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.customer.findFirst({
    where: { email: 'contact@acme.com' },
    include: {
      quotes: true,
      salesOrders: true,
      invoices: true
    }
  });
  
  if (!customer) {
    console.log("Customer not found.");
    return;
  }
  
  console.log("Found Customer:", customer.companyName);
  console.log("Quotes:", customer.quotes.length);
  console.log("Sales Orders:", customer.salesOrders.length);
  console.log("Invoices:", customer.invoices.length);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
