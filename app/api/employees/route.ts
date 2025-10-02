import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, pin, roleId } = body;

    if (!firstName || !lastName || !pin || !roleId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const employee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        pin,
        roleId,
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('[EMPLOYEES_POST]', error);

    // THIS IS THE CORRECTED, MORE ROBUST CHECK
    // We check if the error object has a 'code' property equal to 'P2002' (Prisma's unique constraint error code)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return new NextResponse('An employee with this PIN already exists.', {
        status: 409, // 409 Conflict is the correct status for this error
      });
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// The GET function remains unchanged
export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        role: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error('[EMPLOYEES_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}