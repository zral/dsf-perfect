"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  MapPin,
  Star,
  ShoppingBag,
  Heart,
  Bookmark,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/common/Button";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-none text-gray-200"
          }`}
        />
      ))}
      <span className="text-sm text-gray-500 ml-1">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

const profileLinks = [
  {
    label: "Mine annonser",
    description: "Se og administrer dine annonser",
    icon: ShoppingBag,
    href: "/ad/mine",
  },
  {
    label: "Favoritter",
    description: "Annonser du har lagret",
    icon: Heart,
    href: "/profile/favorites",
  },
  {
    label: "Lagrede sok",
    description: "Sok du har lagret for senere",
    icon: Bookmark,
    href: "/profile/saved-searches",
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-100" />
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-gray-100 rounded w-1/3" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <h1
          className="text-xl sm:text-2xl font-bold text-gray-900"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Min profil
        </h1>

        {/* User info card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-blue-600" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {user.name}
              </h2>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                {user.location && (
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {user.location}
                  </span>
                )}
                <StarRating rating={user.rating} />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <div className="space-y-3">
          {profileLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex items-center gap-4 hover:shadow-md hover:border-gray-200 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {link.label}
                    </p>
                    <p className="text-xs text-gray-500">{link.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Logout button */}
        <div className="pt-2">
          <Button
            variant="ghost"
            size="md"
            className="w-full text-red-600 hover:bg-red-50"
            icon={<LogOut className="h-4 w-4" />}
            onClick={() => {
              logout();
              router.push("/");
            }}
          >
            Logg ut
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
