"use client";

import BackgroundGrid from "@/app/components/backgroundGrid";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-slate-950 relative">
      <BackgroundGrid />

      {/* Header Section */}
      <header className="relative z-10 pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                MLRP
              </span>
              <span className="text-white">Crafting</span>
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              MotionLife RP Crafting Calculator
            </p>
            <p className="text-sm text-gray-400 max-w-2xl mx-auto">
              Website sedang dalam perbaikan untuk memberikan pengalaman yang
              lebih baik
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center px-4 pb-16">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Sedang Dalam Maintenance
            </h2>
            <p className="text-gray-300 text-lg mb-6">
              Kami sedang melakukan perbaikan pada calculator crafting untuk
              memberikan pengalaman yang lebih baik.
            </p>
            <p className="text-gray-400">
              Calculator MotionLife RP Crafting sementara tidak tersedia selagi
              kami melakukan peningkatan sistem.
            </p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-8 border border-slate-800 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">
              Apa yang sedang dikerjakan?
            </h3>
            <ul className="text-gray-300 space-y-3 text-left max-w-md mx-auto">
              <li className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full mr-4"></div>
                Update sistem dan perbaikan performa
              </li>
              <li className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-400 rounded-full mr-4"></div>
                Optimalisasi calculator crafting
              </li>
              <li className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full mr-4"></div>
                Penambahan fitur-fitur baru
              </li>
              <li className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full mr-4"></div>
                Peningkatan user interface
              </li>
            </ul>
          </div>{" "}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Cek Lagi
            </button>
            <a
              href="https://github.com/aw4e/mlrpcrafting"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-gray-300 hover:text-green-400 transition-colors font-medium"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Update di GitHub</span>
            </a>
          </div>
          <div className="mt-8 text-gray-400 text-sm">
            <p>Diperkirakan akan kembali online dalam waktu dekat.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-900/50 backdrop-blur-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* About Section */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold text-white mb-3">
                MLRPCrafting
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Calculator crafting terbaik untuk MotionLife RP. Optimalkan
                hasil crafting Anda dengan perhitungan yang akurat dan strategi
                terbaik.
              </p>
            </div>

            {/* Contact & Credits */}
            <div className="text-center md:text-right">
              <h3 className="text-lg font-semibold text-white mb-3">Credits</h3>
              <p className="text-gray-400 text-sm mb-2">
                Created by{" "}
                <a
                  href="https://github.com/aw4e"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 transition-colors font-semibold"
                >
                  aw4e
                </a>
              </p>
              <a
                href="https://github.com/aw4e/mlrpcrafting"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>GitHub</span>
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-slate-800 mt-8 pt-6 text-center">
            <p className="text-gray-500 text-sm">
              © 2025 MLRPCrafting. All rights reserved. | Made for MotionLife
              RP Community
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
