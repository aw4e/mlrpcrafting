"use client";

import { Inventory, OptimizationResult } from "@/types";
import { useState } from "react";
import Image from "next/image";
import {
  Package,
  Zap,
  TrendingUp,
  Clock,
  DollarSign,
  Settings,
  ChevronDown,
  Sparkles,
  Target,
  CheckCircle2,
  Hammer,
  Archive,
  Coins,
  Timer,
  Activity,
} from "lucide-react";

const materialCategories = {
  "Raw Materials": [
    "copper_ore",
    "iron_ore",
    "gold_ore",
    "silver_ore",
    "aluminium_ore",
    "coal",
    "uncut_sapphire",
    "uncut_diamond",
    "uncut_ruby",
    "uncut_emerald",
  ],
  Ingots: [
    "copper_ingot",
    "iron_ingot",
    "gold_ingot",
    "silver_ingot",
    "alluminium_ingot",
    "steel_ingot",
    "sapphire",
    "diamond",
    "ruby",
    "emerald",
  ],
  Rings: [
    "gold_ring",
    "silver_ring",
    "emerald_ring",
    "ruby_ring",
    "sapphire_ring",
    "diamond_ring_silver",
    "emerald_ring_silver",
    "ruby_ring_silver",
    "sapphire_ring_silver",
  ],
  Earrings: [
    "gold_earring",
    "silver_earring",
    "diamond_earring",
    "ruby_earring",
    "sapphire_earring",
    "emerald_earring",
    "diamond_earring_silver",
    "ruby_earring_silver",
    "sapphire_earring_silver",
  ],
  Necklaces: [
    "gold_chain",
    "silver_chain",
    "ruby_necklace",
    "sapphire_necklace",
    "emerald_necklace",
    "diamond_necklace_silver",
    "ruby_necklace_silver",
    "emerald_necklace_silver",
  ],
};

const categoryIcons = {
  "Raw Materials": Archive,
  Ingots: Coins,
  Chains: Activity,
  Rings: Target,
  Earrings: Sparkles,
  Necklaces: Sparkles,
};

const createEmptyInventory = (): Inventory => {
  const inventory: Inventory = {};
  Object.values(materialCategories)
    .flat()
    .forEach((item) => {
      inventory[item] = 0;
    });
  return inventory;
};

