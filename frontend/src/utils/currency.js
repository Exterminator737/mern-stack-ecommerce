// Currency formatting utility for ZAR (South African Rand)
export const formatCurrency = (amount) => {
  return `R ${amount.toFixed(2)}`;
};

export const CURRENCY_SYMBOL = 'R';
export const CURRENCY_CODE = 'ZAR';

