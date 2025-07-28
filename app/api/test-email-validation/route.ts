import { NextRequest, NextResponse } from "next/server";
import { validateEmail } from "@/lib/utils/email-validation";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const isValid = validateEmail(email);

    return NextResponse.json(
      {
        email,
        isValid,
        message: isValid
          ? "Email format is valid"
          : "Please enter a valid email address",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error validating email:", error);
    return NextResponse.json(
      { error: "Failed to validate email" },
      { status: 500 }
    );
  }
}
