import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <SearchX className="h-16 w-16 text-gray-300 mb-6" />
      <h1
        className="text-6xl sm:text-8xl font-bold text-gray-200 mb-4"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        404
      </h1>
      <h2
        className="text-xl sm:text-2xl font-bold text-gray-900 mb-2"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Siden ble ikke funnet
      </h2>
      <p className="text-sm text-gray-500 mb-8 text-center max-w-sm">
        Siden du leter etter finnes ikke eller har blitt flyttet.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium
          bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800
          transition-all duration-150 shadow-sm shadow-blue-600/20"
      >
        Gå til forsiden
      </Link>
    </div>
  );
}
