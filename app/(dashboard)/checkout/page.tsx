import { prisma } from '@/lib/prisma';
import { CheckoutClient } from './components/checkout-client';

export default async function CheckoutPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
        <CheckoutClient products={products} />
      </div>
    </div>
  );
}