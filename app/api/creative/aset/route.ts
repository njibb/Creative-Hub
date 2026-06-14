import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama_aset, kategori, link_file, caption } = body;
    const asetBaru = await prisma.creativeAsset.create({
      data: { nama_aset, kategori, link_file, caption },
    });
    return NextResponse.json({ success: true, message: 'Aset berhasil disimpan!', data: asetBaru }, { status: 201 });
  } catch (error) {
    console.error("Gagal simpan aset:", error);
    return NextResponse.json({ success: false, error: 'Gagal menyimpan data ke database' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const aset = await prisma.creativeAsset.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: aset });
  } catch (error) {
    console.error("Gagal ngambil data aset:", error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data dari database' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    await prisma.creativeAsset.delete({ where: { id: id } });
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