import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = [".jpg", ".jpeg", ".png", ".webp", ".avif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_TYPES.includes(ext)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Create upload directory if needed
    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(uploadDir, { recursive: true });

    // Save file with timestamp prefix
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${timestamp}-${safeName}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const url = `/uploads/products/${fileName}`;

    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Upload error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
