"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react";
import { useUnreadCount } from "@/hooks/useMessages";

const navItems = [
  { label: "Hjem", icon: Home, href: "/" },
  { label: "Søk", icon: Search, href: "/search" },
  { label: "Legg ut", icon: PlusCircle, href: "/ad/new" },
  { label: "Meldinger", icon: MessageCircle, href: "/meldinger" },
  { label: "Profil", icon: User, href: "/login" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { data: unreadCount } = useUnreadCount();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const showBadge =
            item.href === "/meldinger" &&
            typeof unreadCount === "number" &&
            unreadCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[3.5rem] py-1 rounded-lg transition-colors ${
                isActive
                  ? "text-blue-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`}
                />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 h-4 min-w-[16px] px-1 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
