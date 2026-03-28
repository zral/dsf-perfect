"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react";

const navItems = [
  { label: "Hjem", icon: Home, href: "/" },
  { label: "Søk", icon: Search, href: "/sok" },
  { label: "Legg ut", icon: PlusCircle, href: "/ny-annonse" },
  { label: "Meldinger", icon: MessageCircle, href: "/meldinger" },
  { label: "Profil", icon: User, href: "/profil" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[3.5rem] py-1 rounded-lg transition-colors ${
                isActive
                  ? "text-blue-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
