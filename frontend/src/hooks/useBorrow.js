import { useState } from "react";
import { ethers } from "ethers";
import { getCreditRouter, getUSDC, addresses, getCreditPool } from "../lib/contracts";
import { getSigner } from "../lib/eth";

function getRevertReason(e) {
  // Log the raw selector so we can identify which error it is
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

  // Signature matches what Borrow.jsx passes.
  // adapter/asset params are accepted for compatibility but we always use
  // the env-var addresses internally — avoids stale address bugs.
  const borrowFromAave = async (
    _aaveAdapterAddress,   // kept for Borrow.jsx compat, ignored internally
    _assetAddress,         // kept for Borrow.jsx compat, ignored internally
    amount,
    decimals = 6
  ) => {
    setLoading(true);
    try {
      const signer    = await getSigner();
      const router    = getCreditRouter(signer);
      const amountWei = ethers.parseUnits(amount.toString(), decimals);

      const tx = await router.borrowFromAave(
        addresses.AAVE_ADAPTER,   // always from env — never stale
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
    _compoundAdapterAddress,  // kept for compat
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
        const pool      = await getCreditPool(signer);    // ← await your existing async getter
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

  // protocol: "aave" | "compound"
  const repay = async (amount, protocol = "aave", decimals = 6) => {
    setLoading(true);
    try {
      const signer    = await getSigner();
      const router    = getCreditRouter(signer);
      const usdc      = getUSDC(signer);
      const amountWei = ethers.parseUnits(amount.toString(), decimals);

      // CreditRouter.repayToAave/Compound both pull via safeTransferFrom(user→adapter)
      // so the user must approve CreditRouter, not the adapter
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