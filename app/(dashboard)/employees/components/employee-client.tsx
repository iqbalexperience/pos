'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTable } from './data-table';
import { columns, FormattedEmployee } from './columns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmployeeForm } from './employee-form';
import { Role } from '@/lib/generated/prisma';

interface EmployeeClientProps {
  data: FormattedEmployee[];
  roles: Role[];
}

export const EmployeeClient: React.FC<EmployeeClientProps> = ({ data, roles }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State to hold the employee being edited
  const [editingEmployee, setEditingEmployee] = useState<FormattedEmployee | null>(null);

  const handleOpenModal = (employee: FormattedEmployee | null) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // A slight delay to prevent form flicker while closing
    setTimeout(() => setEditingEmployee(null), 300);
  };

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEmployee ? 'Edit employee' : 'Add new employee'}</DialogTitle>
          </DialogHeader>
          <EmployeeForm 
            roles={roles} 
            initialData={editingEmployee} 
            onCancel={handleCloseModal} 
          />
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <Heading
          title={`Employees (${data.length})`}
          description="Manage employees for your store"
        />
        {/* 'Add New' button now uses the handler */}
        <Button onClick={() => handleOpenModal(null)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      {/* Pass the handler down to the data table */}
      <DataTable columns={columns(handleOpenModal)} data={data} />
    </>
  );
};