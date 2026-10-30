
"use client";

import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    setRegistered(searchParams.get("registered") === "true");
  }, [searchParams]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        redirectTo: "/",
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
        return;
      }

      if (result?.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Unable to sign in. Please try again.");
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
          <div className="mb-6 flex items-center justify-center gap-2">
            <span className="text-3xl font-semibold tracking-tight">
              <span className="text-[#4285f4]">C</span>
              <span className="text-[#ea4335]">a</span>
              <span className="text-[#fbbc05]">l</span>
              <span className="text-[#4285f4]">e</span>
              <span className="text-[#34a853]">n</span>
              <span className="text-[#ea4335]">d</span>
              <span className="text-[#4285f4]">a</span>
              <span className="text-[#34a853]">r</span>
              <span className="text-[#ea4335]">+</span>
            </span>
          </div>

          <h1 className="text-2xl font-normal">Sign in</h1>
          <p className="mt-2 text-sm text-[#5f6368]">
            Continue to your calendar
          </p>
        </div>

        {registered && (
          <p
            role="status"
            className="mb-5 rounded-md bg-green-50 px-3 py-3 text-sm text-green-800"
          >
            Account registration submitted. Sign in with your credentials.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm">Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Enter your email"
              required
              disabled={isSubmitting}
              className="w-full rounded-md border border-[#dadce0] px-3 py-3 text-sm outline-none transition focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] disabled:opacity-60"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm">Password</span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              required
              disabled={isSubmitting}
              className="w-full rounded-md border border-[#dadce0] px-3 py-3 text-sm outline-none transition focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] disabled:opacity-60"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-[#5f6368]">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(event) => setShowPassword(event.target.checked)}
              className="size-4 accent-[#1a73e8]"
            />
            Show password
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-md bg-red-50 px-3 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-4 pt-3">
            <Link
              href="/register"
              className="text-sm font-medium text-[#1a73e8] hover:underline"
            >
              Create account
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-[#1a73e8] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#1765cc] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-xs text-[#5f6368]">
          Your schedule, organized in one place.
        </p>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
