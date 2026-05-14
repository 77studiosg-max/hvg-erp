const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up database...');
  // Clear existing data in correct order
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.deliveryNoteItem.deleteMany();
  await prisma.deliveryNote.deleteMany();
  await prisma.salesOrderItemBOM.deleteMany();
  await prisma.salesOrderItem.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.quoteItemBOM.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.bOMItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.vendor.deleteMany();

  console.log('Seeding master categories...');
  const masterCategories = [
    { name: 'Wire Rope', description: 'Various types of wire ropes', unit: 'mtr' },
    { name: 'Shackles', description: 'Lifting and rigging shackles', unit: 'pcs' },
    { name: 'Masterlink', description: 'Single master links', unit: 'pcs' },
    { name: 'Masterlink Assembly', description: 'Master link assemblies with sub-links', unit: 'pcs', bomEnabled: true },
    { name: 'Hooks', description: 'Lifting hooks', unit: 'pcs' },
    { name: 'Sockets', description: 'Wire rope sockets', unit: 'pcs' },
    { name: 'Thimbles', description: 'Wire rope thimbles', unit: 'pcs' },
    { name: 'Ferrules', description: 'Ferrules and sleeves', unit: 'pcs' },
    { name: 'Raw Materials', description: 'Basic components', unit: 'pcs' },
    { name: 'Finished Goods', description: 'Ready for sale', unit: 'pcs', bomEnabled: true },
    { name: 'WR SLING ASSEMBLY', description: 'Wire Rope Sling Assemblies with dynamic BOMs', unit: 'pcs', bomEnabled: true }
  ];

  const createdMasters = {};
  for (const cat of masterCategories) {
    createdMasters[cat.name] = await prisma.productCategory.create({ data: cat });
  }

  console.log('Seeding subgroups...');
  
  // Wire Rope Subgroups
  const ropeTypes = ['IWRC', 'FC', '19X7', '35X7 - 1960', '35X7 - 2160'];
  const diameters = [
    '6mm', '8mm', '9mm', '10mm', '11mm', '12mm', '13mm', '14mm', '15mm', 
    '16mm', '18mm', '19mm', '20mm', '22mm', '24mm', '26mm', '28mm', '30mm', 
    '32mm', '34mm', '36mm', '38mm', '40mm', '42mm', '44mm', '46mm', '48mm', 
    '52mm', '54mm', '56mm', '58mm', '60mm', '64mm', '66mm', '68mm', '70mm', 
    '71mm', '76mm', '77mm', '83mm', '90mm'
  ];

  for (const type of ropeTypes) {
    const parent = await prisma.productCategory.create({
      data: { name: type, parentId: createdMasters['Wire Rope'].id, unit: 'mtr' }
    });
    for (const dia of diameters) {
      await prisma.productCategory.create({
        data: { name: dia, parentId: parent.id, unit: 'mtr' }
      });
    }
  }

  // Shackles Subgroups
  const shackleBrands = ['Green Pin', 'Crosby', 'GN'];
  for (const brand of shackleBrands) {
    await prisma.productCategory.create({
      data: { name: brand, parentId: createdMasters['Shackles'].id, unit: 'pcs' }
    });
  }

  // Masterlink / Masterlink Assembly Subgroups
  const mlBrands = ['GN', 'WH'];
  for (const brand of mlBrands) {
    await prisma.productCategory.create({
      data: { name: brand, parentId: createdMasters['Masterlink'].id, unit: 'pcs' }
    });
    await prisma.productCategory.create({
      data: { name: brand, parentId: createdMasters['Masterlink Assembly'].id, unit: 'pcs', bomEnabled: true }
    });
  }

  // Hooks Subgroups
  const hookTypes = ['Clevis', 'Eye'];
  for (const type of hookTypes) {
    await prisma.productCategory.create({
      data: { name: type, parentId: createdMasters['Hooks'].id, unit: 'pcs' }
    });
  }

  // Sockets Subgroups
  const socketTypes = ['Open Spelter', 'Closed Spelter', 'Wedge'];
  for (const type of socketTypes) {
    await prisma.productCategory.create({
      data: { name: type, parentId: createdMasters['Sockets'].id, unit: 'pcs' }
    });
  }

  console.log('Seeding base products...');
  // WR SLING ASSEMBLY Products
  const catSling = createdMasters['WR SLING ASSEMBLY'];
  const slingNames = ['1leg', '2legs', '3legs', '4legs', '5legs'];
  for (const name of slingNames) {
    const sku = `WRS-${name.toUpperCase()}`;
    await prisma.product.create({
      data: { 
        sku, 
        name, 
        price: 0, 
        stockLevel: 0, 
        categoryId: catSling.id, 
        unit: 'pcs', 
        isBOM: true,
        description: `${name} wire rope sling assembly`
      }
    });
  }

  // Sample Raw Materials
  const catRaw = createdMasters['Raw Materials'];
  await prisma.product.create({
    data: { sku: 'BOLT-10', name: 'Steel Bolt 10mm', price: 0.5, unit: 'pcs', stockLevel: 1000, categoryId: catRaw.id }
  });
  await prisma.product.create({
    data: { sku: 'NUT-10', name: 'Steel Nut 10mm', price: 0.2, unit: 'pcs', stockLevel: 1500, categoryId: catRaw.id }
  });

  // Sample Customers & Vendors
  console.log('Seeding customers and vendors...');
  await prisma.customer.create({
    data: {
      companyName: 'Acme Rigging Solutions',
      contactName: 'John Rigging',
      email: 'john@acmerigging.com',
      customerNumber: 'C0001',
      paymentTerms: 'Net 30'
    }
  });

  await prisma.vendor.create({
    data: {
      companyName: 'Global Lifting Supplies',
      contactName: 'Jane Lift',
      email: 'jane@globallifting.com',
      vendorNumber: 'V0001'
    }
  });

  // Sample Sales Order with BOM items
  console.log('Seeding sample sales order...');
  const customer = await prisma.customer.findFirst({ where: { companyName: 'Acme Rigging Solutions' } });
  const sling1L = await prisma.product.findUnique({ where: { sku: 'WRS-1LEG' } });
  const bolt = await prisma.product.findUnique({ where: { sku: 'BOLT-10' } });
  const nut = await prisma.product.findUnique({ where: { sku: 'NUT-10' } });

  const so = await prisma.salesOrder.create({
    data: {
      orderNumber: 'SO-2026-001',
      customerId: customer.id,
      status: 'Pending',
      totalAmount: 15.0,
      vatRate: 20,
      items: {
        create: [
          {
            productId: sling1L.id,
            quantity: 10,
            unitPrice: 1.5,
            customDescription: 'Custom 1-leg sling with special end fittings',
            bomItems: {
              create: [
                { productId: bolt.id, quantity: 2, unitPrice: 0.5 },
                { productId: nut.id, quantity: 2, unitPrice: 0.2 }
              ]
            }
          }
        ]
      }
    }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
