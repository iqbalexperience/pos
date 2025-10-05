import { prisma } from "@/lib/prisma";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

const LOW_STOCK_THRESHOLD = 10;

export async function LowStockAlert() {
    const lowStockProducts = await prisma.product.findMany({
        where: {
            stockQuantity: {
                lte: LOW_STOCK_THRESHOLD,
                gt: 0,
            },
        },
        orderBy: {
            stockQuantity: 'asc',
        },
        take: 5,
    });

    if (lowStockProducts.length === 0) {
        return null;
    }

    return (
        <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Low Stock Warning ({lowStockProducts.length} items)</AlertTitle>
            <AlertDescription>
                The following products are running low: {lowStockProducts.map(p => `"${p.name}" (${p.stockQuantity})`).join(', ')}.
                <Link href="/inventory" className="font-bold underline ml-2">
                    Manage Inventory
                </Link>
            </AlertDescription>
        </Alert>
    );
}