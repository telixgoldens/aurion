import { useState } from "react";
import { ethers } from "ethers";
import { getCreditRouter, getUSDC, addresses, getCreditPool } from "../lib/contracts";
import { getSigner } from "../lib/eth";

function getRevertReason(e) {
  const raw = e?.data ?? e?.error?.data ?? e?.info?.error?.data;
  if (raw) console.error("Raw error selector:", raw.slice(0, 10));

  return (
    e?.shortMessage ||
    e?.reason ||
    e?.info?.error?.message ||
    e?.message ||
    "Transaction failed"
  );
}

export const useBorrow = () => {
  const [loading, setLoading] = useState(false);
  const borrowFromAave = async (
    _aaveAdapterAddress,   
    _assetAddress,         
    amount,
    decimals = 6
  ) => {
    setLoading(true);
    try {
      const signer    = await getSigner();
      const router    = getCreditRouter(signer);
      const amountWei = ethers.parseUnits(amount.toString(), decimals);

      const tx = await router.borrowFromAave(
        addresses.AAVE_ADAPTER,   
        addresses.USDC,
        amountWei
      );
      await tx.wait();
      return tx;
    } catch (e) {
      console.error("Borrow failed:", getRevertReason(e));
      throw new Error(getRevertReason(e));
    } finally {
      setLoading(false);
    }
  };

  const borrowFromCompound = async (
    _compoundAdapterAddress,  
    amount,
    decimals = 6
  ) => {
    setLoading(true);
    try {
      const signer    = await getSigner();
      const router    = getCreditRouter(signer);
      const amountWei = ethers.parseUnits(amount.toString(), decimals);

      const tx = await router.borrowFromCompound(
        addresses.COMPOUND_ADAPTER,
        amountWei
      );
      await tx.wait();
      return tx;
    } catch (e) {
      console.error("Borrow failed:", getRevertReason(e));
      throw new Error(getRevertReason(e));
    } finally {
      setLoading(false);
    }
  };

  const repayToPool = async (amount, decimals = 6) => {
    setLoading(true);
    try {
        const signer    = await getSigner();
        const usdc      = getUSDC(signer);
        const pool      = await getCreditPool(signer);    
        const amountWei = ethers.parseUnits(amount.toString(), decimals);

        const approveTx = await usdc.approve(await pool.getAddress(), amountWei);
        await approveTx.wait();

        const tx = await pool.repay(amountWei);
        await tx.wait();
        return tx;
    } catch (e) {
        console.error("Repay to pool failed:", getRevertReason(e));
        throw new Error(getRevertReason(e));
    } finally {
        setLoading(false);
    }
};

  const repay = async (amount, protocol = "aave", decimals = 6) => {
    setLoading(true);
    try {
      const signer    = await getSigner();
      const router    = getCreditRouter(signer);
      const usdc      = getUSDC(signer);
      const amountWei = ethers.parseUnits(amount.toString(), decimals);
      const approveTx = await usdc.approve(await router.getAddress(), amountWei);
      await approveTx.wait();

      const tx = protocol === "aave"
        ? await router.repayToAave(addresses.AAVE_ADAPTER, addresses.USDC, amountWei)
        : await router.repayToCompound(addresses.COMPOUND_ADAPTER, addresses.USDC, amountWei);

      await tx.wait();
      return tx;
    } catch (e) {
      console.error("Repay failed:", getRevertReason(e));
      throw new Error(getRevertReason(e));
    } finally {
      setLoading(false);
    }
  };

  return { borrowFromAave, borrowFromCompound, repay, repayToPool, loading };
};