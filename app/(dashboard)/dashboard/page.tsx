import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  
  export default function DashboardPage() {
    return (
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Revenue</CardTitle>
              <CardDescription>Total sales for today.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$0.00</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>Total transactions today.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }