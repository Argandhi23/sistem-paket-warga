import { NextResponse } from 'next/server';
import { handleError } from '@/lib/error-handler';
import { requireAdminSession } from '@/lib/require-admin-session';
import { UserService } from '@/services/user.service';

export async function GET(request: Request) {
  try {
    await requireAdminSession({ api: true });

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const sort = searchParams.get('sort');

    const users = await UserService.listForManagement({ role, sort });
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession({ api: true });

    const body = await request.json();
    const user = await UserService.createForAdmin(body);

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdminSession({ api: true });

    const body = await request.json();
    const user = await UserService.updateForAdmin(body);

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminSession({ api: true });

    const { searchParams } = new URL(request.url);
    const idFromQuery = searchParams.get('id');

    let idFromBody: string | undefined;
    if (!idFromQuery) {
      const body = await request.json().catch(() => null);
      if (body && typeof body.id === 'string') {
        idFromBody = body.id;
      }
    }

    const deleted = await UserService.deleteForAdmin({ id: idFromQuery ?? idFromBody });

    return NextResponse.json({
      success: true,
      data: deleted,
      message: 'User berhasil dihapus',
    });
  } catch (error) {
    return handleError(error);
  }
}
