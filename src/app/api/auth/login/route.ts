import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { comparePassword, signToken } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { initDbAndSeed } from '@/db/seed';

export async function POST(req: NextRequest) {
  try {
    await initDbAndSeed();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Sila masukkan emel dan kata laluan.' }, { status: 400 });
    }

    const user = db.select().from(users).where(eq(users.email, email)).get();

    if (!user || !(await comparePassword(password, user.password))) {
      return NextResponse.json({ message: 'Maklumat log masuk tidak tepat.' }, { status: 401 });
    }

    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return NextResponse.json({
      message: 'Log masuk berjaya.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
