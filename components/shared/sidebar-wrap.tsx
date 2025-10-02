'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Define the type for our navigation items, ensuring the 'icon' property
// must be a valid key from our 'Icons' object.
type NavItem = {
  href: string;
  label: string;
  icon: keyof typeof Icons;
};

const navItems: NavItem[] = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/inventory', icon: 'products', label: 'Inventory' },
  { href: '/inventory/break-case', icon: 'case', label: 'Break Case' }, // Add this
  { href: '/employees', icon: 'users', label: 'Employees' },
  { href: '/inventory/reports/expiration', icon: 'reports', label: 'Expiration Report' },
];

export function SidebarWrap() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/dashboard"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Icons.cart className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">GrocerPoint</span>
        </Link>
        <TooltipProvider>
          {navItems.map((item) => {
            // THIS IS THE KEY FIX:
            // We get the component from the Icons object and assign it to a
            // variable starting with a capital letter. JSX requires this for dynamic tags.
            const IconComponent = Icons[item.icon];

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                      {
                        'bg-accent text-accent-foreground':
                          pathname === item.href,
                      }
                    )}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Icons.settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
    </aside>
  );
}