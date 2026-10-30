
"use server";

import { db } from "@/db/drizzle";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { z } from "zod";

type RegisterResult = {
  success?: boolean;
  error?: string;
};

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(8, "Password must contain at least 8 characters.").max(72, "Password is too long."),
});

export async function registerUser(
  formData: FormData
): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check your details.",
    };
  }

  const { name, email, password } = parsed.data;

  try {
    const [existingUser] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existingUser) {
      return {
        error: "Unable to create an account with these details. Try logging in instead.",
      };
    }

    const passwordHash = await hash(password, 12);

    await db.insert(usersTable).values({
      name,
      email,
      passwordHash,
    });

    return { success: true };
  } catch (error) {
    console.error("Error registering user:", error);

    return {
      error: "Registration is temporarily unavailable. Please try again.",
    };
  }
}
