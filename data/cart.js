export function getCart() {
  const cart = localStorage.getItem("cart");
  return cart ? JSON.parse(cart) : [];
}

export function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function addToCart(item, { maxQuantity } = {}) {
  let qty = item.quantity ?? 1;
  if (maxQuantity != null && maxQuantity >= 0) {
    qty = Math.min(qty, maxQuantity);
  }
  if (qty < 1) {
    throw new Error("quantity exceeds stock");
  }
  const cart = getCart();
  cart.push({ ...item, quantity: qty });
  saveCart(cart);
}
