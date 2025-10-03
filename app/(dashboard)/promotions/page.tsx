import { prisma } from '@/lib/prisma';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { PromotionsClient } from './components/promotions-client';

export default async function PromotionsPage() {
  const [promotions, products] = await Promise.all([
    prisma.promotion.findMany({
      include: { products: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.findMany({ orderBy: { name: 'asc' } }),
  ]);

  const formattedPromotions = promotions.map(promo => ({
    ...promo,
    productCount: promo.products.length,
    startDate: promo.startDate.toLocaleDateString(),
    endDate: promo.endDate ? promo.endDate.toLocaleDateString() : 'Never',
    discount: `${promo.discountValue}%`,
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <PromotionsClient data={formattedPromotions} allProducts={products} />
      </div>
    </div>
  );
}