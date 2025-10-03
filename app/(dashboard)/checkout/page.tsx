import { prisma } from '@/lib/prisma';
import { CheckoutClient } from './components/checkout-client';
import { Promotion } from '@/lib/generated/prisma';

export default async function CheckoutPage() {
  const today = new Date();

  const [products, activePromotions, customers] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: 'asc' } }),
    prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: today },
        OR: [{ endDate: { gte: today } }, { endDate: null }],
      },
      include: { products: { select: { id: true } } },
    }),
    // Also fetch all customers
    prisma.customer.findMany({ orderBy: { lastName: 'asc' } }),
  ]);

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
        <CheckoutClient 
          products={products} 
          promotions={activePromotions as any}
          customers={customers}
        />
      </div>
    </div>
  );
}