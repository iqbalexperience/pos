import { prisma } from '@/lib/prisma';
import { CustomerColumn } from './components/columns';
import { CustomerClient } from './components/customer-client';

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  const formattedCustomers: CustomerColumn[] = customers.map((item) => ({
    id: item.id,
    name: `${item.firstName} ${item.lastName}`,
    phone: item.phone || 'N/A',
    email: item.email || 'N/A',
    loyaltyPoints: item.loyaltyPoints,
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CustomerClient data={formattedCustomers} />
      </div>
    </div>
  );
}