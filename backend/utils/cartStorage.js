// Simple in-memory cart storage
// In production, use Redis or database
let carts = {};

const getCart = (userId) => {
  return carts[userId] || { items: [], total: 0 };
};

const setCart = (userId, cart) => {
  carts[userId] = cart;
};

const clearCart = (userId) => {
  carts[userId] = { items: [], total: 0 };
};

const deleteCart = (userId) => {
  delete carts[userId];
};

module.exports = {
  getCart,
  setCart,
  clearCart,
  deleteCart
};


