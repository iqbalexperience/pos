import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { customerId: string } }
) {
    const {customerId} = await params
  try {
    const body = await req.json();
    const { firstName, lastName, phone, email } = body;

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: { firstName, lastName, phone, email },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('[CUSTOMER_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { customerId: string } }
) {
    const {customerId} = await params
  try {
    const customer = await prisma.customer.delete({
      where: { id: customerId },
    });
    return NextResponse.json(customer);
  } catch (error) {
    console.error('[CUSTOMER_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}