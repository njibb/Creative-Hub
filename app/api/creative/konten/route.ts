import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// FUNGSI UNTUK MENYIMPAN DATA BARU (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const kontenBaru = await prisma.contentCalendar.create({
      data: {
        judul_konten: body.judul_konten,
        platform: body.platform,
        pic: body.pic,
        tgl_take: new Date(body.tgl_take),
        tgl_tayang: new Date(body.tgl_tayang),
        status: body.status,
      },
    });

    return NextResponse.json({ success: true, data: kontenBaru }, { status: 201 });
  } catch (error) {
    console.error("Gagal simpan konten:", error);
    return NextResponse.json({ success: false, error: 'Gagal menyimpan data' }, { status: 500 });
  }
}

// FUNGSI UNTUK MENGAMBIL DATA (GET) - INI YANG TADI ERROR
export async function GET() {
  try {
    // Ambil semua data konten, urutkan dari tanggal tayang paling dekat
    const konten = await prisma.contentCalendar.findMany({
      orderBy: { tgl_tayang: 'asc' },
    });
    return NextResponse.json({ success: true, data: konten });
  } catch (error) {
    console.error("Gagal ngambil data konten:", error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data' }, { status: 500 });
  }
}
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    // Hapus data di database Prisma berdasarkan ID
    await prisma.contentCalendar.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true, message: 'Konten berhasil dihapus!' });
  } catch (error) {
    console.error("Gagal hapus konten:", error);
    return NextResponse.json({ success: false, error: 'Gagal menghapus data' }, { status: 500 });
  }
}
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, judul_konten, platform, pic, tgl_take, tgl_tayang, status } = body;

    const updatedKonten = await prisma.contentCalendar.update({
      where: { id: id },
      data: { 
        judul_konten, platform, pic, 
        tgl_take: new Date(tgl_take), 
        tgl_tayang: new Date(tgl_tayang), 
        status 
      },
    });

    return NextResponse.json({ success: true, data: updatedKonten });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal update konten' }, { status: 500 });
  }
}