import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { isAuthenticated } from "@/lib/auth";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIMES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "Aucun fichier image fourni." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "Taille de fichier trop volumineuse (max 10 Mo)." },
        { status: 400 }
      );
    }

    const ext = ALLOWED_MIMES[file.type];
    if (!ext) {
      return NextResponse.json(
        {
          success: false,
          error: "Format de fichier non supporté. Formats acceptés : JPG, PNG, WEBP, GIF, SVG.",
        },
        { status: 400 }
      );
    }

    // Generate safe, collision-resistant server-side filename
    const randomHex = crypto.randomBytes(6).toString("hex");
    const filename = `guy_${Date.now()}_${randomHex}${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      await fs.promises.writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${filename}`,
        filename,
        size: file.size,
      });
    } catch (fsErr) {
      console.warn("Filesystem is read-only (Vercel lambda), returning base64 data URL fallback:", fsErr);
      const mime = file.type || "image/jpeg";
      const base64Url = `data:${mime};base64,${buffer.toString("base64")}`;

      return NextResponse.json({
        success: true,
        url: base64Url,
        filename,
        size: file.size,
      });
    }
  } catch (err) {
    console.error("File upload error:", err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors de l'enregistrement de l'image." },
      { status: 500 }
    );
  }
}
