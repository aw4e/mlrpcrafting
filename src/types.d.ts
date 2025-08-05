export interface GameItem {
  price: number;
  require?: Record<string, number>;
}

export interface MiningData {
  tambang: Record<string, GameItem>;
  perhiasan: Record<string, GameItem>;
}

export interface Inventory {
  [key: string]: number;
}

export interface ProductionStep {
  itemName: string;
  quantity: number;
  requirements: Array<{
    item: string;
    quantity: number;
  }>;
  time: number;
  profit: number;
}

export interface DependencyChain {
  rawMaterials: Record<string, number>;
  productionSteps: ProductionStep[];
  totalTime: number;
  totalProfit: number;
}

export interface RequirementInfo {
  item: string;
  displayName: string;
  quantity: number;
}

export interface OptimizedStep {
  name: string;
  displayName: string;
  quantity: number;
  value: number;
  time: number;
  timeFormatted: string;
  requirements: RequirementInfo[];
  ready: boolean;
}

export interface SellableItem {
  name: string;
  quantity: number;
  price: number;
  value: number;
}

export interface OptimizationResult {
  success: boolean;
  data?: {
    summary: {
      totalProfit: number;
      totalSellValue: number;
      totalTime: number;
      totalTimeFormatted: string;
    };
    sellableItems: SellableItem[];
    productionSteps: OptimizedStep[];
  };
  error?: string;
}

export interface ApiRequest {
  inventory: Inventory;
}
