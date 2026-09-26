import { NextRequest, NextResponse } from "next/server";
import {
  changeAdminPassword,
  getPasswordChangeStatus,
  isAuthenticated,
} from "@/lib/auth";

export async function GET(): Promise<NextResponse> {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const status = await getPasswordChangeStatus();
  return NextResponse.json({
    status,
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Tous les champs de mot de passe sont requis." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "La confirmation ne correspond pas au nouveau mot de passe." },
        { status: 400 }
      );
    }

    const res = await changeAdminPassword(currentPassword, newPassword);
    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error, nextAllowedDate: res.nextAllowedDate },
        { status: 400 }
      );
    }

    const updatedStatus = await getPasswordChangeStatus();
    return NextResponse.json({
      success: true,
      message: "Mot de passe modifié avec succès. Prochaine modification autorisée dans 2 semaines.",
      status: updatedStatus,
    });
  } catch (err) {
    console.error("Password update error:", err);
    return NextResponse.json(
      { success: false, error: "Erreur interne lors du changement de mot de passe." },
      { status: 500 }
    );
  }
}
