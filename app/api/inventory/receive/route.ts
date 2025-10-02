import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, quantityReceived, expirationDate } = body;

    if (!productId || !quantityReceived || quantityReceived <= 0) {
      return new NextResponse('Product ID and a valid quantity are required', { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Create the new inventory lot
      await tx.inventoryLot.create({
        data: {
          productId,
          quantityReceived,
          quantityRemaining: quantityReceived,
          expirationDate: expirationDate ? new Date(expirationDate) : null,
        },
      });

      // 2. Update the total stock quantity on the main product
      await tx.product.update({
        where: { id: productId },
        data: {
          stockQuantity: {
            increment: quantityReceived,
          },
        },
      });
    });

    return NextResponse.json({ message: 'Stock received successfully' });
  } catch (error) {
    console.error('[INVENTORY_RECEIVE_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}