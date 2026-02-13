import { useState } from "react";
import { ethers } from "ethers";
import { getCreditPool, getToken } from "../lib/contracts";
import { getSigner } from "../lib/eth";

export const useCreditPool = () => {
  const [loading, setLoading] = useState(false);

  const deposit = async (amount, decimals = 6) => {
    setLoading(true);
    try {
      const signer = await getSigner();
      const pool = await getCreditPool(signer);
      const usdcAddress = await pool.USDC();
      const token = getToken(usdcAddress, signer);
      const amountWei = ethers.parseUnits(amount.toString(), decimals);
      const approveTx = await token.approve(await pool.getAddress(), amountWei);
      await approveTx.wait();

      const tx = await pool.deposit(amountWei);
      await tx.wait();

      return tx;
    } finally {
      setLoading(false);
    }
  };

  const delegateCredit = async (user, amount, decimals = 6) => {
    setLoading(true);
    try {
      const signer = await getSigner();
      const pool = await getCreditPool(signer);
      const amountWei = ethers.parseUnits(amount.toString(), decimals);
      const tx = await pool.delegateCredit(user, amountWei);
      await tx.wait();
      return tx;
    } finally {
      setLoading(false);
    }
  };

  return { deposit, delegateCredit, loading };
};
