import { NextRequest, NextResponse } from "next/server";
import miningData from "@/data/mining.json";
import {
  ApiRequest,
  DependencyChain,
  GameItem,
  Inventory,
  OptimizationResult,
  OptimizedStep,
  ProductionStep,
  SellableItem,
} from "@/types";

const typedMiningData = miningData as {
  tambang: Record<string, GameItem>;
  perhiasan: Record<string, GameItem>;
};

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

const isIngot = (itemName: string): boolean => {
  return itemName.endsWith("_ingot");
};

const isUncut = (itemName: string): boolean => {
  return itemName.startsWith("uncut_");
};

const getCutVersion = (uncutItem: string): string => {
  return uncutItem.replace("uncut_", "");
};

const isCutGem = (itemName: string): boolean => {
  const cutVersion = getCutVersion(itemName);
  return Object.keys(typedMiningData.perhiasan).includes(cutVersion);
};

function calculateDependencyChain(
  itemName: string,
  quantity: number,
  miningData: typeof typedMiningData,
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

  const shouldSkipStep =
    (isIngot(itemName) && allMaterials.includes(itemName)) ||
    (isUncut(itemName) && allMaterials.includes(itemName)) ||
    (isCutGem(itemName) && allMaterials.includes(`uncut_${itemName}`));

  if (!shouldSkipStep) {
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
  miningData: typeof typedMiningData,
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

  const workingInventory = { ...currentInventory };

  for (const [reqItem, reqQty] of Object.entries(requirements)) {
    const totalReqQty = (reqQty as number) * quantity;
    const availableInInventory = workingInventory[reqItem] || 0;

    if (availableInInventory >= totalReqQty) {
      totalRawMaterials[reqItem] =
        (totalRawMaterials[reqItem] || 0) + totalReqQty;
      workingInventory[reqItem] -= totalReqQty;
    } else {
      const needToCraft = totalReqQty - availableInInventory;

      if (availableInInventory > 0) {
        totalRawMaterials[reqItem] =
          (totalRawMaterials[reqItem] || 0) + availableInInventory;
        workingInventory[reqItem] = 0;
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

  const shouldSkipStep =
    (isIngot(itemName) && allMaterials.includes(itemName)) ||
    (isCutGem(itemName) && allMaterials.includes(`uncut_${itemName}`));

  if (!shouldSkipStep) {
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

function canActuallyCraftQuantity(
  itemName: string,
  quantity: number,
  miningData: typeof typedMiningData,
  inventory: Inventory
): boolean {
  if (quantity <= 0) return true;

  const allItems = { ...miningData.tambang, ...miningData.perhiasan };
  const itemData = allItems[itemName];

  if (
    !itemData ||
    !itemData.require ||
    Object.keys(itemData.require).length === 0
  ) {
    return (inventory[itemName] || 0) >= quantity;
  }

  const requirements = itemData.require;

  for (const [reqItem, reqQty] of Object.entries(requirements)) {
    const totalNeeded = (reqQty as number) * quantity;
    const available = inventory[reqItem] || 0;

    if (available >= totalNeeded) {
      inventory[reqItem] -= totalNeeded;
      continue;
    }

    const stillNeeded = totalNeeded - available;
    inventory[reqItem] = 0;

    if (
      !canActuallyCraftQuantity(reqItem, stillNeeded, miningData, {
        ...inventory,
      })
    ) {
      return false;
    }
  }

  return true;
}

function calculateActualMaxQuantity(
  itemName: string,
  miningData: typeof typedMiningData,
  currentInventory: Inventory
): number {
  const allItems = { ...miningData.tambang, ...miningData.perhiasan };
  const itemData = allItems[itemName];

  let low = 0;
  let high = 1000;

  if (itemData && itemData.require) {
    for (const [reqItem, reqQty] of Object.entries(itemData.require)) {
      const neededPerUnit = reqQty as number;
      if (neededPerUnit > 0) {
        const maxInventory = Math.max(...Object.values(currentInventory), 0);
        high = Math.min(high, Math.floor(maxInventory / neededPerUnit) + 1);
      }
    }
  }

  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (
      canActuallyCraftQuantity(itemName, mid, miningData, {
        ...currentInventory,
      })
    ) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }

  return low;
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
      finalProfit: number;
      opportunityCost: number;
    } | null = null;
    let bestScore = -Infinity;

    for (const [itemName, itemData] of Object.entries(allItems)) {
      if (itemData.price <= 0) continue;

      const maxQty = calculateActualMaxQuantity(itemName, typedMiningData, inv);
      if (maxQty <= 0) continue;

      for (let qty = Math.min(maxQty, 50); qty >= 1; qty--) {
        if (
          !canActuallyCraftQuantity(itemName, qty, typedMiningData, { ...inv })
        ) {
          continue;
        }

        const chain = calculateDependencyChainWithInventory(
          itemName,
          qty,
          typedMiningData,
          inv
        );
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
            : finalProfit > 0
              ? 1
              : -1;
        const score = profitMargin * 0.6 + (finalProfit / 1000) * 0.4;

        if (
          score > bestScore ||
          (score === bestScore && finalProfit > (bestChain?.finalProfit || 0))
        ) {
          bestChain = {
            itemName,
            maxQty: qty,
            chain,
            finalProfit,
            opportunityCost,
          };
          bestScore = score;
        }
      }
    }

    if (!bestChain) break;

    const craftingInventory = { ...inv };
    if (
      !canActuallyCraftQuantity(
        bestChain.itemName,
        bestChain.maxQty,
        typedMiningData,
        craftingInventory
      )
    ) {
      break;
    }

    Object.assign(inv, craftingInventory);
    inv[bestChain.itemName] = (inv[bestChain.itemName] || 0) + bestChain.maxQty;

    const stepOpportunityCost = calculateOpportunityCost(
      bestChain.itemName,
      bestChain.maxQty,
      allItems
    );
    const stepProfitMargin =
      stepOpportunityCost > 0
        ? ((bestChain.finalProfit - stepOpportunityCost) /
            stepOpportunityCost) *
          100
        : 0;

    const existingStepIndex = allProductionSteps.findIndex(
      (step) => step.name === bestChain.itemName
    );
    if (existingStepIndex >= 0) {
      const existingStep = allProductionSteps[existingStepIndex];
      existingStep.quantity += bestChain.maxQty;
      existingStep.value += bestChain.finalProfit;
      existingStep.time += bestChain.maxQty * 15;
      existingStep.timeFormatted = time(existingStep.time);
    } else {
      const requirements: Array<{
        item: string;
        displayName: string;
        quantity: number;
      }> = [];
      const itemData = allItems[bestChain.itemName];
      if (itemData?.require) {
        for (const [reqItem, reqQty] of Object.entries(itemData.require)) {
          requirements.push({
            item: reqItem,
            displayName: fmt(reqItem),
            quantity: (reqQty as number) * bestChain.maxQty,
          });
        }
      }

      allProductionSteps.push({
        name: bestChain.itemName,
        displayName: fmt(bestChain.itemName),
        quantity: bestChain.maxQty,
        value: bestChain.finalProfit,
        time: bestChain.maxQty * 15,
        timeFormatted: time(bestChain.maxQty * 15),
        requirements,
        ready: false,
        opportunityCost:
          stepOpportunityCost > 0 ? stepOpportunityCost : undefined,
        profitMargin: stepOpportunityCost > 0 ? stepProfitMargin : undefined,
      });
    }

    totalProfit += bestChain.finalProfit - bestChain.opportunityCost;
    totalTime += bestChain.maxQty * 15;

    const hasValuableMaterials = Object.entries(inv).some(([item, qty]) => {
      const itemData = allItems[item];
      return (
        itemData &&
        (itemData.price > 10 ||
          !itemData.require ||
          Object.keys(itemData.require).length === 0) &&
        qty > 0
      );
    });

    if (!hasValuableMaterials && bestScore < 0.01) break;
  }

  for (const step of allProductionSteps) {
    const chain = calculateDependencyChain(
      step.name,
      step.quantity,
      typedMiningData
    );
    for (const subStep of chain.productionSteps) {
      const existingIndex = allProductionSteps.findIndex(
        (s) => s.name === subStep.itemName
      );
      if (existingIndex < 0) {
        const subItemData = allItems[subStep.itemName];
        const profit = subItemData?.price
          ? subItemData.price * subStep.quantity
          : 0;
        const oppCost = calculateOpportunityCost(
          subStep.itemName,
          subStep.quantity,
          allItems
        );
        const margin = oppCost > 0 ? ((profit - oppCost) / oppCost) * 100 : 0;

        const requirements = subStep.requirements.map((req) => ({
          item: req.item,
          displayName: fmt(req.item),
          quantity: req.quantity,
        }));

        allProductionSteps.push({
          name: subStep.itemName,
          displayName: fmt(subStep.itemName),
          quantity: subStep.quantity,
          value: profit,
          time: subStep.time,
          timeFormatted: time(subStep.time),
          requirements,
          ready: false,
          opportunityCost: oppCost > 0 ? oppCost : undefined,
          profitMargin: margin > 0 ? margin : undefined,
        });
      }
    }
  }

  const productionSteps = allProductionSteps
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((step, index) => ({ ...step, step: index + 1 }));

  const sellableItems: SellableItem[] = Object.entries(inv)
    .filter(([, qty]) => qty > 0)
    .map(([itemName, qty]) => {
      const itemData = allItems[itemName];
      const price = itemData?.price || 0;
      return {
        name: fmt(itemName),
        quantity: qty,
        price,
        value: price * qty,
      };
    })
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const totalSellValue = sellableItems.reduce(
    (sum, item) => sum + item.value,
    0
  );

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
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during optimization.",
      },
      { status: 500 }
    );
  }
}
