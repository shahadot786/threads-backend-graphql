"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { GET_CURRENT_USER, LOGOUT_MUTATION } from "@/graphql/user";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  profileImageUrl?: string;
}

interface CurrentUserData {
  getCurrentLoggedInUser: User | null;
}

export default function HomePage() {
  const router = useRouter();

  const { data, loading } = useQuery<CurrentUserData>(GET_CURRENT_USER, {
    errorPolicy: "ignore",
  });
  const [logout] = useMutation(LOGOUT_MUTATION);

  const user = data?.getCurrentLoggedInUser;

  const handleLogout = async () => {
    try {
      await logout();
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Threads
            </span>
          </h1>
          <nav>
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/profile"
                  className="text-gray-300 hover:text-white transition"
                >
                  Welcome, <span className="text-white font-medium">{user.firstName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {user ? (
          <div className="space-y-8">
            {/* User Profile Card */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Your Profile</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user.firstName[0]}{user.lastName?.[0] || ""}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">
                    {user.firstName} {user.lastName || ""}
                  </h3>
                  <p className="text-gray-400">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Coming Soon */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-8 text-center">
              <div className="text-5xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
              <p className="text-gray-400">
                Threads, posts, likes, and follows are on the way!
              </p>
            </div>
          </div>
        ) : (
          /* Guest View */
          <div className="text-center py-20">
            <h2 className="text-5xl font-bold text-white mb-6">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Threads
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              A modern social platform built with Next.js, GraphQL, and PostgreSQL.
              Join the conversation today!
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition shadow-lg shadow-blue-500/25"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 text-lg font-semibold bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-400">
          <p>&copy; 2026 Threads App. Built with Next.js, Apollo, and GraphQL.</p>
        </div>
      </footer>
    </div>
  );
}
