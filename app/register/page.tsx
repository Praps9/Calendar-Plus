
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/actions/auth-actions";

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(
      formData.get("confirmPassword") ?? ""
    );

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registerUser(formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.success) {
        router.push("/login?registered=true");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-10 text-[#202124]">
      <section className="w-full max-w-[450px] rounded-2xl border border-[#dadce0] px-6 py-10 sm:px-12">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-normal">Create your account</h1>
          <p className="mt-2 text-sm text-[#5f6368]">
            Start organizing your schedule
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm">Full name</span>
            <input
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Enter your name"
              minLength={2}
              maxLength={100}
              required
              disabled={isSubmitting}
              className="w-full rounded-md border border-[#dadce0] px-3 py-3 text-sm outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] disabled:opacity-60"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm">Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Enter your email"
              maxLength={254}
              required
              disabled={isSubmitting}
              className="w-full rounded-md border border-[#dadce0] px-3 py-3 text-sm outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] disabled:opacity-60"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm">Password</span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              placeholder="Create a password (8+ characters)"
              required
              disabled={isSubmitting}
              className="w-full rounded-md border border-[#dadce0] px-3 py-3 text-sm outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] disabled:opacity-60"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm">Confirm password</span>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              placeholder="Confirm your password"
              required
              disabled={isSubmitting}
              className="w-full rounded-md border border-[#dadce0] px-3 py-3 text-sm outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] disabled:opacity-60"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-[#5f6368]">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(event) =>
                setShowPassword(event.target.checked)
              }
              className="size-4 accent-[#1a73e8]"
            />
            Show passwords
          </label>

          {error && (
            <p
              role="alert"
              aria-live="polite"
              className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-[#1a73e8] px-6 py-3 text-sm font-medium text-white hover:bg-[#1765cc] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center text-sm text-[#5f6368]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[#1a73e8] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
