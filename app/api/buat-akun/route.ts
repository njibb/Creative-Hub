import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET() {
  // Ambil data rahasia dari file .env
  const emailAdmin = process.env.ADMIN_EMAIL;
  const passwordAdmin = process.env.ADMIN_PASSWORD;

  // Cek kalau misal lupa naruh di .env biar gak error nge-blank
  if (!emailAdmin || !passwordAdmin) {
    return NextResponse.json({ 
      success: false, 
      error: 'Waduh, ADMIN_EMAIL atau ADMIN_PASSWORD belum diisi di file .env tuh!' 
    }, { status: 500 });
  }

  try {
    // Hash password yang dari .env
    const hashedPassword = await bcrypt.hash(passwordAdmin, 10); 
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = await prisma.user.create({
      data: {
        name: 'Divisi Creative',
        email: emailAdmin,
        password: hashedPassword,
        role: 'CREATIVE'
      }
    });

    return NextResponse.json({ success: true, message: 'Akun Divisi Creative Berhasil Dibuat!', email: emailAdmin });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Gagal bikin akun. Mungkin emailnya udah pernah didaftarin?' }, { status: 500 });
  }
}