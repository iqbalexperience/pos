import { prisma } from '@/lib/prisma';
import { ProductClient } from './components/product-client';

export default async function InventoryPage() {
  const [products, categories, vendors] = await Promise.all([
    prisma.product.findMany({
      include: { category: true, vendor: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany(),
    prisma.vendor.findMany(),
  ]);

  // We no longer format the products here. We pass the raw data.
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductClient
          data={products} // Pass the raw products array
          categories={categories}
          vendors={vendors}
        />
      </div>
    </div>
  );
}