import { useState } from "react";
import { ethers } from "ethers";
import { getCreditRouter, getToken } from "../lib/contracts";
import { getSigner } from "../lib/eth";

function getRevertReason(e) {
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

  const borrowFromAave = async (aavePoolAddress, assetAddress, amount, decimals = 6) => {
    setLoading(true);
    try {
      const signer = await getSigner();
      const router = getCreditRouter(signer);

      const tx = await router.borrowFromAave(
        aavePoolAddress,
        assetAddress,
        ethers.parseUnits(amount.toString(), decimals)
      );
      await tx.wait();
      return tx;
    } catch (e) {
      console.error("Borrow failed:", e);
      throw new Error(getRevertReason(e));
    } finally {
      setLoading(false);
    }
  };

  const borrowFromCompound = async (compoundAddress, assetAddress, amount, decimals = 6) => {
    setLoading(true);
    try {
      const signer = await getSigner();
      const router = getCreditRouter(signer);

      const tx = await router.borrowFromCompound(
        compoundAddress,
        assetAddress,
        ethers.parseUnits(amount.toString(), decimals)
      );
      await tx.wait();
      return tx;
    } catch (e) {
      console.error("Borrow failed:", e);
      throw new Error(getRevertReason(e));
    } finally {
      setLoading(false);
    }
  };

  const repay = async (assetAddress, amount, decimals = 6) => {
    setLoading(true);
    try {
      const signer = await getSigner();
      const router = getCreditRouter(signer);

      const token = getToken(assetAddress, signer);
      const amountWei = ethers.parseUnits(amount.toString(), decimals);

      const approveTx = await token.approve(await router.getAddress(), amountWei);
      await approveTx.wait();

      const tx = await router.repay(assetAddress, amountWei);
      await tx.wait();
      return tx;
    } catch (e) {
      console.error("Repay failed:", e);
      throw new Error(getRevertReason(e));
    } finally {
      setLoading(false);
    }
  };

  return { borrowFromAave, borrowFromCompound, repay, loading };
};
