import { NextRequest, NextResponse } from "next/server";
import miningData from "@/data/mining.json";
import {
  ApiRequest,
  DependencyChain,
  GameItem,
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
  "alluminium_ore",
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
  const totalRawMaterials: Record<string, number> = {};
  const allProductionSteps: ProductionStep[] = [];
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
  const totalRawMaterials: Record<string, number> = {};
  const allProductionSteps: ProductionStep[] = [];
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

function calculateOpportunityCost(
  itemName: string,
  quantity: number,
  allItems: Record<string, GameItem>,
  memo: Record<string, number> = {}
): number {
  const key = `${itemName}_${quantity}`;
  if (memo[key] !== undefined) return memo[key];

  const itemData = allItems[itemName];
  if (!itemData) {
    memo[key] = 0;
    return 0;
  }

  const requirements = itemData.require || {};
  let totalCost = 0;

  if (Object.keys(requirements).length === 0) {
    totalCost = 0;
  } else {
    for (const [reqItem, reqQty] of Object.entries(requirements)) {
      const totalReqQty = (reqQty as number) * quantity;
      const reqItemData = allItems[reqItem];

      if (reqItemData && reqItemData.price > 0) {
        totalCost += reqItemData.price * totalReqQty;
      } else {
        totalCost += calculateOpportunityCost(
          reqItem,
          totalReqQty,
          allItems,
          memo
        );
      }
    }
  }

  memo[key] = totalCost;
  return totalCost;
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

  while (true) {
    let bestChain: {
      itemName: string;
      maxQty: number;
      chain: DependencyChain;
      profitMargin: number;
      finalProfit: number;
      opportunityCost: number;
    } | null = null;
    let bestProfitMargin = -1;

    for (const [itemName, itemData] of Object.entries(allItems)) {
      if (itemData.price <= 0) continue;

      const maxQty = calculateMaxQuantity(itemName, typedMiningData, inv);
      if (maxQty <= 0) continue;

      for (let qty = Math.min(maxQty, 50); qty >= 1; qty--) {
        const chain = calculateDependencyChainWithInventory(
          itemName,
          qty,
          typedMiningData,
          inv
        );

        if (!canAffordChain(chain.rawMaterials, inv)) continue;

        const opportunityCost = calculateOpportunityCost(
          itemName,
          qty,
          allItems
        );
        const finalProfit = itemData.price * qty;
        const netProfit = finalProfit - opportunityCost;

        const profitMargin =
          opportunityCost > 0
            ? netProfit / opportunityCost
            : netProfit > 0
              ? 1
              : -1;

        const score = profitMargin * 0.6 + (finalProfit / 1000) * 0.4;

        if (
          score > bestProfitMargin ||
          (score === bestProfitMargin &&
            finalProfit > (bestChain?.finalProfit || 0))
        ) {
          bestChain = {
            itemName,
            maxQty: qty,
            chain,
            profitMargin,
            finalProfit,
            opportunityCost,
          };
          bestProfitMargin = score;
        }
      }
    }

    if (!bestChain) {
      break;
    }

    const { chain } = bestChain;

    const sortedSteps = [...chain.productionSteps].sort((a, b) => {
      const aDepth = getItemDepth(a.itemName, allItems);
      const bDepth = getItemDepth(b.itemName, allItems);
      return aDepth - bDepth;
    });

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

    for (const step of sortedSteps) {
      let canProcess = true;
      for (const req of step.requirements) {
        if ((inv[req.item] || 0) < req.quantity) {
          canProcess = false;
          break;
        }
      }

      if (!canProcess) {
        continue;
      }

      for (const req of step.requirements) {
        inv[req.item] = (inv[req.item] || 0) - req.quantity;
        if (inv[req.item] < 0) {
          console.warn(`Negative inventory for ${req.item}: ${inv[req.item]}`);
          inv[req.item] = 0;
        }
      }

      inv[step.itemName] = (inv[step.itemName] || 0) + step.quantity;

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
      const stepOpportunityCost = calculateOpportunityCost(
        step.name,
        step.qty,
        allItems
      );

      const stepProfitMargin =
        stepOpportunityCost > 0
          ? ((step.profit - stepOpportunityCost) / stepOpportunityCost) * 100
          : 0;

      const existingStepIndex = allProductionSteps.findIndex(
        (existingStep) => existingStep.name === step.name
      );

      if (existingStepIndex >= 0) {
        const existingStep = allProductionSteps[existingStepIndex];
        existingStep.quantity += step.qty;
        existingStep.value += step.profit;
        existingStep.time += step.time;
        existingStep.timeFormatted = time(existingStep.time);

        for (const req of step.requirements) {
          const existingReq = existingStep.requirements.find(
            (r) => r.item === req.item
          );
          if (existingReq) {
            existingReq.quantity += req.quantity;
          } else {
            existingStep.requirements.push({
              item: req.item,
              displayName: fmt(req.item),
              quantity: req.quantity,
            });
          }
        }
      } else {
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
          opportunityCost:
            stepOpportunityCost > 0 ? stepOpportunityCost : undefined,
          profitMargin: stepOpportunityCost > 0 ? stepProfitMargin : undefined,
        });
      }
    });

    totalProfit += bestChain.finalProfit - bestChain.opportunityCost;
    totalTime += chain.totalTime;

    const nonZeroItems = Object.entries(inv).filter(([, qty]) => qty > 0);

    const hasValuableMaterials = nonZeroItems.some(([item, qty]) => {
      const itemData = allItems[item];
      return (
        itemData &&
        (itemData.price > 10 ||
          Object.keys(itemData.require || {}).length === 0) &&
        qty > 0
      );
    });

    if (!hasValuableMaterials && bestProfitMargin < 0.01) {
      break;
    }
  }

  const productionSteps = allProductionSteps.map((step, index) => ({
    ...step,
    step: index + 1,
  }));

  const sellableItems: SellableItem[] = [];
  let totalSellValue = 0;

  Object.entries(inv)
    .filter(([, qty]) => qty > 0)
    .forEach(([itemName, qty]) => {
      const itemData = allItems[itemName];
      const price = itemData?.price || 0;

      if (price > 0) {
        const value = price * qty;
        sellableItems.push({
          name: fmt(itemName),
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

function getItemDepth(
  itemName: string,
  allItems: Record<string, GameItem>
): number {
  const itemData = allItems[itemName];
  if (
    !itemData ||
    !itemData.require ||
    Object.keys(itemData.require).length === 0
  ) {
    return 0;
  }

  let maxDepth = 0;
  for (const reqItem of Object.keys(itemData.require)) {
    const reqDepth = getItemDepth(reqItem, allItems);
    maxDepth = Math.max(maxDepth, reqDepth + 1);
  }
  return maxDepth;
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
