'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createCustomer(formData) {
  const companyName = formData.get('companyName');
  const contactName = formData.get('contactName');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const addressLine1 = formData.get('addressLine1');
  const addressLine2 = formData.get('addressLine2');
  const city = formData.get('city');
  const postcode = formData.get('postcode');
  const country = formData.get('country') || 'United Kingdom';
  const vatNumber = formData.get('vatNumber');
  const companyRegNumber = formData.get('companyRegNumber');
  const paymentTerms = formData.get('paymentTerms') || 'Net 30';

  // Auto-generate Customer Number
  const count = await prisma.customer.count();
  const customerNumber = `C${String(count + 1).padStart(4, '0')}`;

  const customer = await prisma.customer.create({
    data: {
      id: crypto.randomUUID(),
      customerNumber,
      companyName,
      contactName,
      email,
      phone,
      addressLine1,
      addressLine2,
      city,
      postcode,
      country,
      vatNumber,
      companyRegNumber,
      paymentTerms
    }
  });

  revalidatePath('/customers');
  redirect('/customers');
}

export async function createVendor(formData) {
  const companyName = formData.get('companyName');
  const contactName = formData.get('contactName');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const addressLine1 = formData.get('addressLine1');
  const addressLine2 = formData.get('addressLine2');
  const city = formData.get('city');
  const postcode = formData.get('postcode');
  const country = formData.get('country') || 'United Kingdom';
  const vatNumber = formData.get('vatNumber');
  const companyRegNumber = formData.get('companyRegNumber');
  const paymentTerms = formData.get('paymentTerms') || 'Net 30';

  // Auto-generate Vendor Number
  const count = await prisma.vendor.count();
  const vendorNumber = `V${String(count + 1).padStart(4, '0')}`;

  const vendor = await prisma.vendor.create({
    data: {
      id: crypto.randomUUID(),
      vendorNumber,
      companyName,
      contactName,
      email,
      phone,
      addressLine1,
      addressLine2,
      city,
      postcode,
      country,
      vatNumber,
      companyRegNumber,
      paymentTerms
    }
  });

  revalidatePath('/vendors');
  redirect('/vendors');
}

export async function updateCustomer(id, formData) {
  const companyName = formData.get('companyName');
  const contactName = formData.get('contactName');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const addressLine1 = formData.get('addressLine1');
  const addressLine2 = formData.get('addressLine2');
  const city = formData.get('city');
  const postcode = formData.get('postcode');
  const country = formData.get('country') || 'United Kingdom';
  const vatNumber = formData.get('vatNumber');
  const companyRegNumber = formData.get('companyRegNumber');
  const paymentTerms = formData.get('paymentTerms');

  await prisma.customer.update({
    where: { id },
    data: {
      companyName, contactName, email, phone,
      addressLine1, addressLine2, city, postcode,
      country, vatNumber, companyRegNumber, paymentTerms
    }
  });

  revalidatePath('/customers');
  revalidatePath(`/customers/${id}`);
  redirect('/customers');
}

export async function updateVendor(id, formData) {
  const companyName = formData.get('companyName');
  const contactName = formData.get('contactName');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const addressLine1 = formData.get('addressLine1');
  const addressLine2 = formData.get('addressLine2');
  const city = formData.get('city');
  const postcode = formData.get('postcode');
  const country = formData.get('country') || 'United Kingdom';
  const vatNumber = formData.get('vatNumber');
  const companyRegNumber = formData.get('companyRegNumber');
  const paymentTerms = formData.get('paymentTerms');

  await prisma.vendor.update({
    where: { id },
    data: {
      companyName, contactName, email, phone,
      addressLine1, addressLine2, city, postcode,
      country, vatNumber, companyRegNumber, paymentTerms
    }
  });

  revalidatePath('/vendors');
  revalidatePath(`/vendors/${id}`);
  redirect('/vendors');
}

export async function deleteCustomer(id) {
  await prisma.customer.delete({ where: { id } });
  revalidatePath('/customers');
  redirect('/customers');
}

export async function deleteVendor(id) {
  await prisma.vendor.delete({ where: { id } });
  revalidatePath('/vendors');
  redirect('/vendors');
}

export async function copyCustomerToVendor(id) {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) throw new Error('Customer not found');

  // Auto-generate Vendor Number
  const count = await prisma.vendor.count();
  const vendorNumber = `V${String(count + 1).padStart(4, '0')}`;

  const newVendor = await prisma.vendor.create({
    data: {
      id: crypto.randomUUID(),
      vendorNumber,
      companyName: customer.companyName,
      contactName: customer.contactName,
      email: customer.email,
      phone: customer.phone,
      addressLine1: customer.addressLine1,
      addressLine2: customer.addressLine2,
      city: customer.city,
      postcode: customer.postcode,
      country: customer.country,
      vatNumber: customer.vatNumber,
      companyRegNumber: customer.companyRegNumber,
      paymentTerms: customer.paymentTerms
    }
  });
  const newId = newVendor.id;

  revalidatePath('/vendors');
  redirect(`/vendors/${newId}`);
}

export async function copyVendorToCustomer(id) {
  const vendor = await prisma.vendor.findUnique({ where: { id } });
  if (!vendor) throw new Error('Vendor not found');

  // Auto-generate Customer Number
  const count = await prisma.customer.count();
  const customerNumber = `C${String(count + 1).padStart(4, '0')}`;

  const newCustomer = await prisma.customer.create({
    data: {
      id: crypto.randomUUID(),
      customerNumber,
      companyName: vendor.companyName,
      contactName: vendor.contactName,
      email: vendor.email,
      phone: vendor.phone,
      addressLine1: vendor.addressLine1,
      addressLine2: vendor.addressLine2,
      city: vendor.city,
      postcode: vendor.postcode,
      country: vendor.country,
      vatNumber: vendor.vatNumber,
      companyRegNumber: vendor.companyRegNumber,
      paymentTerms: vendor.paymentTerms
    }
  });
  const newId = newCustomer.id;

  revalidatePath('/customers');
  redirect(`/customers/${newId}`);
}
