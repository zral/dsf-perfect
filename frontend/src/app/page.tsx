"use client";

import { Search, Car, Home, Shirt, Smartphone, Sofa, Dumbbell, Baby, Bike, BookOpen, Palette, Wrench, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  { name: "Bil og motor", icon: Car, color: "bg-blue-50 text-blue-600" },
  { name: "Eiendom", icon: Home, color: "bg-emerald-50 text-emerald-600" },
  { name: "Klær og mote", icon: Shirt, color: "bg-pink-50 text-pink-600" },
  { name: "Elektronikk", icon: Smartphone, color: "bg-purple-50 text-purple-600" },
  { name: "Møbler og interiør", icon: Sofa, color: "bg-amber-50 text-amber-600" },
  { name: "Sport og fritid", icon: Dumbbell, color: "bg-red-50 text-red-600" },
  { name: "Barn og baby", icon: Baby, color: "bg-cyan-50 text-cyan-600" },
  { name: "Sykkel", icon: Bike, color: "bg-green-50 text-green-600" },
  { name: "Bøker og media", icon: BookOpen, color: "bg-indigo-50 text-indigo-600" },
  { name: "Kunst og hobby", icon: Palette, color: "bg-orange-50 text-orange-600" },
  { name: "Verktøy", icon: Wrench, color: "bg-slate-50 text-slate-600" },
  { name: "Gaming", icon: Gamepad2, color: "bg-violet-50 text-violet-600" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Finn det du leter etter
            </h1>
            <p className="mt-4 text-lg text-blue-100 max-w-xl mx-auto">
              Tusenvis av annonser fra hele Norge. Kjøp og selg enkelt og trygt.
            </p>

            {/* Hero search bar */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Hva leter du etter?"
                  className="w-full pl-12 pr-4 py-4 text-base bg-white rounded-2xl shadow-xl shadow-blue-900/20
                    focus:outline-none focus:ring-4 focus:ring-white/30
                    placeholder:text-gray-400 text-gray-900 transition-all"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2
            className="text-xl sm:text-2xl font-bold text-gray-900 mb-8"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Utforsk kategorier
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.button
                  key={category.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * index }}
                  className="group flex flex-col items-center gap-3 p-4 sm:p-5 rounded-2xl border border-gray-100
                    hover:border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer bg-white"
                >
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center ${category.color}
                      group-hover:scale-110 transition-transform duration-200`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 text-center leading-tight">
                    {category.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Latest listings placeholder */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2
              className="text-xl sm:text-2xl font-bold text-gray-900 mb-8"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Nyeste annonser
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                >
                  <div className="aspect-[4/3] bg-gray-100 animate-pulse"></div>
                  <div className="p-3 sm:p-4 space-y-2">
                    <div className="h-4 bg-gray-100 rounded-lg w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded-lg w-1/2 animate-pulse"></div>
                    <div className="h-5 bg-blue-50 rounded-lg w-1/3 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-gray-400 mt-8">
              Annonser kommer snart
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
