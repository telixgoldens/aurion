import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { getBrowserProvider, getSigner } from "../lib/eth";
import { getUSDC, getCreditRouter, getCreditManager, addresses } from "../lib/contracts";

// Maps 4-byte selectors to human-readable messages.
// Run: cast sig "ErrorName()" to get the selector for any error in Errors.sol
const ERROR_SELECTORS = {
  "0x8ac4bc73": "InsufficientCredit — your collateral hasn't been synced to CreditManager yet. Try depositing first, then clicking 'Sync Collateral'.",
  "0x8baa579f": "NotAuthorized — CreditRouter address mismatch in CreditManager. Redeploy and update .env.",
  "0x82b42900": "NotAuthorized (variant) — same as above.",
  "0xf4d678b8": "InsufficientBalance",
  // Add more as you discover them from cast sig output
};

function decodeError(e) {
  // ethers v6 bubbles the raw revert data in e.data
  const raw = e?.data ?? e?.error?.data ?? "";
  const selector = typeof raw === "string" ? raw.slice(0, 10) : "";
  if (selector && ERROR_SELECTORS[selector]) return ERROR_SELECTORS[selector];
  return e?.shortMessage ?? e?.reason ?? e?.message ?? "Unknown error";
}

async function syncCollateral(isAave, pool, signer) {
  try {
    const router = getCreditRouter(signer);
    const user = await signer.getAddress();
    const poolAddress = await pool.getAddress();

    const tx = isAave
      ? await router.syncAaveCollateral(poolAddress, user)
      : await router.syncCompoundCollateral(poolAddress, user);

    await tx.wait();
    return { ok: true };
  } catch (e) {
    const msg = decodeError(e);
    console.warn("syncCollateral failed:", msg);
    return { ok: false, msg };
  }
}

const defaultStats = {
  totalDeposits: 0,
  totalBorrows: 0,
  availableLiquidity: 0,
  utilization: 0,
  userDeposit: 0,
  userDebt: 0,
  usdcBalance: 0,
  collateral: 0,      // what CreditManager actually sees
  creditLimit: 0,     // collateral + delegated
  address: "",
};

export function useMarketPool(getPoolContract, isAave) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats]     = useState(defaultStats);
  const [error, setError]     = useState(null);

  const fetchData = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      const provider    = await getBrowserProvider();
      const signer      = await provider.getSigner();
      const user        = await signer.getAddress();
      const pool        = getPoolContract(provider);
      const usdc        = getUSDC(provider);
      const manager     = getCreditManager(provider);
      const poolAddress = await pool.getAddress();

      const [
        totalDeposits, totalBorrows, availLiq, utilBps,
        userDep, userDbt, balance, collateral, creditLimit,
      ] = await Promise.all([
        pool.totalDeposits(),
        pool.totalBorrows(),
        pool.availableLiquidity(),
        pool.utilizationBps().catch(() => 0n),
        pool.userDeposit(user),
        pool.userDebt(user),
        usdc.balanceOf(user),
        manager.collateralValue(user),   // what CreditManager sees
        manager.creditLimit(user),        // collateral + delegated
      ]);

      setStats({
        totalDeposits:      Number(ethers.formatUnits(totalDeposits, 6)),
        totalBorrows:       Number(ethers.formatUnits(totalBorrows, 6)),
        availableLiquidity: Number(ethers.formatUnits(availLiq, 6)),
        utilization:        Number(utilBps) / 100,
        userDeposit:        Number(ethers.formatUnits(userDep, 6)),
        userDebt:           Number(ethers.formatUnits(userDbt, 6)),
        usdcBalance:        Number(ethers.formatUnits(balance, 6)),
        collateral:         Number(ethers.formatUnits(collateral, 6)),
        creditLimit:        Number(ethers.formatUnits(creditLimit, 6)),
        address:            poolAddress,
      });
    } catch (e) {
      console.error("fetchData failed:", decodeError(e));
    }
  }, [getPoolContract, isAave]);

  const deposit = async (amount) => {
    setLoading(true);
    setError(null);
    try {
      const signer      = await getSigner();
      const pool        = getPoolContract(signer);
      const usdc        = getUSDC(signer);
      const poolAddress = await pool.getAddress();
      const amountWei   = ethers.parseUnits(amount.toString(), 6);

      const approveTx = await usdc.approve(poolAddress, amountWei);
      await approveTx.wait();

      const tx = await pool.deposit(amountWei);
      await tx.wait();

      const { ok, msg } = await syncCollateral(isAave, pool, signer);
      if (!ok) {
        setError(`Deposit succeeded but collateral sync failed: ${msg}`);
      }
      await fetchData();
    } catch (e) {
      setError(decodeError(e));
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async (amount) => {
    setLoading(true);
    setError(null);
    try {
      const signer    = await getSigner();
      const pool      = getPoolContract(signer);
      const amountWei = ethers.parseUnits(amount.toString(), 6);

      const tx = await pool.withdraw(amountWei);
      await tx.wait();

      await syncCollateral(isAave, pool, signer);
      await fetchData();
    } catch (e) {
      setError(decodeError(e));
    } finally {
      setLoading(false);
    }
  };

  const borrow = async (amount) => {
    setLoading(true);
    setError(null);
    try {
      const signer    = await getSigner();
      const pool      = getPoolContract(signer);
      const router    = getCreditRouter(signer);
      const amountWei = ethers.parseUnits(amount.toString(), 6);

      // Pre-flight: if collateral is 0, surface a clear error before sending tx
      if (stats.collateral === 0) {
        throw new Error("No collateral recorded in CreditManager. Deposit first, then sync.");
      }
      if (stats.creditLimit === 0) {
        throw new Error("Credit limit is 0. Collateral sync may have failed.");
      }

      const tx = isAave
        ? await router.borrowFromAave(addresses.AAVE_ADAPTER, addresses.USDC, amountWei)
        : await router.borrowFromCompound(addresses.COMPOUND_ADAPTER, amountWei);

      await tx.wait();
      await syncCollateral(isAave, pool, signer);
      await fetchData();
    } catch (e) {
      setError(decodeError(e));
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const repay = async (amount) => {
    setLoading(true);
    setError(null);
    try {
        const signer    = await getSigner();
        const pool      = getPoolContract(signer);
        const usdc      = getUSDC(signer);
        const router    = getCreditRouter(signer);
        const amountWei = ethers.parseUnits(amount.toString(), 6);

        // ✅ Approve CREDIT_ROUTER — it's the contract calling safeTransferFrom
        const approveTx = await usdc.approve(addresses.CREDIT_ROUTER, amountWei);
        await approveTx.wait();

        let tx;
        if (isAave) {
            tx = await router.repayToAave(
                addresses.AAVE_ADAPTER,
                addresses.USDC,
                amountWei
            );
        } else {
            tx = await router.repayToCompound(
                addresses.COMPOUND_ADAPTER,
                addresses.USDC,
                amountWei
            );
        }
        await tx.wait();

        await syncCollateral(isAave, pool, signer);
        await fetchData();
    } catch (e) {
        setError(decodeError(e));
    } finally {
        setLoading(false);
    }
};

  // Expose so UI can add a manual "Sync Collateral" button
  const manualSync = async () => {
    setLoading(true);
    setError(null);
    try {
      const signer = await getSigner();
      const pool   = getPoolContract(signer);
      const { ok, msg } = await syncCollateral(isAave, pool, signer);
      if (!ok) setError(`Sync failed: ${msg}`);
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  return { stats, loading, error, deposit, withdraw, borrow, repay, manualSync, refetch: fetchData };
}