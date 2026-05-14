
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const orders = await prisma.salesOrder.findMany({
      include: {
        items: true
      }
    });
    console.log('Sales Orders and their items:');
    orders.forEach(o => {
        console.log(`Order ${o.orderNumber} (${o.id}):`);
        o.items.forEach(i => {
            console.log(`  Item ${i.productId}: Qty ${i.quantity}, Delivered ${i.deliveredQuantity}, Invoiced ${i.invoicedQuantity}`);
        });
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
