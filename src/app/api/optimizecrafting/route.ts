import { NextRequest, NextResponse } from "next/server";
import miningData from "@/data/mining.json";
import {
  ApiRequest,
  DependencyChain,
  Inventory,
  MiningData,
  OptimizationResult,
  OptimizedStep,
  ProductionStep,
  ReadyItem,
  RemainingMaterial,
  RequirementInfo,
} from "@/types";

const typedMiningData = miningData as MiningData;

const allMaterials: string[] = [
  "uncut_copper",
  "iron_ore",
  "gold_ore",
  "silver_ore",
  "aluminium_ore",
  "uncut_sapphire",
  "uncut_diamond",
  "uncut_ruby",
  "uncut_emerald",
  "coal",
  ...Object.keys(typedMiningData.tambang),
  ...Object.keys(typedMiningData.perhiasan),
].filter((item, i, arr) => arr.indexOf(item) === i);

const fmt = (name: string): string =>
  name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

const formatTime = (s: number): string => {
  if (s === 0) return "0s";

  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  let result = "";
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m `;
  if (seconds > 0) result += `${seconds}s`;

  return result.trim();
};

function calculateDependencyChain(
  itemName: string,
  quantity: number,
  miningData: MiningData,
  memo: Record<string, DependencyChain> = {}
): DependencyChain {
  const key = `${itemName}_${quantity}`;
  if (memo[key]) return memo[key];

  const allItems = { ...miningData.tambang, ...miningData.perhiasan };
  const itemData = allItems[itemName];

  if (!itemData) {
    memo[key] = {
      rawMaterials: { [itemName]: quantity },
      productionSteps: [],
      totalTime: 0,
      totalProfit: 0,
    };
    return memo[key];
  }

  const requirements = itemData.require || {};
  const totalRawMaterials: Record<string, number> = {};
  const allProductionSteps: ProductionStep[] = [];
  let totalTime = quantity * 15;
  let totalProfit = itemData.price * quantity;

  for (const [reqItem, reqQty] of Object.entries(requirements)) {
    const totalReqQty = (reqQty as number) * quantity;
    const depChain = calculateDependencyChain(
      reqItem,
      totalReqQty,
      miningData,
      memo
    );

    totalTime += depChain.totalTime;
    totalProfit += depChain.totalProfit;

    for (const [rawItem, rawQty] of Object.entries(depChain.rawMaterials)) {
      totalRawMaterials[rawItem] = (totalRawMaterials[rawItem] || 0) + rawQty;
    }

    allProductionSteps.push(...depChain.productionSteps);
  }

  if (Object.keys(requirements).length > 0) {
    allProductionSteps.push({
      itemName,
      quantity,
      requirements: Object.entries(requirements).map(([item, qty]) => ({
        item,
        quantity: (qty as number) * quantity,
      })),
      time: quantity * 15,
      profit: itemData.price * quantity,
    });
  }

  const result: DependencyChain = {
    rawMaterials: totalRawMaterials,
    productionSteps: allProductionSteps,
    totalTime,
    totalProfit,
  };

  memo[key] = result;
  return result;
}

function canAffordChain(
  rawMaterialsNeeded: Record<string, number>,
  currentInventory: Inventory
): boolean {
  for (const [item, needed] of Object.entries(rawMaterialsNeeded)) {
    if ((currentInventory[item] || 0) < needed) {
      return false;
    }
  }
  return true;
}

function calculateMaxQuantity(
  itemName: string,
  miningData: MiningData,
  currentInventory: Inventory
): number {
  const singleItemChain = calculateDependencyChain(itemName, 1, miningData);
  const rawNeeded = singleItemChain.rawMaterials;

  let maxQty = Infinity;
  for (const [rawItem, neededPerUnit] of Object.entries(rawNeeded)) {
    const available = currentInventory[rawItem] || 0;
    if (neededPerUnit > 0) {
      maxQty = Math.min(maxQty, Math.floor(available / neededPerUnit));
    }
  }

  return maxQty === Infinity ? 0 : maxQty;
}

function optimizeWithDependencies(
  inventoryInput: Inventory
): OptimizationResult {
  const inventory: Inventory = {};
  allMaterials.forEach((item) => {
    inventory[item] = inventoryInput[item] || 0;
  });

  const inv = { ...inventory };
  const allProductionSteps: OptimizedStep[] = [];
  let totalProfit = 0;
  let totalTime = 0;

  const allItems = { ...typedMiningData.tambang, ...typedMiningData.perhiasan };

  const readyItems: ReadyItem[] = [];
  Object.entries(allItems).forEach(([name, data]) => {
    const req = data.require || {};
    if (Object.keys(req).length === 0 && inv[name] > 0 && data.price > 0) {
      const value = data.price * inv[name];
      readyItems.push({
        name,
        displayName: fmt(name),
        quantity: inv[name],
        value: value,
        time: 0,
        profitPerMinute: Infinity,
        ready: true,
      });
      totalProfit += value;
      inv[name] = 0;
    }
  });

  while (true) {
    let bestChain: {
      itemName: string;
      maxQty: number;
      chain: DependencyChain;
      ppm: number;
      finalProfit: number;
    } | null = null;
    let bestPPM = 0;

    for (const [itemName, itemData] of Object.entries(allItems)) {
      if (itemData.price <= 0) continue;

      const maxQty = calculateMaxQuantity(itemName, typedMiningData, inv);
      if (maxQty <= 0) continue;

      const chain = calculateDependencyChain(itemName, maxQty, typedMiningData);

      if (!canAffordChain(chain.rawMaterials, inv)) continue;

      const ppm = chain.totalProfit / (chain.totalTime / 60);

      if (ppm > bestPPM) {
        bestChain = {
          itemName,
          maxQty,
          chain,
          ppm,
          finalProfit: itemData.price * maxQty,
        };
        bestPPM = ppm;
      }
    }

    if (!bestChain) break;

    const { chain } = bestChain;

    for (const [rawItem, qty] of Object.entries(chain.rawMaterials)) {
      inv[rawItem] = (inv[rawItem] || 0) - qty;
    }

    const stepsByItem: Record<
      string,
      {
        name: string;
        quantity: number;
        time: number;
        profit: number;
        requirements: Array<{ item: string; quantity: number }>;
      }
    > = {};

    for (const step of chain.productionSteps) {
      inv[step.itemName] = (inv[step.itemName] || 0) + step.quantity;

      if (!stepsByItem[step.itemName]) {
        stepsByItem[step.itemName] = {
          name: step.itemName,
          quantity: 0,
          time: 0,
          profit: 0,
          requirements: [],
        };
      }

      stepsByItem[step.itemName].quantity += step.quantity;
      stepsByItem[step.itemName].time += step.time;
      stepsByItem[step.itemName].profit += step.profit;

      for (const req of step.requirements) {
        const existingReq = stepsByItem[step.itemName].requirements.find(
          (r) => r.item === req.item
        );
        if (existingReq) {
          existingReq.quantity += req.quantity;
        } else {
          stepsByItem[step.itemName].requirements.push({ ...req });
        }
      }
    }
    Object.values(stepsByItem).forEach((step) => {
      const requirementStrings: RequirementInfo[] = step.requirements.map(
        (req: { item: string; quantity: number }) => ({
          item: req.item,
          displayName: fmt(req.item),
          quantity: req.quantity,
        })
      );

      allProductionSteps.push({
        name: step.name,
        displayName: fmt(step.name),
        quantity: step.quantity,
        value: step.profit,
        time: step.time,
        timeFormatted: formatTime(step.time),
        profitPerMinute: Math.round(step.profit / (step.time / 60)),
        requirements: requirementStrings,
        ready: false,
      });
    });

    totalProfit += bestChain.finalProfit;
    totalTime += chain.totalTime;
  }
  const remainingItems: RemainingMaterial[] = Object.entries(inv)
    .filter(([, qty]) => qty > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([itemName, qty]) => ({
      name: itemName,
      displayName: fmt(itemName),
      quantity: qty,
    }));

  return {
    success: true,
    data: {
      summary: {
        totalProfit,
        totalTime,
        totalTimeFormatted: formatTime(totalTime),
        profitPerHour:
          totalTime > 0 ? Math.round(totalProfit / (totalTime / 3600)) : 0,
      },
      readyItems,
      productionSteps: allProductionSteps,
      remainingMaterials: remainingItems,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ApiRequest = await request.json();

    if (!body.inventory || typeof body.inventory !== "object") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid inventory data. Expected object with material quantities.",
        },
        { status: 400 }
      );
    }

    const result = optimizeWithDependencies(body.inventory);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Optimization error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during optimization.",
      },
      { status: 500 }
    );
  }
}
