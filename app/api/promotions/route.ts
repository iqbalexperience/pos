import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const promotions = await prisma.promotion.findMany({
      include: {
        products: true, // Include the products this promotion applies to
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(promotions);
  } catch (error) {
    console.error('[PROMOTIONS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { description, type, discountValue, startDate, endDate, productIds } = body;

    if (!description || !type || !discountValue || !startDate || !productIds || !productIds.length) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const promotion = await prisma.promotion.create({
      data: {
        description,
        type,
        discountValue,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        products: {
          connect: productIds.map((id: string) => ({ id })),
        },
      },
    });

    return NextResponse.json(promotion);
  } catch (error) {
    console.error('[PROMOTIONS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}