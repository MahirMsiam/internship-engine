"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_role");

    router.push("/login");
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div>
          <Link href="/dashboard" className="text-xl font-bold text-slate-900">
            Internship Engine
          </Link>

          <p className="text-sm text-slate-500">
            AI-based internship recommendation platform
          </p>
        </div>

        <nav className="hidden gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/dashboard" className="hover:text-slate-900">
            Dashboard
          </Link>

          <Link href="/recommendations" className="hover:text-slate-900">
            Recommendations
          </Link>

          <Link href="/login" className="hover:text-slate-900">
            Login
          </Link>

          <Link href="/signup" className="hover:text-slate-900">
            Signup
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Logout
        </button>
      </div>
    </header>
  );
}