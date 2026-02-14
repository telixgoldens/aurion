import { ethers } from "ethers";
import { getCreditPool, getERC20 } from "./contracts";

export async function depositToCreditPool({ signer, amountHuman }) {
  const pool = getCreditPool(signer);
  const user = await signer.getAddress();
  const usdcAddr = await pool.USDC();
  const usdc = getERC20(usdcAddr, signer);
  const decimals = await usdc.decimals(); 
  const amount = ethers.parseUnits(String(amountHuman), decimals);

  if (amount <= 0n) throw new Error("Amount must be greater than 0");

  const allowance = await usdc.allowance(user, await pool.getAddress());
  if (allowance < amount) {
    const approveTx = await usdc.approve(await pool.getAddress(), amount);
    await approveTx.wait();
  }

  const tx = await pool.deposit(amount);
  return tx.wait();
}
