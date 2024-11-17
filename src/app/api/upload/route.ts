import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const fileType = file.type;
    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        .includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and DOCX files are allowed.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const document = await prisma.document.create({
      data: {
        fileName: file.name,
        fileType: fileType,
        fileSize: file.size,
        fileUrl: `/uploads/${fileName}`,
      },
    });

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}