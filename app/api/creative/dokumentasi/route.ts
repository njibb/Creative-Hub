import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const docs = await prisma.eventDocumentation.findMany({
      orderBy: { tgl_acara: 'desc' },
    });
    return NextResponse.json({ success: true, data: docs });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal ambil data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama_acara, tgl_acara, drive_link } = body;
    let folderId = drive_link;
    const match = drive_link.match(/folders\/([a-zA-Z0-9-_]+)/) || drive_link.match(/id=([a-zA-Z0-9-_]+)/);
    if (match && match[1]) { folderId = match[1]; }

    const newDoc = await prisma.eventDocumentation.create({
      data: {
        nama_acara,
        tgl_acara: new Date(tgl_acara),
        drive_link: folderId,
      },
    });
    return NextResponse.json({ success: true, data: newDoc });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal simpan data' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.eventDocumentation.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Acara dihapus!' });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal hapus' }, { status: 500 });
  }
}