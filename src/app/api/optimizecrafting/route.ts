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
  SellableItem,
} from "@/types";

const typedMiningData = miningData as MiningData;

const allMaterials: string[] = [
  "copper_ore",
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

const time = (s: number): string => {
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
  let totalRawMaterials: Record<string, number> = {};
  let allProductionSteps: ProductionStep[] = [];
  let totalTime = quantity * 15;
  let totalProfit = itemData.price * quantity;

  if (Object.keys(requirements).length === 0) {
    memo[key] = {
      rawMaterials: { [itemName]: quantity },
      productionSteps: [],
      totalTime: 0,
      totalProfit: 0,
    };
    return memo[key];
  }

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

function calculateDependencyChainWithInventory(
  itemName: string,
  quantity: number,
  miningData: MiningData,
  currentInventory: Inventory,
  memo: Record<string, DependencyChain> = {}
): DependencyChain {
  const key = `${itemName}_${quantity}_${JSON.stringify(currentInventory)}`;
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
  let totalRawMaterials: Record<string, number> = {};
  let allProductionSteps: ProductionStep[] = [];
  let totalTime = quantity * 15;
  let totalProfit = itemData.price * quantity;

  if (Object.keys(requirements).length === 0) {
    memo[key] = {
      rawMaterials: { [itemName]: quantity },
      productionSteps: [],
      totalTime: 0,
      totalProfit: 0,
    };
    return memo[key];
  }

  for (const [reqItem, reqQty] of Object.entries(requirements)) {
    const totalReqQty = (reqQty as number) * quantity;
    const availableInInventory = currentInventory[reqItem] || 0;

    if (availableInInventory >= totalReqQty) {
      totalRawMaterials[reqItem] =
        (totalRawMaterials[reqItem] || 0) + totalReqQty;
    } else {
      const needToCraft = totalReqQty - availableInInventory;

      if (availableInInventory > 0) {
        totalRawMaterials[reqItem] =
          (totalRawMaterials[reqItem] || 0) + availableInInventory;
      }

      const depChain = calculateDependencyChain(
        reqItem,
        needToCraft,
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
  const allItems = { ...miningData.tambang, ...miningData.perhiasan };
  const itemData = allItems[itemName];

  if (!itemData || !itemData.require) {
    return currentInventory[itemName] || 0;
  }

  const requirements = itemData.require;
  let maxQty = Infinity;

  for (const [reqItem, reqQty] of Object.entries(requirements)) {
    const neededPerUnit = reqQty as number;
    const availableInInventory = currentInventory[reqItem] || 0;

    if (neededPerUnit > 0) {
      const reqItemData = allItems[reqItem];
      if (
        reqItemData &&
        reqItemData.require &&
        Object.keys(reqItemData.require).length > 0
      ) {
        const maxCraftable = calculateMaxQuantity(
          reqItem,
          miningData,
          currentInventory
        );
        const totalAvailable = availableInInventory + maxCraftable;
        maxQty = Math.min(maxQty, Math.floor(totalAvailable / neededPerUnit));
      } else {
        maxQty = Math.min(
          maxQty,
          Math.floor(availableInInventory / neededPerUnit)
        );
      }
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

  let inv = { ...inventory };
  const allProductionSteps: OptimizedStep[] = [];
  let totalProfit = 0;
  let totalTime = 0;

  const allItems = { ...typedMiningData.tambang, ...typedMiningData.perhiasan };

  while (true) {
    let bestChain: {
      itemName: string;
      maxQty: number;
      chain: DependencyChain;
      totalProfit: number;
      finalProfit: number;
    } | null = null;
    let bestTotalProfit = 0;
    for (const [itemName, itemData] of Object.entries(allItems)) {
      if (itemData.price <= 0) continue;
      const maxQty = calculateMaxQuantity(itemName, typedMiningData, inv);
      if (maxQty <= 0) continue;

      const chain = calculateDependencyChainWithInventory(
        itemName,
        maxQty,
        typedMiningData,
        inv
      );

      if (!canAffordChain(chain.rawMaterials, inv)) continue;

      const totalProfit = chain.totalProfit;

      if (totalProfit > bestTotalProfit) {
        bestChain = {
          itemName,
          maxQty,
          chain,
          totalProfit,
          finalProfit: itemData.price * maxQty,
        };
        bestTotalProfit = totalProfit;
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
        qty: number;
        time: number;
        profit: number;
        requirements: Array<{ item: string; quantity: number }>;
      }
    > = {};
    for (const step of chain.productionSteps) {
      inv[step.itemName] = (inv[step.itemName] || 0) + step.quantity;

      for (const req of step.requirements) {
        inv[req.item] = (inv[req.item] || 0) - req.quantity;
      }

      if (!stepsByItem[step.itemName]) {
        stepsByItem[step.itemName] = {
          name: step.itemName,
          qty: 0,
          time: 0,
          profit: 0,
          requirements: [],
        };
      }

      stepsByItem[step.itemName].qty += step.quantity;
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
      allProductionSteps.push({
        name: step.name,
        displayName: fmt(step.name),
        quantity: step.qty,
        value: step.profit,
        time: step.time,
        timeFormatted: time(step.time),
        requirements: step.requirements.map((req) => ({
          item: req.item,
          displayName: fmt(req.item),
          quantity: req.quantity,
        })),
        ready: false,
      });
    });
    totalProfit += bestChain.finalProfit;
    totalTime += chain.totalTime;
  }
  const productionSteps = allProductionSteps.map((step, index) => ({
    ...step,
    step: index + 1,
  }));
  const sellableItems: SellableItem[] = [];
  let totalSellValue = 0;

  Object.entries(inv)
    .filter(([name, qty]) => qty > 0)
    .forEach(([name, qty]) => {
      const itemData = allItems[name];
      const price = itemData?.price || 0;

      if (price > 0) {
        const value = price * qty;
        sellableItems.push({
          name: fmt(name),
          quantity: qty,
          price: price,
          value: value,
        });
        totalSellValue += value;
      }
    });

  sellableItems.sort((a, b) => b.value - a.value);
  return {
    success: true,
    data: {
      summary: {
        totalProfit,
        totalSellValue,
        totalTime,
        totalTimeFormatted: time(totalTime),
      },
      sellableItems,
      productionSteps,
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
