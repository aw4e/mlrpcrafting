"use client";

import { useState, useMemo } from "react";
import BackgroundGrid from "@/app/components/backgroundGrid";
import Navigation from "@/app/components/navigation";
import miningData from "@/data/mining.json";
import { MiningData } from "@/types";
import {
  DollarSign,
  Package,
  TrendingUp,
  Search,
  Filter,
  Coins,
  Target,
  Sparkles,
  Activity,
  ChevronDown,
  Info as InfoIcon,
  Calculator,
  ArrowUpRight,
  Gem,
} from "lucide-react";

export default function InfoPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [selectedRecommendation, setSelectedRecommendation] = useState<
    "all" | "sangat" | "direkomendasikan" | "rendah"
  >("all");

  const typedMiningData = miningData as MiningData;

  const formatItemName = (name: string): string => {
    return name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isBaseComponent = (itemName: string) => {
    const baseComponents = [
      "gold_ring",
      "silver_ring",
      "gold_chain",
      "silver_chain",
      "gold_earring",
      "silver_earring",
    ];
    return baseComponents.includes(itemName);
  };
  const isGrayItem = (itemName: string) => {
    const grayItems = [
      "diamond",
      "ruby",
      "sapphire",
      "emerald",
      "ingot",
      "coal",
    ];
    return grayItems.includes(itemName.toLowerCase());
  };

  const calculateRequirementsCost = (
    requirements: Record<string, number> | undefined
  ): number => {
    if (!requirements) return 0;
    let totalCost = 0;
    const allItems = {
      ...typedMiningData.tambang,
      ...typedMiningData.perhiasan,
    };

    for (const [item, quantity] of Object.entries(requirements)) {
      const itemData = allItems[item];
      if (!itemData) {
        continue;
      }

      if (itemData.require && Object.keys(itemData.require).length > 0) {
        const subCost = calculateRequirementsCost(itemData.require);
        if (subCost === 0 && itemData.price > 0) {
          totalCost += itemData.price * quantity;
        } else {
          totalCost += subCost * quantity;
        }
      } else {
        totalCost += itemData.price * quantity;
      }
    }

    return totalCost;
  };

  const allItemsData = useMemo(() => {
    const allItems = {
      ...typedMiningData.tambang,
      ...typedMiningData.perhiasan,
    };

    return Object.entries(allItems).map(([name, data]) => {
      const requirementsCost = calculateRequirementsCost(data.require);
      const profit = data.price - requirementsCost;
      const profitMargin =
        requirementsCost > 0 ? (profit / requirementsCost) * 100 : 0;
      let category = "raw";
      if (Object.keys(typedMiningData.tambang).includes(name)) {
        if (name.includes("ingot")) category = "ingots";
        else if (
          name.includes("diamond") ||
          name.includes("ruby") ||
          name.includes("sapphire") ||
          name.includes("emerald")
        )
          category = "gems";
        else category = "raw";
      } else {
        if (isBaseComponent(name)) category = "base";
        else if (name.includes("ring")) category = "rings";
        else if (name.includes("earring")) category = "earrings";
        else if (name.includes("necklace") || name.includes("chain"))
          category = "necklaces";
        else category = "jewelry";
      }

      let recommendation: "sangat" | "direkomendasikan" | "rendah" | "none" =
        "none";
      const hasRequirements = Object.keys(data.require || {}).length > 0;
      if (!isBaseComponent(name) && hasRequirements) {
        if (profitMargin >= 50) recommendation = "sangat";
        else if (profitMargin >= 25) recommendation = "direkomendasikan";
        else if (profitMargin > 0) recommendation = "rendah";
      }

      return {
        name,
        displayName: formatItemName(name),
        price: data.price,
        require: data.require,
        requirementsCost,
        profit,
        profitMargin,
        category,
        hasRequirements,
        recommendation,
      };
    });
  }, [typedMiningData]);

  const filteredAndSortedItems = useMemo(() => {
    let filtered = allItemsData;

    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (selectedRecommendation !== "all") {
      filtered = filtered.filter(
        (item) => item.recommendation === selectedRecommendation
      );
    }

    filtered.sort((a, b) => {
      if (sortOrder === "desc") {
        return b.profitMargin - a.profitMargin;
      }
      return a.profitMargin - b.profitMargin;
    });

    return filtered;
  }, [allItemsData, searchTerm, selectedCategory, selectedRecommendation, sortOrder]);
  const categories = [
    { key: "all", label: "Semua", icon: Package },
    { key: "ingots", label: "Ingots & Raw Materials", icon: DollarSign },
    { key: "gems", label: "Gems", icon: Gem },
    { key: "base", label: "Base Components", icon: Target },
    { key: "rings", label: "Rings", icon: TrendingUp },
    { key: "earrings", label: "Earrings", icon: TrendingUp },
    { key: "necklaces", label: "Necklaces", icon: TrendingUp },
  ];

  const getProfitColor = (
    profit: number,
    profitMargin: number,
    itemName: string
  ) => {
    if (isGrayItem(itemName)) return "text-gray-400";
    if (isBaseComponent(itemName)) return "text-blue-400";
    if (profit <= 0) return "text-red-400";
    if (profitMargin >= 50) return "text-green-400";
    if (profitMargin >= 25) return "text-blue-400";
    return "text-orange-400";
  };

  const getProfitBg = (
    profit: number,
    profitMargin: number,
    itemName: string
  ) => {
    if (isBaseComponent(itemName)) return "bg-blue-900/20 border-blue-700/50";
    if (isGrayItem(itemName)) return "bg-gray-900/20 border-gray-700/50";
    if (profit <= 0) return "bg-red-900/20 border-red-700/50";
    if (profitMargin >= 50) return "bg-green-900/20 border-green-700/50";
    if (profitMargin > 0 && profitMargin < 25)
      return "bg-orange-400/10 border-orange-700/50";
    return "bg-gray-900/20 border-gray-700/50";
  };

  return (
    <div className="min-h-screen bg-slate-950 relative">
      <BackgroundGrid />

      {/* Header Section */}
      <header className="relative z-10 pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Info
              </span>
              <span className="text-white"> & Harga</span>
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              Daftar Lengkap Bahan dan Harga MLRP
            </p>
            <p className="text-sm text-gray-400 max-w-2xl mx-auto">
              Informasi lengkap mengenai semua item, requirement, dan harga jual
              di MotionLife RP. Termasuk perhitungan profit dan rekomendasi
              crafting.
            </p>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="relative z-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Filter Controls */}
          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl mb-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari item..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <select
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category.key} value={category.key}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>{" "}
              </div>

              {/* Recommendation Filter */}
              <div className="relative">
                <select
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  value={selectedRecommendation}
                  onChange={(e) =>
                    setSelectedRecommendation(
                      e.target.value as "all" | "sangat" | "direkomendasikan" | "rendah"
                    )
                  }
                >
                  <option value="all">Semua Rekomendasi</option>
                  <option value="sangat">Prioritas Utama</option>
                  <option value="direkomendasikan">Direkomendasikan</option>
                  <option value="rendah">Profit Rendah</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Sparkles className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Sort By Profit */}
              <div className="relative">
                <select
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
                >
                  <option value="desc">Profit Margin: High to Low</option>
                  <option value="asc">Profit Margin: Low to High</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {filteredAndSortedItems.length}
                </div>
                <div className="text-sm text-gray-400">Total Item</div>
              </div>{" "}
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {
                    filteredAndSortedItems.filter(
                      (item) => !isBaseComponent(item.name) && item.profit > 0
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-400">Profitable</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {
                    filteredAndSortedItems.filter((item) =>
                      isBaseComponent(item.name)
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-400">Base Components</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {
                    filteredAndSortedItems.filter(
                      (item) => !item.hasRequirements
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-400">Raw Material</div>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedItems.map((item) => (
              <div
                key={item.name}
                className={`bg-gray-900 border rounded-2xl shadow-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 ${getProfitBg(item.profit, item.profitMargin, item.name)}`}
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">
                      {item.displayName}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {item.profit > 0 && (
                        <div className="p-1 bg-green-600 rounded-full">
                          <TrendingUp className="h-3 w-3 text-white" />
                        </div>
                      )}
                      {item.hasRequirements && (
                        <div className="p-1 bg-blue-600 rounded-full">
                          <Calculator className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-400">
                      {formatCurrency(item.price)}
                    </span>{" "}
                    {item.profit !== 0 && (
                      <span
                        className={`text-sm font-semibold ${getProfitColor(item.profit, item.profitMargin, item.name)}`}
                      >
                        {item.profit > 0 ? "+" : ""}
                        {formatCurrency(item.profit)}
                      </span>
                    )}
                  </div>
                </div>
                {/* Requirements */}
                {item.hasRequirements && (
                  <div className="p-4 bg-gray-800/50">
                    <h4 className="text-sm font-semibold text-blue-300 mb-2">
                      Requirements:
                    </h4>
                    <div className="space-y-1">
                      {Object.entries(item.require || {}).map(
                        ([reqItem, quantity]) => (
                          <div
                            key={reqItem}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-300">
                              {formatItemName(reqItem)}
                            </span>
                            <span className="text-gray-400">×{quantity}</span>
                          </div>
                        )
                      )}
                    </div>
                    {item.requirementsCost > 0 && (
                      <div className="mt-3 pt-2 border-t border-gray-700">
                        <div className="flex justify-between text-sm">
                          <span className="text-orange-300">Total Cost:</span>
                          <span className="text-orange-400 font-semibold">
                            {formatCurrency(item.requirementsCost)}
                          </span>
                        </div>{" "}
                        {item.profitMargin > 0 && (
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-purple-300">
                              Profit Margin:
                            </span>
                            <span
                              className={`font-semibold ${getProfitColor(item.profit, item.profitMargin, item.name)}`}
                            >
                              {item.profitMargin.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {/* Raw Material Indicator */}
                {!item.hasRequirements && (
                  <div className="p-4 bg-gray-800/30">
                    <div className="flex items-center justify-center space-x-2 text-orange-400">
                      <Package className="h-4 w-4" />
                      <span className="text-sm font-medium">Raw Material</span>
                    </div>
                  </div>
                )}{" "}
                {/* Profit Recommendation */}
                {item.hasRequirements && (
                  <div className="p-3">
                    {isBaseComponent(item.name) && (
                      <div className="flex items-center space-x-2 text-blue-400 text-sm">
                        <Package className="h-4 w-4" />
                        <span className="font-semibold">
                          Base Component - Diperlukan untuk Crafting
                        </span>
                      </div>
                    )}
                    {!isBaseComponent(item.name) && item.profitMargin >= 50 && (
                      <div className="flex items-center space-x-2 text-green-400 text-sm">
                        <ArrowUpRight className="h-4 w-4" />
                        <span className="font-semibold">
                          Sangat Profitable - Prioritas Utama
                        </span>
                      </div>
                    )}
                    {!isBaseComponent(item.name) &&
                      item.profitMargin >= 25 &&
                      item.profitMargin < 50 && (
                        <div className="flex items-center space-x-2 text-blue-400 text-sm">
                          <ArrowUpRight className="h-4 w-4" />
                          <span className="font-semibold">
                            Profitable - Direkomendasikan
                          </span>
                        </div>
                      )}
                    {!isBaseComponent(item.name) &&
                      item.profitMargin > 0 &&
                      item.profitMargin < 25 && (
                        <div className="flex items-center space-x-2 text-orange-400 text-sm">
                          <ArrowUpRight className="h-4 w-4" />
                          <span className="font-semibold">Profit Rendah</span>
                        </div>
                      )}
                    {!isBaseComponent(item.name) && item.profit <= 0 && (
                      <div className="flex items-center space-x-2 text-red-400 text-sm">
                        <span className="font-semibold">
                          ❌ Tidak Profitable
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredAndSortedItems.length === 0 && (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-gray-300">
                  Tidak ada item ditemukan
                </h3>
                <p className="text-gray-400 mt-2">
                  Coba ubah filter atau kata kunci pencarian Anda.
                </p>
              </div>
            </div>
          )}
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
