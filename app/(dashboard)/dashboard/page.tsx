import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export default async function DashboardPage() {
  // Set date range for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // 1. Fetch today's sales data
  const todaysSalesData = await prisma.transaction.aggregate({
    where: {
      createdAt: {
        gte: today,
        lte: endOfDay,
      },
      total: {
        gt: 0, // Only count sales, not refunds
      },
    },
    _sum: {
      total: true,
    },
    _count: {
      id: true,
    },
  });

  // 2. Fetch the 5 most recent transactions
  const recentTransactions = await prisma.transaction.findMany({
    take: 5,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      customer: true,
      items: true,
    },
  });

  const todaysRevenue = todaysSalesData._sum.total ?? 0;
  const todaysSalesCount = todaysSalesData._count.id;

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-4">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Today's Revenue</CardTitle>
            <CardDescription>Total revenue from sales made today.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(todaysRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Today's Sales</CardTitle>
            <CardDescription>Total number of sales made today.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">+{todaysSalesCount}</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.customer ? `${tx.customer.firstName} ${tx.customer.lastName}` : 'Walk-in'}</TableCell>
                  <TableCell>
                    <Badge variant={tx.total > 0 ? 'secondary' : 'destructive'}>
                      {tx.total > 0 ? 'Sale' : 'Refund'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(tx.total)}</TableCell>
                  <TableCell>{new Date(tx.createdAt).toLocaleTimeString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}