import { ethers } from "ethers";

export const formatCurrency = (value, decimals = 2) => {
  if (!value) return "$0.00";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

export const formatPercentage = (value) => {
  if (!value) return "0.00%";
  return `${Number(value).toFixed(2)}%`;
};

export const formatAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const toUnits = (amount, decimals = 18) => ethers.parseUnits(amount.toString(), decimals);
export const fromUnits = (amount, decimals = 18) => parseFloat(ethers.formatUnits(amount, decimals));