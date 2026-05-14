
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Fetching all customers...');
    const customers = await prisma.customer.findMany();
    console.log('Customers:', JSON.stringify(customers, null, 2));
    
    console.log('Fetching all products...');
    const products = await prisma.product.findMany();
    console.log('Products count:', products.length);
    if (products.length > 0) console.log('First product:', JSON.stringify(products[0], null, 2));

    console.log('Fetching all categories...');
    const categories = await prisma.productCategory.findMany();
    console.log('Categories count:', categories.length);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
