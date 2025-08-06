"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Info } from "lucide-react";

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: Home,
  },
  {
    href: "/info",
    label: "Info",
    icon: Info,
  },
];

const Navigation = () => {
  const pathname = usePathname();

  return (
    <nav className="relative z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center py-3">
          <div className="flex space-x-1 bg-slate-800/80 backdrop-blur-md rounded-full p-1 border border-slate-600/50 shadow-xl">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`group flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/50 text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-slate-700/50 border border-transparent"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      isActive
                        ? "text-green-400"
                        : "text-gray-400 group-hover:text-white"
                    }`}
                  />
                  <span
                    className={`font-medium text-sm ${
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-white"
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
