const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const vendor = await prisma.vendor.findFirst({
    where: { email: 'sales@globalsteel.com' }
  });
  
  if (!vendor) {
    console.log("Vendor not found.");
    return;
  }
  
  const id = vendor.id;
  
  // Delete related items
  await prisma.$executeRawUnsafe(`DELETE FROM PurchaseOrderItem WHERE purchaseOrderId IN (SELECT id FROM PurchaseOrder WHERE vendorId = ?)`, id);
  
  // Delete main records
  await prisma.$executeRawUnsafe(`DELETE FROM PurchaseOrder WHERE vendorId = ?`, id);
  
  // Finally delete the vendor
  await prisma.$executeRawUnsafe(`DELETE FROM Vendor WHERE id = ?`, id);
  
  console.log(`Deleted vendor ${id} and all related records.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
