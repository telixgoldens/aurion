import { ethers } from "ethers";
import CreditPool from "../abi/CreditPool.json";
import CreditRouter from "../abi/CreditRouter.json";
import CreditManager from "../abi/CreditManager.json";
import InsurancePool from "../abi/InsurancePool.json";
import TokenFaucet from "../abi/TokenFaucet.json";
import ERC20 from "../abi/ERC20.json";

const mustGetEnv = (key) => {
  const v = import.meta.env[key];
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
};

const getContract = (address, abi, providerOrSigner) => {
  if (!ethers.isAddress(address)) throw new Error(`Invalid contract address: ${address}`);
  return new ethers.Contract(address, abi, providerOrSigner);
};

// --- Core protocol contracts (Arbitrum Sepolia) ---
export const addresses = {
  USDC: mustGetEnv("VITE_USDC"),
  FAUCET: mustGetEnv("VITE_FAUCET"),
  CREDIT_ROUTER: mustGetEnv("VITE_CREDIT_ROUTER"),
  CREDIT_MANAGER: mustGetEnv("VITE_CREDIT_MANAGER"),
  INSURANCE_POOL: mustGetEnv("VITE_INSURANCE_POOL"),
};

export const getCreditPool = async (providerOrSigner) => {
  const manager = getCreditManager(providerOrSigner);
  const poolAddress = await manager.pool();
  return getContract(poolAddress, CreditPool.abi, providerOrSigner);
};

export const getCreditRouter = (providerOrSigner) =>
  getContract(addresses.CREDIT_ROUTER, CreditRouter.abi, providerOrSigner);

export const getCreditManager = (providerOrSigner) =>
  getContract(addresses.CREDIT_MANAGER, CreditManager.abi, providerOrSigner);

export const getInsurancePool = (providerOrSigner) =>
  getContract(addresses.INSURANCE_POOL, InsurancePool.abi, providerOrSigner);

export const getUSDC = (providerOrSigner) =>
  getContract(addresses.USDC, ERC20.abi, providerOrSigner);

export const getFaucet = (providerOrSigner) =>
  getContract(addresses.FAUCET, TokenFaucet.abi, providerOrSigner);

// Generic ERC20 by address (if you add more assets later)
export const getToken = (address, providerOrSigner) =>
  getContract(address, ERC20.abi, providerOrSigner);

// --- UI helper functions ---
export const readUSDCBalance = async (provider, user) => {
  const usdc = getUSDC(provider);
  const [bal, decimals, symbol] = await Promise.all([
    usdc.balanceOf(user),
    usdc.decimals(),
    usdc.symbol(),
  ]);
  return { bal, decimals: Number(decimals), symbol };
};

export const claimFaucet = async (signer) => {
  const faucet = getFaucet(signer);
  const tx = await faucet.claim();
  return tx.wait();
};

export const approveUSDC = async (signer, spender, amount) => {
  const usdc = getUSDC(signer);
  const tx = await usdc.approve(spender, amount);
  return tx.wait();
};

export const depositInsurance = async (signer, amount) => {
  const pool = getInsurancePool(signer);
  const tx = await pool.deposit(amount);
  return tx.wait();
};
