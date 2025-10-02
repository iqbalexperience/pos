import { prisma } from '@/lib/prisma';
import { EmployeeClient } from './components/employee-client';
import { FormattedEmployee } from './components/columns'; // Import type from columns

export default async function EmployeesPage() {
  const [employees, roles] = await Promise.all([
    prisma.employee.findMany({
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.role.findMany(),
  ]);

  // The data now matches the FormattedEmployee type directly
  const formattedEmployees: FormattedEmployee[] = employees;

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <EmployeeClient data={formattedEmployees} roles={roles} />
      </div>
    </div>
  );
}