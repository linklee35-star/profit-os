import type { CategoryTemplate, ProfitInput } from "./types";

export const DEFAULT_CATEGORY: CategoryTemplate = {
  id: "default",
  name: "通用基准",
  desc: "保留当前测算参数",
};

export const CATEGORY_GROUPS: { name: string; templates: CategoryTemplate[] }[] = [
  {
    name: "户外运动",
    templates: [
      { id: "outdoor_light", name: "户外轻小件", desc: "登山扣、收纳袋、绑带", sample: { weightGrams: 180, packagingCost: 1 } },
      { id: "outdoor_camping", name: "露营装备", desc: "野餐垫、折叠收纳箱", sample: { weightGrams: 1500, packagingCost: 4 } },
      { id: "outdoor_garden", name: "园艺与庭院", desc: "修枝剪、小型浇灌套装", sample: { weightGrams: 750, packagingCost: 3 } },
      { id: "outdoor_fitness", name: "运动健身配件", desc: "弹力带、跳绳、护具", sample: { weightGrams: 450, packagingCost: 2 } },
    ],
  },
  {
    name: "家居日用",
    templates: [
      { id: "home_organizer", name: "家居收纳", desc: "收纳盒、抽屉分隔件", sample: { weightGrams: 650, packagingCost: 2.5 } },
      { id: "home_kitchen", name: "厨房餐具", desc: "餐具套装、玻璃杯、厨房小工具", sample: { weightGrams: 700, packagingCost: 4 } },
      { id: "home_textile", name: "家纺软装", desc: "抱枕套、桌布、小地垫", sample: { weightGrams: 500, packagingCost: 1.5 } },
    ],
  },
  {
    name: "服饰配件",
    templates: [
      { id: "fashion_apparel", name: "服装 / 软配件", desc: "T 恤、帽子、围巾", sample: { weightGrams: 320, packagingCost: 1.5 } },
      { id: "fashion_bags", name: "鞋包 / 箱包", desc: "单肩包、小背包、轻便鞋", sample: { weightGrams: 850, packagingCost: 3 } },
    ],
  },
  {
    name: "数码电子",
    templates: [
      { id: "electronics_accessory", name: "数码配件", desc: "手机壳、支架、数据线", sample: { weightGrams: 150, packagingCost: 1.5 } },
      { id: "electronics_device", name: "小型电子设备", desc: "耳机、补光灯、便携风扇", sample: { weightGrams: 420, packagingCost: 3 } },
    ],
  },
  {
    name: "美妆个护",
    templates: [
      { id: "beauty_tools", name: "美妆工具", desc: "化妆刷、粉扑、美甲工具", sample: { weightGrams: 180, packagingCost: 1.5 } },
      { id: "beauty_care", name: "个护消耗品", desc: "洗护小套装、护肤小样", sample: { weightGrams: 350, packagingCost: 3 } },
    ],
  },
  {
    name: "文具玩具",
    templates: [
      { id: "stationery_craft", name: "文具 / 手工材料", desc: "贴纸、笔记本、手工材料包", sample: { weightGrams: 250, packagingCost: 1.5 } },
      { id: "toys_puzzle", name: "玩具 / 益智桌游", desc: "拼图、积木、卡牌套装", sample: { weightGrams: 600, packagingCost: 3 } },
    ],
  },
  {
    name: "宠物用品",
    templates: [
      { id: "pet_light", name: "宠物轻小件", desc: "玩具、牵引绳、项圈", sample: { weightGrams: 200, packagingCost: 1 } },
      { id: "pet_heavy", name: "宠物重货 / 用品", desc: "食盆、猫砂盆、小型笼具", sample: { weightGrams: 1200, packagingCost: 3 } },
      { id: "pet_consumable", name: "宠物食品 / 消耗品", desc: "零食、猫砂、湿粮", sample: { weightGrams: 1500, packagingCost: 2.5 } },
      { id: "pet_electronic", name: "宠物智能电器", desc: "饮水机、喂食器、摄像头", sample: { weightGrams: 800, packagingCost: 4 } },
    ],
  },
];

export const CATEGORIES = [DEFAULT_CATEGORY, ...CATEGORY_GROUPS.flatMap((group) => group.templates)];

export function getCategory(id: string): CategoryTemplate {
  return CATEGORIES.find((category) => category.id === id) ?? DEFAULT_CATEGORY;
}

export function applyCategory(input: ProfitInput, id: string): ProfitInput {
  const category = getCategory(id);
  return { ...input, ...category.sample, category: category.id };
}
