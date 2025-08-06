"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Info, Calculator } from "lucide-react";

const Navigation = () => {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      description: "Calculator",
    },
    {
      href: "/info",
      label: "Info",
      icon: Info,
      description: "Daftar Harga",
    },
  ];
  return (
    <nav className="relative z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center py-3">
          <div className="flex space-x-1 bg-slate-800/80 backdrop-blur-md rounded-full p-1 border border-slate-600/50 shadow-xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
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
                    {item.label}
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
