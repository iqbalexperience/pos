import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CartItem } from '@/app/store/use-cart-store';

interface RequestBody {
  cartItems: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  tenderType: 'CASH' | 'CARD';
  amountTendered?: number;
  originalTransactionId?: string; // ID of the sale being refunded
}

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const { cartItems, subtotal, tax, total, tenderType, amountTendered, originalTransactionId } = body;
    const isRefund = total < 0;

    // Use an interactive transaction to ensure all operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // 1. Create the new transaction (either a sale or a refund)
      const createdTransaction = await tx.transaction.create({
        data: {
          subtotal,
          tax,
          total,
          tenderType,
          amountTendered,
          changeGiven: amountTendered && !isRefund ? amountTendered - total : 0,
          items: {
            create: cartItems.map((item) => ({
              productId: item.product.id,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              weight: item.weight,
            })),
          },
        },
      });

      // 2. If it's a refund, link it to the original transaction
      if (isRefund && originalTransactionId) {
        await tx.transaction.update({
          where: { id: originalTransactionId },
          data: { refundedById: createdTransaction.id },
        });
      }

      // 3. Stock management logic (FEFO)
      for (const item of cartItems) {
        if (item.product.isWeighed) continue; // Skip weighed items

        let quantityToProcess = Math.abs(item.quantity);

        if (isRefund) {
          // For refunds: increment product stock
          await tx.product.update({
            where: { id: item.product.id },
            data: { stockQuantity: { increment: quantityToProcess } },
          });
        } else {
          // For sales: decrement stock from earliest-expiring lots (FEFO)
          const lots = await tx.inventoryLot.findMany({
            where: {
              productId: item.product.id,
              quantityRemaining: { gt: 0 },
            },
            orderBy: {
              expirationDate: 'asc',
            },
          });

          for (const lot of lots) {
            if (quantityToProcess === 0) break;

            const amountToTake = Math.min(lot.quantityRemaining, quantityToProcess);

            await tx.inventoryLot.update({
              where: { id: lot.id },
              data: { quantityRemaining: { decrement: amountToTake } },
            });

            quantityToProcess -= amountToTake;
          }

          if (quantityToProcess > 0) {
            // Not enough stock in lots
            throw new Error(`Insufficient stock for product ${item.product.name}`);
          }

          // Decrement main product stock
          await tx.product.update({
            where: { id: item.product.id },
            data: { stockQuantity: { decrement: Math.abs(item.quantity) } },
          });
        }
      }
    });

    const message = isRefund ? "Refund completed" : "Sale completed";
    return NextResponse.json({ message });
  } catch (error) {
    console.error('[TRANSACTION_POST]', error);
    if (error instanceof Error && error.message.startsWith("Insufficient stock")) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
