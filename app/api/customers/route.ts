import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(customers);
  } catch (error) {
    console.error('[CUSTOMERS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, phone, email } = body;

    if (!firstName || !lastName) {
      return new NextResponse('First and last name are required', { status: 400 });
    }

    const customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        phone,
        email,
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('[CUSTOMERS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}