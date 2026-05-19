import { inventory } from "./inventory.js";
import { orders } from "./orders.js";
import { accessories } from "./accessories.js";

function calculateOccupiedDates(performanceDate, nDays) {
  const performance = new Date(performanceDate);

  const start = new Date(performance);
  start.setDate(start.getDate() - nDays);

  const end = new Date(performance);
  end.setDate(end.getDate() + nDays);

  return {
    start,
    end
  };
}

orders.forEach(order => {
  const occupied = calculateOccupiedDates(
    order.performanceDate,
    order.nDays
  );

  console.log("訂單:", order.id);

  console.log(
    "占用區間:",
    occupied.start.toLocaleDateString(),
    "~",
    occupied.end.toLocaleDateString()
  );
});

function isDateConflict(orderA, orderB) {
  const rangeA = calculateOccupiedDates(orderA.performanceDate, orderA.nDays);
  const rangeB = calculateOccupiedDates(orderB.performanceDate, orderB.nDays);

  return (
    rangeA.start <= rangeB.end &&
    rangeA.end >= rangeB.start
  );
}

const newOrder = {
  id: 102,
  customer: "台南民族舞團",
  performanceDate: "2026-08-21",
  nDays: 3,
  items: [
    {
      costumeId: 1,
      size: "M",
      quantity: 4
    }
  ]
};

orders.forEach(order => {
  const conflict = isDateConflict(order, newOrder);

  console.log(
    `訂單 ${order.id} 是否衝突:`,
    conflict
  );
});

function calculateRemainingStock(costumeId, size, targetOrder) {
  const costume = inventory.find(c => c.id === costumeId);
  const totalStock = costume ? (costume.sizes[size] ?? 0) : 0;

  let usedStock = 0;

  orders.forEach(order => {
    if (isDateConflict(order, targetOrder)) {
      order.items.forEach(item => {
        if (item.costumeId === costumeId && item.size === size) {
          usedStock += item.quantity;
        }
      });
    }
  });

  return {
    totalStock,
    usedStock,
    remaining: totalStock - usedStock
  };
}

const stockResult = calculateRemainingStock(
  1,
  "M",
  newOrder
);

console.log("庫存結果:", stockResult);

function checkStockAvailable(order) {
  let warnings = [];

  order.items.forEach(item => {
    const stock = calculateRemainingStock(
      item.costumeId,
      item.size,
      order
    );

    if (stock.remaining < item.quantity) {
      warnings.push({
        costumeId: item.costumeId,
        size: item.size,
        requested: item.quantity,
        remaining: stock.remaining
      });
    }
  });

  return warnings;
}

const warnings = checkStockAvailable(newOrder);

if (warnings.length > 0) {
  console.log("⚠️ 庫存不足");
  console.log(warnings);
} else {
  console.log("✅ 庫存足夠");
}

function calculateAccessoryUsage(accessoryId, targetOrder) {
  let used = 0;

  orders.forEach(order => {
    if (isDateConflict(order, targetOrder)) {
      order.items.forEach(item => {
        const costume = inventory.find(c => c.id === item.costumeId);

        if (costume && costume.sharedAccessories.includes(accessoryId)) {
          used += item.quantity;
        }
      });
    }
  });

  const accessory = accessories.find(a => a.id === accessoryId);

  return {
    name: accessory?.name,
    total: accessory?.totalStock ?? 0,
    used,
    remaining: (accessory?.totalStock ?? 0) - used
  };
}

const accessoryResult = calculateAccessoryUsage(
  1,
  newOrder
);

console.log(
  "配件庫存:",
  accessoryResult
);

function checkAccessoryAvailable(order) {
  let warnings = [];

  order.items.forEach(item => {
    const costume = inventory.find(
      c => c.id === item.costumeId
    );

    costume.sharedAccessories.forEach(
      accessoryId => {
        const result =
          calculateAccessoryUsage(
            accessoryId,
            order
          );

        if (
          result.remaining <
          item.quantity
        ) {
          warnings.push({
            accessory: result.name,
            requested: item.quantity,
            remaining: result.remaining
          });
        }
      }
    );
  });

  return warnings;
}

const accessoryWarnings =
  checkAccessoryAvailable(
    newOrder
  );

if (accessoryWarnings.length > 0) {
  console.log(
    "⚠️ 配件不足"
  );
  console.log(
    accessoryWarnings
  );
} else {
  console.log(
    "✅ 配件足夠"
  );
}
