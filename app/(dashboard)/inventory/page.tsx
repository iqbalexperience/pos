import { prisma } from '@/lib/prisma';
import { ProductClient } from './components/product-client';
import { ProductWithRelations } from './components/columns';
import { Product } from '@/lib/generated/prisma';

export default async function InventoryPage() {
  const [products, categories, vendors] = await Promise.all([
    prisma.product.findMany({
      include: { category: true, vendor: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany(),
    prisma.vendor.findMany(),
  ]);

  // We can assert the type here as we know we included the relations
  const productsWithRelations: ProductWithRelations[] = products as ProductWithRelations[];

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductClient
          data={productsWithRelations}
          categories={categories}
          vendors={vendors}
          allProducts={products as Product[]} // THIS IS THE NEW PROP
        />
      </div>
    </div>
  );
}