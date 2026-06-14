import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. FUNGSI UNTUK MENYIMPAN DATA ASET BARU (POST)
export async function POST(request: Request) {
  try {
    // Tangkap data yang dikirim dari form UI
    const body = await request.json();
    const { nama_aset, kategori, link_file, caption } = body;

    // Simpan ke database Supabase pakai Prisma
    const asetBaru = await prisma.creativeAsset.create({
      data: {
        nama_aset,
        kategori,
        link_file,
        caption,
      },
    });

    // Kembalikan respons sukses ke UI
    return NextResponse.json({ success: true, message: 'Aset berhasil disimpan!', data: asetBaru }, { status: 201 });
    
  } catch (error) {
    console.error("Gagal simpan aset:", error);
    return NextResponse.json({ success: false, error: 'Gagal menyimpan data ke database' }, { status: 500 });
  }
}

// 2. FUNGSI UNTUK MENGAMBIL SEMUA DATA ASET (GET)
export async function GET() {
  try {
    // Ambil semua data aset dari database, urutkan dari yang paling baru dibuat
    const aset = await prisma.creativeAsset.findMany({
      orderBy: { 
        createdAt: 'desc' 
      },
    });
    
    return NextResponse.json({ success: true, data: aset });
  } catch (error) {
    console.error("Gagal ngambil data aset:", error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data dari database' }, { status: 500 });
  }
}

// 3. FUNGSI UNTUK MENGHAPUS DATA ASET (DELETE)
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    // Hapus data di database Prisma berdasarkan ID
    await prisma.creativeAsset.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true, message: 'Aset berhasil dihapus!' });
  } catch (error) {
    console.error("Gagal hapus aset:", error);
    return NextResponse.json({ success: false, error: 'Gagal menghapus data' }, { status: 500 });
  }
}
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, nama_aset, kategori, link_file, caption } = body;

    const updatedAset = await prisma.creativeAsset.update({
      where: { id: id },
      data: { nama_aset, kategori, link_file, caption },
    });

    return NextResponse.json({ success: true, data: updatedAset });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal update aset' }, { status: 500 });
  }
}