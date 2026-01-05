"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { GET_CURRENT_USER, LOGOUT_MUTATION } from "@/graphql/user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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

export default function ProfilePage() {
  const router = useRouter();

  const { data, loading, error } = useQuery<CurrentUserData>(GET_CURRENT_USER);
  const [logout] = useMutation(LOGOUT_MUTATION);

  const user = data?.getCurrentLoggedInUser;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user && !error) {
      router.push("/login");
    }
  }, [loading, user, error, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="animate-pulse">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Threads
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition"
            >
              Home
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Profile Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Profile Header */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold shadow-lg shadow-purple-500/25">
                {user.firstName[0]}
                {user.lastName?.[0] || ""}
              </div>

              {/* User Info */}
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {user.firstName} {user.lastName || ""}
                </h1>
                <p className="text-gray-400 text-lg mb-4">{user.email}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <span className="px-4 py-2 bg-gray-700/50 rounded-full text-gray-300 text-sm">
                    🎉 Member since 2026
                  </span>
                  <span className="px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full text-blue-400 text-sm">
                    ✨ Early Adopter
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-6 text-center">
              <div className="text-3xl font-bold text-white mb-1">0</div>
              <div className="text-gray-400">Threads</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-6 text-center">
              <div className="text-3xl font-bold text-white mb-1">0</div>
              <div className="text-gray-400">Followers</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-6 text-center">
              <div className="text-3xl font-bold text-white mb-1">0</div>
              <div className="text-gray-400">Following</div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Profile Details</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <span className="text-gray-400">User ID</span>
                <span className="text-white font-mono text-sm bg-gray-700/50 px-3 py-1 rounded">
                  {user.id}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <span className="text-gray-400">First Name</span>
                <span className="text-white">{user.firstName}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <span className="text-gray-400">Last Name</span>
                <span className="text-white">{user.lastName || "—"}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-400">Email</span>
                <span className="text-white">{user.email}</span>
              </div>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-8 text-center">
            <div className="text-5xl mb-4">🚧</div>
            <h2 className="text-xl font-bold text-white mb-2">Profile Editing Coming Soon</h2>
            <p className="text-gray-400">
              You&apos;ll be able to edit your profile, upload a photo, and more!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
