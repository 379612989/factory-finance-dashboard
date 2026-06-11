import {
  BusinessData,
  CHANNELS,
  Customer,
  EXPENSE_TYPES,
  Expense,
  Product,
  SalesOrder,
} from "./types";

const now = "2026-06-11T00:00:00.000Z";

const uuid = (prefix: number, index: number) =>
  `00000000-0000-4000-8000-${String(prefix + index).padStart(12, "0")}`;

export const products: Product[] = [
  {
    id: uuid(1000, 1),
    product_code: "P-001",
    product_name: "鸡精 A 1kg 家庭装",
    category: "鸡精",
    unit: "袋",
    standard_price: 18.8,
    unit_cost: 13.9,
    status: "启用",
    remark: "走量产品，销量最高，利润率中等",
    created_at: now,
    updated_at: now,
  },
  {
    id: uuid(1000, 2),
    product_code: "P-002",
    product_name: "鸡精 B 餐饮高鲜装",
    category: "鸡精",
    unit: "袋",
    standard_price: 26.8,
    unit_cost: 15.2,
    status: "启用",
    remark: "餐饮渠道主推，高毛利",
    created_at: now,
    updated_at: now,
  },
  {
    id: uuid(1000, 3),
    product_code: "P-003",
    product_name: "味精 C 25kg 工业装",
    category: "味精",
    unit: "袋",
    standard_price: 168,
    unit_cost: 151,
    status: "启用",
    remark: "销量大但利润薄",
    created_at: now,
    updated_at: now,
  },
  {
    id: uuid(1000, 4),
    product_code: "P-004",
    product_name: "鸡汁调味料 500g",
    category: "复合调味料",
    unit: "瓶",
    standard_price: 32,
    unit_cost: 18.6,
    status: "启用",
    remark: "餐饮复购稳定",
    created_at: now,
    updated_at: now,
  },
  {
    id: uuid(1000, 5),
    product_code: "P-005",
    product_name: "火锅鲜味粉 2kg",
    category: "调味粉",
    unit: "袋",
    standard_price: 22,
    unit_cost: 13,
    status: "启用",
    remark: "秋冬旺季明显",
    created_at: now,
    updated_at: now,
  },
  {
    id: uuid(1000, 6),
    product_code: "P-006",
    product_name: "复合调味粉 1kg",
    category: "调味粉",
    unit: "袋",
    standard_price: 19,
    unit_cost: 11.8,
    status: "启用",
    remark: "批发渠道常规款",
    created_at: now,
    updated_at: now,
  },
  {
    id: uuid(1000, 7),
    product_code: "P-007",
    product_name: "香辛料包 200g",
    category: "香辛料",
    unit: "包",
    standard_price: 12.5,
    unit_cost: 7.8,
    status: "启用",
    remark: "零售小单多",
    created_at: now,
    updated_at: now,
  },
  {
    id: uuid(1000, 8),
    product_code: "P-008",
    product_name: "代工贴牌调味包",
    category: "代工",
    unit: "箱",
    standard_price: 98,
    unit_cost: 71,
    status: "启用",
    remark: "项目制订单",
    created_at: now,
    updated_at: now,
  },
];

export const customers: Customer[] = [
  ["C-001", "杭州宏运批发部", "批发商", "杭州上城", "周敏", "13800010001", "欠款偏高"],
  ["C-002", "萧山食配中心", "批发商", "杭州萧山", "王强", "13800010002", "重点批发客户"],
  ["C-003", "余杭烟火餐饮", "餐饮客户", "杭州余杭", "陈丽", "13800010003", "连锁餐饮"],
  ["C-004", "临平好味来超市", "零售客户", "杭州临平", "刘海", "13800010004", "稳定零售"],
  ["C-005", "拱墅社区团购", "电商客户", "杭州拱墅", "孙倩", "13800010005", "电商增长快"],
  ["C-006", "西湖湖畔餐厅", "餐饮客户", "杭州西湖", "赵峰", "13800010006", "小而稳"],
  ["C-007", "滨江云厨供应链", "餐饮客户", "杭州滨江", "许宁", "13800010007", "月结客户"],
  ["C-008", "钱塘精选电商", "电商客户", "杭州钱塘", "马婷", "13800010008", "直播渠道"],
  ["C-009", "义乌餐配供应链", "批发商", "金华义乌", "吴杰", "13800010009", "跨市大客户"],
  ["C-010", "绍兴老街饭店", "餐饮客户", "绍兴越城", "罗军", "13800010010", "餐饮客户"],
  ["C-011", "嘉兴佳味商贸", "批发商", "嘉兴南湖", "黄欣", "13800010011", "批发客户"],
  ["C-012", "湖州悦选食品", "零售客户", "湖州吴兴", "沈青", "13800010012", "零售客户"],
  ["C-013", "宁波东岸商行", "批发商", "宁波鄞州", "邵波", "13800010013", "跨区客户"],
  ["C-014", "温州鲜厨餐饮", "餐饮客户", "温州鹿城", "叶晨", "13800010014", "餐饮客户"],
  ["C-015", "线上旗舰店", "电商客户", "线上", "运营组", "13800010015", "直营电商"],
].map(([code, name, type, region, contact, phone, remark], index) => ({
  id: uuid(2000, index + 1),
  customer_code: code,
  customer_name: name,
  customer_type: type,
  region,
  contact_name: contact,
  phone,
  status: "合作中",
  remark,
  created_at: now,
  updated_at: now,
}));

const months = [
  "2025-07",
  "2025-08",
  "2025-09",
  "2025-10",
  "2025-11",
  "2025-12",
  "2026-01",
  "2026-02",
  "2026-03",
  "2026-04",
  "2026-05",
  "2026-06",
];

