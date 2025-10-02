import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Seeding initial data...');
    
    // Seed Roles (already here)
    await prisma.role.upsert({ where: { name: 'Manager' }, update: {}, create: { name: 'Manager', permissions: 'all' } });
    await prisma.role.upsert({ where: { name: 'Cashier' }, update: {}, create: { name: 'Cashier', permissions: 'process_sales' } });

    // Seed a default Vendor
    const defaultVendor = await prisma.vendor.upsert({
      where: { name: 'General Supplier' },
      update: {},
      create: { name: 'General Supplier' },
    });
    
    // Seed Departments
    const produceDept = await prisma.department.upsert({
      where: { name: 'Produce' },
      update: {},
      create: { name: 'Produce' },
    });
    const dairyDept = await prisma.department.upsert({
      where: { name: 'Dairy & Eggs' },
      update: {},
      create: { name: 'Dairy & Eggs' },
    });

    // Seed Categories linked to Departments
    await prisma.category.upsert({
      where: { name_departmentId: { name: 'Fresh Vegetables', departmentId: produceDept.id } },
      update: {},
      create: { name: 'Fresh Vegetables', departmentId: produceDept.id },
    });
    await prisma.category.upsert({
      where: { name_departmentId: { name: 'Milk', departmentId: dairyDept.id } },
      update: {},
      create: { name: 'Milk', departmentId: dairyDept.id },
    });

    console.log('Setup complete.');
    return NextResponse.json({ message: 'Setup complete. Initial data seeded.' });

  } catch (error) {
    console.error('[SETUP_ERROR]', error);
    return new NextResponse('Internal Server Error during setup', { status: 500 });
  }
}