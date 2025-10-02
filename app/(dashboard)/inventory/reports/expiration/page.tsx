import { prisma } from '@/lib/prisma';
import { Heading } from '@/components/ui/heading';
import { DataTable } from '@/app/(dashboard)/employees/components/data-table';
import { columns, ExpirationReportColumn } from './components/columns';
import { Separator } from '@/components/ui/separator';

export default async function ExpirationReportPage() {
  // THIS IS THE FIX: We normalize the dates to cover the full day range.
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to the beginning of today

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  thirtyDaysFromNow.setHours(23, 59, 59, 999); // Set to the end of the 30th day

  const lots = await prisma.inventoryLot.findMany({
    where: {
      quantityRemaining: {
        gt: 0,
      },
      expirationDate: {
        gte: today, // Expires on or after the start of today
        lte: thirtyDaysFromNow, // Expires on or before the end of the 30th day
      },
    },
    include: {
      product: true,
    },
    orderBy: {
      expirationDate: 'asc',
    },
  });

  const formattedData: ExpirationReportColumn[] = lots.map((lot) => ({
    id: lot.id,
    productName: lot.product.name,
    sku: lot.product.sku,
    quantityRemaining: lot.quantityRemaining,
    expirationDate: lot.expirationDate,
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading
          title="Nearing Expiration Report"
          description="Inventory lots expiring within the next 30 days."
        />
        <Separator />
        <DataTable columns={columns} data={formattedData} />
      </div>
    </div>
  );
}