import CraftingOptimizer from "@/app/components/craftingOptimizer";
import BackgroundGrid from "@/app/components/backgroundGrid";
import Navigation from "@/app/components/navigation";

export default function Home() {
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
              Optimasi crafting untuk server MotionLife RP dengan calculator
              yang mudah digunakan dan efisien untuk semua kebutuhan crafting
              Anda.
            </p>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="relative z-10 pb-16">
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8">
          <CraftingOptimizer />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-900/50 backdrop-blur-sm border-t border-slate-800">
        {" "}
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
