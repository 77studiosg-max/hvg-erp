const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sku = 'TE1/2ST';
  const product = await prisma.product.findFirst({
    where: { sku }
  });
  
  if (!product) {
    console.log("Product not found.");
    return;
  }
  
  const id = product.id;
  console.log(`Attempting to delete product ${id} (${sku})`);
  
  try {
    await prisma.$executeRawUnsafe(`DELETE FROM BOMItem WHERE parentId = ? OR componentId = ?`, id, id);
    await prisma.$executeRawUnsafe(`DELETE FROM QuoteItem WHERE productId = ?`, id);
    await prisma.$executeRawUnsafe(`DELETE FROM SalesOrderItem WHERE productId = ?`, id);
    await prisma.$executeRawUnsafe(`DELETE FROM PurchaseOrderItem WHERE productId = ?`, id);
    await prisma.$executeRawUnsafe(`DELETE FROM Product WHERE id = ?`, id);
    console.log("Deleted successfully.");
  } catch (e) {
    console.error("Delete failed:", e);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
