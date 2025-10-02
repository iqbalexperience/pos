"use server";

import { Product } from "@/lib/generated/prisma";
import { prisma } from "@/lib/prisma";

export async function findProductByBarcode(
  barcode: string
): Promise<Product | null> {
  if (!barcode) {
    return null;
  }

  try {
    const product = await prisma.product.findUnique({
      where: {
        barcode: barcode,
      },
    });
    return product;
  } catch (error) {
    console.error("Failed to find product:", error);
    return null;
  }
}