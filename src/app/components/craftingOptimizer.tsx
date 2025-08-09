"use client";

import {
  Inventory,
  OptimizationResult,
  OptimizedStep,
  RequirementInfo,
  MiningData,
} from "@/types";
import { useState } from "react";
import Image from "next/image";
import miningData from "@/data/mining.json";
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
  CircleX,
  Hammer,
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
    "alluminium_ore",
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
    "emerald_earring_silver",
  ],
  Necklaces: [
    "gold_chain",
    "silver_chain",
    "diamond_necklace",
    "ruby_necklace",
    "sapphire_necklace",
    "emerald_necklace",
    "diamond_necklace_silver",
    "ruby_necklace_silver",
    "emerald_necklace_silver",
    "sapphire_necklace_silver",
  ],
};

const categoryIcons = {
  "Raw Materials": Package,
  Ingots: Coins,
  Rings: Target,
  Earrings: Sparkles,
  Necklaces: Activity,
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
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

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
    const cleanValue = value.replace(/[^\d]/g, "");
    const numValue = parseInt(cleanValue) || 0;
    setInventory((prev) => ({
      ...prev,
      [item]: Math.max(0, numValue),
    }));
  };

  const formatDisplayValue = (value: number): string => {
    if (value === 0) return "";
    return value.toLocaleString();
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
  const getItemPrice = (itemName: string): number => {
    const typedMiningData = miningData as MiningData;
    const allItems = {
      ...typedMiningData.tambang,
      ...typedMiningData.perhiasan,
    };
    return allItems[itemName]?.price || 0;
  };
  const toggleStepCompletion = (stepIndex: number): void => {
    const isCompleted = completedSteps.has(stepIndex);

    if (isCompleted) {
      setCompletedSteps((prev) => {
        const newSet = new Set(prev);
        newSet.delete(stepIndex);
        return newSet;
      });
    } else {
      setCompletedSteps((prev) => new Set([...prev, stepIndex]));
    }
  };

  const resetCompletedSteps = (): void => {
    setCompletedSteps(new Set());
    if (result) {
      handleOptimize();
    }
  };

  const CategoryIcon =
    categoryIcons[activeCategory as keyof typeof categoryIcons];

  const getProfitTier = (
    stepValue: number,
    allSteps: OptimizedStep[]
  ): string => {
    if (allSteps.length === 0) return "medium";

    const values = allSteps.map((step) => step.value).sort((a, b) => b - a);
    const q1Index = Math.floor(values.length * 0.25);
    const q3Index = Math.floor(values.length * 0.75);

    const highThreshold = values[q1Index] || 0;
    const lowThreshold = values[q3Index] || 0;

    if (stepValue >= highThreshold) return "high";
    if (stepValue <= lowThreshold) return "low";
    return "medium";
  };

  const getProfitColors = (tier: string) => {
    switch (tier) {
      case "high":
        return {
          border: "border-green-500/70",
          bg: "bg-green-900/30",
          glow: "hover:shadow-green-500/30",
          text: "text-green-300",
          icon: "text-green-400",
        };
      case "medium":
        return {
          border: "border-blue-500/50",
          bg: "bg-blue-900/20",
          glow: "hover:shadow-blue-500/20",
          text: "text-blue-300",
          icon: "text-blue-400",
        };
      case "low":
        return {
          border: "border-orange-500/50",
          bg: "bg-orange-900/20",
          glow: "hover:shadow-orange-500/20",
          text: "text-orange-300",
          icon: "text-orange-400",
        };
      default:
        return {
          border: "border-gray-700",
          bg: "bg-gray-800/50",
          glow: "hover:shadow-gray-500/20",
          text: "text-gray-300",
          icon: "text-gray-400",
        };
    }
  };
  return (
    <div className="font-mono">
      {" "}
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl mb-6">
        <div className="max-w-full mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-xl">
                <Image
                  src="/motionlife.gif"
                  alt="Crafting Calculator"
                  width={48}
                  height={48}
                  className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
                />
              </div>
              <div className="text-center sm:text-left">
                {" "}
                <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  Kalkulator Crafting
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Optimasi strategi crafting terbaik
                </p>
              </div>
            </div>
            <button
              onClick={handleOptimize}
              disabled={loading || getTotalItems() === 0}
              className="group relative inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-green-500/25 transform hover:scale-105 w-full sm:w-auto justify-center"
            >
              {" "}
              {loading ? (
                <>
                  <div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Menghitung...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                  <span>Hitung Optimasi</span>
                </>
              )}
            </button>{" "}
          </div>
        </div>
      </div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel - Inventory Input */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden min-h-[500px]">
            <div className="p-4 sm:p-6 border-b border-gray-800 bg-gradient-to-r from-gray-800 to-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    Inventory
                  </h2>
                </div>{" "}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm text-gray-400">
                      Total:
                    </span>
                    <span className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded-full text-xs sm:text-sm font-bold min-w-[50px] text-center">
                      {getTotalItems()}
                    </span>
                  </div>
                  {getTotalItems() > 0 && (
                    <button
                      onClick={() => setInventory(createEmptyInventory())}
                      className="px-2 sm:px-3 py-1 bg-red-600/20 hover:bg-red-600/30 border border-red-600 text-red-400 hover:text-red-300 rounded-full text-xs font-bold transition-all duration-200 min-w-[50px] text-center"
                      title="Clear semua inventory"
                    >
                      Clear
                    </button>
                  )}
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
            </div>{" "}
            {/* Items Grid */}
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-h-80 sm:max-h-[800px] overflow-y-auto custom-scrollbar">
                {materialCategories[
                  activeCategory as keyof typeof materialCategories
                ].map((item) => (
                  <div
                    key={item}
                    className="group bg-gray-800 border border-gray-700 rounded-xl p-4 hover:bg-gray-750 hover:border-blue-500/50 transition-all duration-200 flex flex-col min-h-[160px] relative"
                  >
                    {/* Price legend or Raw indicator */}
                    {getItemPrice(item) > 0 ? (
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-gradient-to-r from-green-900/40 via-green-800/30 to-green-900/40 border-t-2 border-green-500/50 px-3 py-1 rounded-lg backdrop-blur-sm">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-green-400 font-mono font-bold text-xs">
                              ${getItemPrice(item)}
                            </span>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-gradient-to-r from-orange-900/40 via-orange-800/30 to-orange-900/40 border-t-2 border-orange-500/50 px-3 py-1 rounded-lg backdrop-blur-sm">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                            <span className="text-orange-400 font-mono font-bold text-xs">
                              Raw
                            </span>
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Input field - positioned at top center */}
                    <div className="flex items-center justify-center mb-3">
                      <input
                        type="text"
                        value={formatDisplayValue(inventory[item])}
                        onChange={(e) =>
                          handleInventoryChange(item, e.target.value)
                        }
                        className="w-full bg-gray-900 border-2 border-gray-600 rounded-xl px-4 py-3 text-center font-mono text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-500 shadow-inner"
                        placeholder="0"
                        style={{ letterSpacing: "0.05em" }}
                      />
                    </div>

                    {/* Item name - positioned at center with full width */}
                    <div className="flex-1 flex items-center justify-center text-center px-2 pb-8">
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors font-medium leading-tight block">
                        {formatItemName(item)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>{" "}
        {/* Right Panel - Results */}
        <div className="lg:col-span-3">
          <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden min-h-[500px]">
            {" "}
            <div className="p-4 sm:p-6 border-b border-gray-800 bg-gradient-to-r from-gray-800 to-gray-900">
              <div className="flex items-center justify-between">
                {" "}
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    Hasil Optimasi
                  </h2>
                </div>
                {completedSteps.size > 0 && (
                  <button
                    onClick={resetCompletedSteps}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg transition-colors"
                  >
                    Reset Progress
                  </button>
                )}
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
                      {" "}
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
                          {" "}
                          <p className="text-xs sm:text-sm font-medium text-green-300">
                            Total Keuntungan
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
                          {" "}
                          <p className="text-xs sm:text-sm font-medium text-blue-300">
                            Total Waktu (Smelting)
                          </p>
                          <p className="text-lg sm:text-2xl font-bold text-blue-100">
                            {result.summary.totalTimeFormatted}
                          </p>
                        </div>
                      </div>
                    </div>{" "}
                    <div className="group bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-700 rounded-xl p-4 sm:p-5 hover:shadow-purple-500/20 hover:shadow-lg transition-all duration-300 sm:col-span-1 col-span-1">
                      <div className="flex items-center">
                        <div className="p-1.5 sm:p-2 bg-purple-600 rounded-lg">
                          <Coins className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                        </div>
                        <div className="ml-3 sm:ml-4">
                          {" "}
                          <p className="text-xs sm:text-sm font-medium text-purple-300">
                            Total Jual Semua Item
                          </p>
                          <p className="text-lg sm:text-2xl font-bold text-purple-100">
                            {formatCurrency(result.summary.totalSellValue)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>{" "}
                  {/* Production Steps */}
                  {result.productionSteps.length > 0 && (
                    <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-700 rounded-xl overflow-hidden">
                      {" "}
                      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-700 bg-blue-900/20">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center space-x-2">
                            <Hammer className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />{" "}
                            <h3 className="text-base sm:text-lg font-semibold text-blue-100">
                              Langkah Produksi ({result.productionSteps.length})
                            </h3>
                          </div>

                          <div className="flex items-center gap-4">
                            {/* Profit Legend */}
                            <div className="flex items-center space-x-3 text-xs">
                              {" "}
                              <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                <span className="text-green-300">
                                  Untung Tinggi
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                <span className="text-blue-300">Sedang</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                                <span className="text-orange-300">Rendah</span>
                              </div>
                            </div>{" "}
                            {completedSteps.size > 0 && (
                              <span className="text-xs text-green-400">
                                {completedSteps.size} selesai
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 sm:p-6">
                        <div className="space-y-3 sm:space-y-4 max-h-96 sm:max-h-[500px] overflow-y-auto custom-scrollbar">
                          {" "}
                          {result.productionSteps.map((step, index) => {
                            const profitTier = getProfitTier(
                              step.value,
                              result.productionSteps
                            );
                            const profitColors = getProfitColors(profitTier);

                            return (
                              <div
                                key={index}
                                className={`relative rounded-xl p-4 sm:p-5 transition-all duration-300 ${profitColors.bg} ${profitColors.border} ${profitColors.glow} border-2 ${
                                  completedSteps.has(index)
                                    ? "border-green-500/70 bg-green-900/30 opacity-75"
                                    : `${profitColors.border} hover:border-opacity-80`
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4 gap-2">
                                  <span
                                    className={`font-semibold text-base sm:text-lg ${
                                      completedSteps.has(index)
                                        ? "text-green-300 line-through"
                                        : `text-white`
                                    }`}
                                  >
                                    {step.displayName} ×
                                    {step.quantity.toLocaleString()}
                                  </span>
                                  <div className="flex items-center gap-3">
                                    <span
                                      className={`font-bold text-lg sm:text-xl ${
                                        completedSteps.has(index)
                                          ? "text-green-300"
                                          : profitColors.text
                                      }`}
                                    >
                                      {formatCurrency(step.value)}
                                    </span>
                                    <button
                                      onClick={() =>
                                        toggleStepCompletion(index)
                                      }
                                      className={`p-2 ${
                                        completedSteps.has(index)
                                          ? "bg-yellow-600 hover:bg-yellow-700"
                                          : "bg-blue-600 hover:bg-blue-700"
                                      } text-white rounded-lg transition-colors group`}
                                      title={
                                        completedSteps.has(index)
                                          ? "Unmark Step"
                                          : "Mark as Done"
                                      }
                                    >
                                      {completedSteps.has(index) ? (
                                        <CircleX className="h-4 w-4" />
                                      ) : (
                                        <CheckCircle2 className="h-4 w-4" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                                {step.requirements.length > 0 && (
                                  <div className="text-xs sm:text-sm text-gray-300 mb-3 bg-gray-900/50 p-2 sm:p-3 rounded-lg border border-gray-600">
                                    {" "}
                                    <strong className="text-blue-300">
                                      Kebutuhan:
                                    </strong>{" "}
                                    {step.requirements
                                      .map((req: RequirementInfo) => (
                                        <span
                                          key={req.item}
                                          className="text-gray-300"
                                        >
                                          {req.displayName} ×
                                          {req.quantity.toLocaleString()}
                                        </span>
                                      ))
                                      .reduce(
                                        (
                                          prev: React.ReactNode,
                                          curr: React.ReactNode
                                        ) => (prev ? [prev, ", ", curr] : curr),
                                        null as React.ReactNode
                                      )}
                                  </div>
                                )}{" "}
                                {/* Cost and Profit Margin Info */}
                                {step.opportunityCost &&
                                  step.opportunityCost > 0 && (
                                    <div className="mb-3 p-2 sm:p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-xs text-orange-400">
                                            💰 Cost:
                                          </span>
                                          <span className="text-xs font-mono text-orange-300">
                                            {formatCurrency(
                                              step.opportunityCost
                                            )}
                                          </span>
                                        </div>
                                        {step.profitMargin &&
                                          step.profitMargin > 0 && (
                                            <div className="flex items-center space-x-2">
                                              <span className="text-xs text-green-400">
                                                📈 Margin:
                                              </span>
                                              <span className="text-xs font-mono text-green-300">
                                                +{step.profitMargin.toFixed(1)}%
                                              </span>
                                            </div>
                                          )}
                                      </div>
                                    </div>
                                  )}
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                  <div className="flex items-center space-x-2 text-gray-400">
                                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="text-xs sm:text-sm">
                                      {step.timeFormatted}
                                    </span>
                                  </div>
                                  <div
                                    className={`flex items-center space-x-2 ${profitColors.text}`}
                                  >
                                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="text-xs sm:text-sm font-semibold">
                                      ${Math.round(step.value / step.quantity)}
                                      /unit
                                    </span>
                                  </div>
                                </div>
                                {completedSteps.has(index) && (
                                  <div className="absolute inset-0 bg-green-500/10 rounded-xl pointer-events-none"></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Sellable Items */}
                  {result.sellableItems.length > 0 && (
                    <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-700 rounded-xl overflow-hidden">
                      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-green-700 bg-green-900/20">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />{" "}
                          <h3 className="text-base sm:text-lg font-semibold text-green-100">
                            Item yang Bisa Dijual ({result.sellableItems.length}
                            )
                          </h3>
                        </div>
                      </div>
                      <div className="p-4 sm:p-6">
                        <div className="space-y-2 sm:space-y-3 max-h-32 sm:max-h-40 overflow-y-auto custom-scrollbar">
                          {result.sellableItems.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center bg-gray-800/50 p-3 sm:p-4 rounded-lg border border-gray-700 hover:border-green-500/50 transition-all duration-200"
                            >
                              <span className="font-medium text-gray-200 text-sm sm:text-base">
                                {item.name} ×{item.quantity.toLocaleString()}
                              </span>
                              <span className="font-bold text-green-400 text-base sm:text-lg">
                                {formatCurrency(item.value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}{" "}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-16">
                  <div className="relative">
                    <Settings className="h-16 w-16 sm:h-20 sm:w-20 text-gray-600 mx-auto mb-4 sm:mb-6 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 animate-pulse" />
                    </div>
                  </div>{" "}
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
                    Siap untuk Optimasi
                  </h3>{" "}
                  <p className="text-gray-400 text-sm sm:text-lg max-w-md mx-auto px-4">
                    Masukkan jumlah inventory Anda dan klik &quot;Hitung
                    Optimasi&quot; untuk menemukan strategi crafting yang paling
                    menguntungkan
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
