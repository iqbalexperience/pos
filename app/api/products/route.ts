import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        vendor: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('[PRODUCTS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST a new product
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Simple validation
    if (!body.name || !body.sku || !body.price || !body.categoryId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        ...body,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCTS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}