const STORAGE_KEY = "activeOrders";

function loadFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export let activeOrders = loadFromStorage();

export function saveActiveOrders() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activeOrders));
}

export function addActiveOrder(order) {
  activeOrders.push(order);
  saveActiveOrders();
}
