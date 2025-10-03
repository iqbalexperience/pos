import { NextRequest, NextResponse } from 'next/server'; // Import NextRequest
import { prisma } from '@/lib/prisma';

// --- DELETE Handler ---
// Updated typing for params as Promise
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  const resolvedParams = await params;
  const { employeeId } = resolvedParams;
  
  try {
    if (!employeeId) {
      return new NextResponse('Employee ID is required', { status: 400 });
    }

    const employee = await prisma.employee.delete({
      where: {
        id: employeeId,
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('[EMPLOYEE_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// --- PATCH Handler ---
// Updated typing for params as Promise
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  const resolvedParams = await params;
  const { employeeId } = resolvedParams;
  
  try {
    const body = await req.json();
    const { firstName, lastName, pin, roleId } = body;

    if (!employeeId) {
      return new NextResponse('Employee ID is required', { status: 400 });
    }

    const employee = await prisma.employee.update({
      where: {
        id: employeeId,
      },
      data: {
        firstName,
        lastName,
        pin,
        roleId,
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('[EMPLOYEE_PATCH]', error);

    // THIS IS THE FIX: A more robust error check that doesn't use 'instanceof'
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return new NextResponse('An employee with this PIN already exists.', {
        status: 409,
      });
    }
    
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}