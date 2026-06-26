"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    localStorage.setItem("access_token", "mock_student_token");
    localStorage.setItem("user_email", email);

    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Login</h1>

      <p className="mt-2 text-sm text-slate-500">
        Sign in to view your internship recommendations.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>

          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
            placeholder="student@example.com"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Password
          </label>

          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Login
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Do not have an account?{" "}
        <Link href="/signup" className="font-semibold text-slate-900">
          Signup
        </Link>
      </p>
    </div>
  );
}