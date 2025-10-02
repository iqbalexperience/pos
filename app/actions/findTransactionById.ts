"use server";

import { prisma } from "@/lib/prisma";
import { CartItem } from "@/app/store/use-cart-store"; // Corrected import path

// The return type is now an object to handle success and error cases
export async function findTransactionById(
  transactionId: string
): Promise<{ items?: CartItem[]; error?: string; transactionId?: string }> {
  if (!transactionId) {
    return { error: "Transaction ID is required." };
  }

  try {
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
      include: {
        items: true,
      },
    });

    if (!transaction) {
      return { error: "Transaction not found." };
    }

    // THIS IS THE NEW CHECK
    if (transaction.refundedById) {
      return { error: "This transaction has already been refunded." };
    }
    
    // Do not allow refunding a refund transaction
    if (transaction.total < 0) {
        return { error: "Cannot process a return for a refund transaction."};
    }

    const cartItemsForReturn: CartItem[] = [];
    for (const item of transaction.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (product) {
        cartItemsForReturn.push({
          product: product,
          quantity: -item.quantity, // Make quantity negative for returns
          weight: item.weight ?? undefined,
        });
      }
    }

    return { items: cartItemsForReturn, transactionId: transaction.id };
  } catch (error) {
    console.error("Failed to find transaction:", error);
    return { error: "An unexpected error occurred." };
  }
}