const monthSalesFactor = [0.95, 1.12, 1.05, 1.18, 0.88, 1.25, 1.33, 0.74, 1.08, 1.16, 1.3, 1.22];

const productPlan = [
  { product: 0, baseQty: 620 },
  { product: 0, baseQty: 540 },
  { product: 1, baseQty: 260 },
  { product: 2, baseQty: 96 },
  { product: 2, baseQty: 88 },
  { product: 3, baseQty: 180 },
  { product: 4, baseQty: 240 },
  { product: 6, baseQty: 420 },
  { product: 7, baseQty: 72 },
];

const customerPattern = [0, 1, 2, 4, 8, 6, 10, 14, 7];

const riskyCustomerIds = new Set([customers[0].id, customers[1].id, customers[8].id]);

const money = (value: number) => Math.round(value * 100) / 100;

const orderDate = (month: string, monthIndex: number, orderIndex: number) => {
  const day = ((orderIndex * 3 + monthIndex * 2) % 25) + 2;
  return `${month}-${String(day).padStart(2, "0")}`;
};

export function buildDemoSalesOrders(): SalesOrder[] {
  const orders: SalesOrder[] = [];

  months.forEach((month, monthIndex) => {
    const monthFactor = monthSalesFactor[monthIndex];
    const ecommerceBoost = monthIndex >= 6 ? 1 + (monthIndex - 5) * 0.12 : 1;

    productPlan.forEach((plan, orderIndex) => {
      const product = products[plan.product];
      const customer =
        customers[(customerPattern[orderIndex] + monthIndex) % customers.length];
      const isEcommerce =
        customer.customer_type === "电商客户" || orderIndex === 7 || orderIndex === 8;
      const channel = isEcommerce
        ? "电商"
        : CHANNELS[(orderIndex + monthIndex) % (CHANNELS.length - 1)];
      const seasonBoost = product.category === "调味粉" && [3, 4, 5].includes(monthIndex) ? 1.18 : 1;
      const qty = Math.max(
        8,
        Math.round(plan.baseQty * monthFactor * seasonBoost * (isEcommerce ? ecommerceBoost : 1) * (0.9 + (orderIndex % 3) * 0.08)),
      );
      const discount =
        product.product_name.includes("味精 C") || customer.customer_type === "批发商"
          ? 0.95
          : isEcommerce
            ? 1.04
            : 1;
      const unitPrice = money(product.standard_price * discount);
      const salesAmount = money(qty * unitPrice);
      const productCost = money(qty * product.unit_cost);
      const grossProfit = money(salesAmount - productCost);
      const receivedRatio = riskyCustomerIds.has(customer.id)
        ? 0.42 + ((monthIndex + orderIndex) % 3) * 0.08
        : isEcommerce
          ? 0.9
          : 0.78 + ((monthIndex + orderIndex) % 4) * 0.06;
      const receivedAmount = money(Math.min(salesAmount, salesAmount * receivedRatio));
      const unpaidAmount = money(salesAmount - receivedAmount);

      orders.push({
        id: uuid(3000, orders.length + 1),
        order_code: `SO-${month.replace("-", "")}-${String(orderIndex + 1).padStart(3, "0")}`,
        order_date: orderDate(month, monthIndex, orderIndex),
        customer_id: customer.id,
        product_id: product.id,
        channel,
        quantity: qty,
        unit: product.unit,
        unit_price: unitPrice,
        unit_cost: product.unit_cost,
        sales_amount: salesAmount,
        product_cost: productCost,
        gross_profit: grossProfit,
        received_amount: receivedAmount,
        unpaid_amount: unpaidAmount,
        remark: isEcommerce ? "线上渠道订单" : "月度常规订单",
        created_at: now,
        updated_at: now,
      });
    });
  });

  return orders;
}

export function buildDemoExpenses(): Expense[] {
  const expenses: Expense[] = [];
  const baseAmounts: Record<string, number> = {
    原材料: 56000,
    人工: 18500,
    物流: 7600,
    房租水电: 10200,
    推广费用: 4200,
    维修: 2600,
    办公: 1800,
    其他: 1600,
  };

  months.forEach((month, monthIndex) => {
    EXPENSE_TYPES.forEach((type, typeIndex) => {
      let amount = baseAmounts[type] * (0.92 + monthIndex * 0.018 + (typeIndex % 3) * 0.035);
      if (type === "原材料") amount *= 1 + monthSalesFactor[monthIndex] * 0.18;
      if (type === "推广费用" && month === "2026-03") amount *= 3.7;
      if (type === "维修" && month === "2026-02") amount *= 4.5;
      if (type === "房租水电" && month === "2026-02") amount *= 1.45;
      if (type === "物流" && monthIndex >= 6) amount *= 1.18;

      expenses.push({
        id: uuid(5000, expenses.length + 1),
        expense_code: `EX-${month.replace("-", "")}-${String(typeIndex + 1).padStart(2, "0")}`,
        expense_date: `${month}-${String(4 + typeIndex * 3).padStart(2, "0")}`,
        expense_type: type,
        amount: money(amount),
        remark:
          type === "推广费用" && month === "2026-03"
            ? "电商投流与新品推广"
            : type === "维修" && month === "2026-02"
              ? "春节后设备检修"
              : "月度经营支出",
        created_at: now,
        updated_at: now,
      });
    });
  });

  return expenses;
}

export function buildDemoData(): BusinessData {
  return {
    products,
    customers,
    salesOrders: buildDemoSalesOrders(),
    expenses: buildDemoExpenses(),
    source: "demo",
  };
}

export const demoData = buildDemoData();
