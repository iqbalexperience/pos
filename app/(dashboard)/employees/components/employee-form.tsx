"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormattedEmployee } from "./columns";
import { Role } from "@/lib/generated/prisma";

// Define props for the form
interface EmployeeFormProps {
  roles: Role[];
  initialData: FormattedEmployee | null; // Can be null for 'create' mode
  onCancel: () => void;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  roles,
  initialData,
  onCancel,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Dynamic content based on whether we are editing or creating
  const title = initialData ? "Edit employee" : "Add new employee";
  const toastMessage = initialData ? "Employee updated." : "Employee created.";
  const actionLabel = initialData ? "Save changes" : "Create";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormattedEmployee>({
    defaultValues: initialData || {
      firstName: "",
      lastName: "",
      pin: "",
      roleId: "",
    },
  });

  // Populate form with initialData when it changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setValue("firstName", initialData.firstName);
      setValue("lastName", initialData.lastName);
      setValue("pin", initialData.pin);
      setValue("roleId", initialData.roleId);
    }
  }, [initialData, setValue]);

  const onSubmit = async (data: FormattedEmployee) => {
    try {
      setLoading(true);
      if (initialData) {
        // Update existing employee
        await axios.patch(`/api/employees/${initialData.id}`, data);
      } else {
        // Create new employee
        await axios.post('/api/employees', data);
      }
      router.refresh();
      toast.success(toastMessage);
      onCancel();
    } catch (error:any) {
      toast.error(error.response?.data || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // The form structure is the same, just the submit logic is different
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
       <div className="grid grid-cols-2 gap-4">
        <Input
          {...register("firstName", { required: "First name is required" })}
          placeholder="First Name"
          disabled={loading}
        />
        <Input
          {...register("lastName")} // lastName is optional
          placeholder="Last Name"
          disabled={loading}
        />
      </div>
      <Input
        type="password"
        {...register("pin", { 
          required: "PIN is required", 
          minLength: { value: 4, message: "PIN must be at least 4 digits" } 
        })}
        placeholder="4-Digit PIN"
        disabled={loading}
      />
      <Select
        disabled={loading}
        onValueChange={(value) => setValue("roleId", value)}
        defaultValue={initialData?.roleId}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.id} value={role.id}>
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* ... error display ... */}
      <div className="pt-6 space-x-2 flex items-center justify-end w-full">
        <Button disabled={loading} variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button disabled={loading} type="submit">
          {actionLabel}
        </Button>
      </div>
    </form>
  );
};