export default function CraftingOptimizer() {
  const [inventory, setInventory] = useState<Inventory>(createEmptyInventory());
  const [result, setResult] = useState<OptimizationResult["data"] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Raw Materials");
  const [showCategories, setShowCategories] = useState<boolean>(false);

  const handleOptimize = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/optimizecrafting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inventory }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(
          "API endpoint returned HTML instead of JSON. Please check if /api/optimizecrafting exists."
        );
      }

      const data: OptimizationResult = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Unknown error occurred");
      }

      setResult(data.data || null);
    } catch (err) {
      let errorMessage = "An unknown error occurred";

      if (err instanceof Error) {
        if (err.message.includes("<!DOCTYPE")) {
          errorMessage =
            "API endpoint not found. Please create /api/optimizecrafting endpoint.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      console.error("Optimization error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInventoryChange = (item: string, value: string): void => {
    const numValue = parseInt(value) || 0;
    setInventory((prev) => ({
      ...prev,
      [item]: Math.max(0, numValue),
    }));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatItemName = (name: string): string => {
    return name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getTotalItems = (): number => {
    return Object.values(inventory).reduce((sum, count) => sum + count, 0);
  };

  const CategoryIcon =
    categoryIcons[activeCategory as keyof typeof categoryIcons];
  return (
    <div className="font-mono bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 shadow-2xl">
        <div className="max-w-full mx-auto px-3 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-2">
                <Image
                  src="/motionlife.gif"
                  alt="Crafting Calculator"
                  width={68}
                  height={68}
                  className="h-12 w-12 sm:h-17 sm:w-17 object-contain"
                />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  MotionLife RP Crafting Optimizer
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Advanced crafting strategy calculator
                </p>
              </div>
            </div>
            <button
              onClick={handleOptimize}
              disabled={loading || getTotalItems() === 0}
              className="group relative inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 w-full sm:w-auto justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Calculating...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                  <span>Calculate</span>
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity -z-10"></div>
            </button>
          </div>{" "}
        </div>
      </div>

      <div className="max-w-full mx-auto px-3 sm:px-6">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-8">
          {/* Left Panel - Inventory Input */}
          <div className="xl:col-span-2">
            <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden min-h-[400px] sm:min-h-[600px]">
              <div className="p-4 sm:p-6 border-b border-gray-800 bg-gradient-to-r from-gray-800 to-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      Inventory
                    </h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm text-gray-400">
                      Total:
                    </span>
                    <span className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded-full text-xs sm:text-sm font-bold">
                      {getTotalItems()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Selector */}
              <div className="p-4 sm:p-6 border-b border-gray-800 bg-gray-800/50">
                <div className="relative">
                  <button
                    onClick={() => setShowCategories(!showCategories)}
                    className="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <CategoryIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                      <span className="font-semibold text-white text-sm sm:text-base">
                        {activeCategory}
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-white transition-all duration-200 ${
                        showCategories ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showCategories && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-10 overflow-hidden">
                      {Object.keys(materialCategories).map((category) => {
                        const Icon =
                          categoryIcons[category as keyof typeof categoryIcons];
                        return (
                          <button
                            key={category}
                            onClick={() => {
                              setActiveCategory(category);
                              setShowCategories(false);
                            }}
                            className="w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-700 transition-all duration-200 text-left group"
                          >
                            <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 group-hover:text-blue-300" />
                            <span className="text-gray-300 group-hover:text-white text-sm sm:text-base">
                              {category}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Items Grid */}
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4 max-h-64 sm:max-h-96 overflow-y-auto custom-scrollbar">
                  {materialCategories[
                    activeCategory as keyof typeof materialCategories
                  ].map((item) => (
                    <div
                      key={item}
                      className="group bg-gray-800 border border-gray-700 rounded-xl p-3 sm:p-4 hover:bg-gray-750 hover:border-blue-500/50 transition-all duration-200"
                    >
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2 sm:mb-3 group-hover:text-white transition-colors">
                        {formatItemName(item)}
                      </label>
                      <input
                        type="number"
                        value={inventory[item] === 0 ? "" : inventory[item]}
                        onChange={(e) =>
                          handleInventoryChange(item, e.target.value)
                        }
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-center font-mono text-sm sm:text-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-500"
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="xl:col-span-3">
            <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden min-h-[400px] sm:min-h-[600px]">
              <div className="p-4 sm:p-6 border-b border-gray-800 bg-gradient-to-r from-gray-800 to-gray-900">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    Optimization Results
                  </h2>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {error && (
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-900/50 border border-red-700 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 flex items-center justify-center">
                          ⚠
                        </div>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-xs sm:text-sm font-medium text-red-300">
                          Error
                        </h3>
                        <p className="text-xs sm:text-sm text-red-200 mt-1">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {result ? (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div className="group bg-gradient-to-br from-green-900/50 to-emerald-900/50 border border-green-700 rounded-xl p-4 sm:p-5 hover:shadow-green-500/20 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center">
                          <div className="p-1.5 sm:p-2 bg-green-600 rounded-lg">
                            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                          </div>
                          <div className="ml-3 sm:ml-4">
                            <p className="text-xs sm:text-sm font-medium text-green-300">
                              Total Profit
                            </p>
                            <p className="text-lg sm:text-2xl font-bold text-green-100">
                              {formatCurrency(result.summary.totalProfit)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="group bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border border-blue-700 rounded-xl p-4 sm:p-5 hover:shadow-blue-500/20 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center">
                          <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg">
                            <Timer className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                          </div>
                          <div className="ml-3 sm:ml-4">
                            <p className="text-xs sm:text-sm font-medium text-blue-300">
                              Total Time
                            </p>
                            <p className="text-lg sm:text-2xl font-bold text-blue-100">
                              {result.summary.totalTimeFormatted}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="group bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-700 rounded-xl p-4 sm:p-5 hover:shadow-purple-500/20 hover:shadow-lg transition-all duration-300 sm:col-span-1 col-span-1">
                        <div className="flex items-center">
                          <div className="p-1.5 sm:p-2 bg-purple-600 rounded-lg">
                            <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                          </div>
                          <div className="ml-3 sm:ml-4">
                            <p className="text-xs sm:text-sm font-medium text-purple-300">
                              Per Hour
                            </p>
                            <p className="text-lg sm:text-2xl font-bold text-purple-100">
                              {formatCurrency(result.summary.profitPerHour)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ready Items */}
                    {result.readyItems.length > 0 && (
                      <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-700 rounded-xl overflow-hidden">
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-green-700 bg-green-900/20">
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                            <h3 className="text-base sm:text-lg font-semibold text-green-100">
                              Ready to Sell ({result.readyItems.length})
                            </h3>
                          </div>
                        </div>
                        <div className="p-4 sm:p-6">
                          <div className="space-y-2 sm:space-y-3 max-h-32 sm:max-h-40 overflow-y-auto custom-scrollbar">
                            {result.readyItems.map((item, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center bg-gray-800/50 p-3 sm:p-4 rounded-lg border border-gray-700 hover:border-green-500/50 transition-all duration-200"
                              >
                                <span className="font-medium text-gray-200 text-sm sm:text-base">
                                  {item.displayName} ×
                                  {item.quantity.toLocaleString()}
                                </span>
                                <span className="font-bold text-green-400 text-base sm:text-lg">
                                  {formatCurrency(item.value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Production Steps */}
                    {result.productionSteps.length > 0 && (
                      <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-700 rounded-xl overflow-hidden">
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-700 bg-blue-900/20">
                          <div className="flex items-center space-x-2">
                            <Hammer className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                            <h3 className="text-base sm:text-lg font-semibold text-blue-100">
                              Production Steps ({result.productionSteps.length})
                            </h3>
                          </div>
                        </div>
                        <div className="p-4 sm:p-6">
                          <div className="space-y-3 sm:space-y-4 max-h-48 sm:max-h-60 overflow-y-auto custom-scrollbar">
                            {result.productionSteps.map((step, index) => (
                              <div
                                key={index}
                                className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 sm:p-5 hover:border-blue-500/50 transition-all duration-200"
                              >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4 gap-2">
                                  <span className="font-semibold text-white text-base sm:text-lg">
                                    {step.displayName} ×
                                    {step.quantity.toLocaleString()}
                                  </span>
                                  <span className="font-bold text-green-400 text-lg sm:text-xl">
                                    {formatCurrency(step.value)}
                                  </span>
                                </div>

                                {step.requirements.length > 0 && (
                                  <div className="text-xs sm:text-sm text-gray-300 mb-3 bg-gray-900/50 p-2 sm:p-3 rounded-lg border border-gray-600">
                                    <strong className="text-blue-300">
                                      Requirements:
                                    </strong>
                                    {step.requirements
                                      .map(
                                        (req) =>
                                          `${
                                            req.displayName
                                          } ×${req.quantity.toLocaleString()}`
                                      )
                                      .join(", ")}
                                  </div>
                                )}

                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                  <div className="flex items-center space-x-2 text-gray-400">
                                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="text-xs sm:text-sm">
                                      {step.timeFormatted}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-green-400">
                                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="text-xs sm:text-sm">
                                      {formatCurrency(step.profitPerMinute)}/min
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Remaining Materials */}
                    {result.remainingMaterials.length > 0 && (
                      <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-700 rounded-xl overflow-hidden">
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-yellow-700 bg-yellow-900/20">
                          <div className="flex items-center space-x-2">
                            <Archive className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                            <h3 className="text-base sm:text-lg font-semibold text-yellow-100">
                              Remaining Materials (
                              {result.remainingMaterials.length})
                            </h3>
                          </div>
                        </div>
                        <div className="p-4 sm:p-6">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-3 sm:gap-4 max-h-32 sm:max-h-40 overflow-y-auto custom-scrollbar">
                            {result.remainingMaterials.map((item, index) => (
                              <div
                                key={index}
                                className="bg-gray-800/50 p-3 sm:p-4 rounded-lg border border-gray-700 text-center hover:border-yellow-500/50 transition-all duration-200"
                              >
                                <div className="font-medium text-gray-200 text-xs sm:text-sm mb-1">
                                  {item.displayName}
                                </div>
                                <div className="text-lg sm:text-xl font-bold text-yellow-400">
                                  {item.quantity.toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-16">
                    <div className="relative">
                      <Settings className="h-16 w-16 sm:h-20 sm:w-20 text-gray-600 mx-auto mb-4 sm:mb-6 animate-pulse" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 animate-pulse" />
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
                      Ready to Optimize
                    </h3>
                    <p className="text-gray-400 text-sm sm:text-lg max-w-md mx-auto px-4">
                      Enter your inventory quantities and click
                      &quot;Calculate&quot; to discover the most profitable
                      crafting strategy
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
