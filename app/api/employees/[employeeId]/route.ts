import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/lib/generated/prisma';

export async function DELETE(
  req: Request,
  { params }: { params: { employeeId: string } }
) {
  try {
    if (!params.employeeId) {
      return new NextResponse('Employee ID is required', { status: 400 });
    }

    const employee = await prisma.employee.delete({
      where: {
        id: params.employeeId,
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('[EMPLOYEE_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// ADD THIS NEW PATCH FUNCTION
export async function PATCH(
  req: Request,
  { params }: { params: { employeeId: string } }
) {
  try {
    const body = await req.json();
    const { firstName, lastName, pin, roleId } = body;

    if (!params.employeeId) {
      return new NextResponse('Employee ID is required', { status: 400 });
    }

    const employee = await prisma.employee.update({
      where: {
        id: params.employeeId,
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

    // Handle the unique PIN error, same as in the POST route
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new NextResponse('An employee with this PIN already exists.', {
        status: 409,
      });
    }
    
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}