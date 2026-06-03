import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { getBrowserProvider, getSigner } from "../lib/eth";
import { getUSDC, getCreditRouter, addresses } from "../lib/contracts";

async function syncCollateral(isAave, pool, signer) {
  try {
    const router = getCreditRouter(signer);
    const user = await signer.getAddress();
    const poolAddress = await pool.getAddress();
    let tx;
    if (isAave) {
      tx = await router.syncAaveCollateral(poolAddress, user);
    } else {
      tx = await router.syncCompoundCollateral(poolAddress, user);
    }
    await tx.wait();
  } catch (e) {
    console.warn("syncCollateral failed (non-fatal):", e?.shortMessage || e?.message);
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
  address: "",
  supplyApy: null,
  borrowApy: null,
  healthFactor: null,
  cTokenBalance: null,
  exchangeRate: null,
  collateralFactor: null,
};

export function useMarketPool(getPoolContract) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(defaultStats);

  // Detect whether this is an Aave or Compound pool by checking for ASSET()
  // getMockAavePool returns a contract with ASSET(); MockCToken has UNDERLYING()
  const getPoolMeta = async (provider) => {
    const pool = getPoolContract(provider);
    let isAave = false;
    try {
      await pool.ASSET();
      isAave = true;
    } catch {
      isAave = false;
    }
    return { pool, isAave };
  };

  const fetchData = useCallback(async () => {
    if (!window.ethereum) return;

    const provider = await getBrowserProvider();
    const signer   = await provider.getSigner();
    const user     = await signer.getAddress();

    const { pool } = await getPoolMeta(provider);
    const usdc     = getUSDC(provider);

    const safeCall = async (fn) => {
      try { return await fn(); } catch { return null; }
    };

    const [totalDeposits, totalBorrows, availableLiquidity, balance] =
      await Promise.all([
        pool.totalDeposits(),
        pool.totalBorrows(),
        pool.availableLiquidity(),
        usdc.balanceOf(user),
      ]);

    const [
      utilizationBps,
      userDeposit,
      userDebt,
      rates,
      accountData,
      snapshot,
      exchangeRate,
      cfMantissa,
    ] = await Promise.all([
      safeCall(() => pool.utilizationBps()),
      safeCall(() => pool.userDeposit(user)),
      safeCall(() => pool.userDebt(user)),
      safeCall(() => pool.getRatesFormatted()),
      safeCall(() => pool.getUserAccountData(user)),
      safeCall(() => pool.getAccountSnapshot(user)),
      safeCall(() => pool.exchangeRateStored()),
      safeCall(() => pool.collateralFactorMantissa()),
    ]);

    let supplyApy  = null;
    let borrowApy  = null;
    let utilization = utilizationBps ? Number(utilizationBps) / 100 : 0;

    if (rates) {
      borrowApy  = Number(ethers.formatUnits(rates[0], 18)) * 100;
      supplyApy  = Number(ethers.formatUnits(rates[1], 18)) * 100;
      if (!utilizationBps) utilization = Number(rates[2]) / 100;
    }

    let aaveSupplied = null, aaveDebt = null, aaveAvailable = null, healthFactor = null;
    if (accountData) {
      aaveSupplied  = Number(ethers.formatUnits(accountData[0], 6));
      aaveDebt      = Number(ethers.formatUnits(accountData[1], 6));
      aaveAvailable = Number(ethers.formatUnits(accountData[2], 6));
      const hfRaw   = accountData[5];
      healthFactor  = hfRaw === ethers.MaxUint256
        ? Infinity
        : Number(ethers.formatUnits(hfRaw, 18));
    }

    let cTokenBalance = null, compDebt = null, compSupplied = null;
    let compAvailable = null, exRate = null, cf = null;
    if (snapshot) {
      cTokenBalance = Number(ethers.formatUnits(snapshot[1], 8));
      compDebt      = Number(ethers.formatUnits(snapshot[2], 6));
      exRate        = Number(ethers.formatUnits(snapshot[3], 18));
      compSupplied  = cTokenBalance * exRate;
      if (cfMantissa) {
        cf = Number(ethers.formatUnits(cfMantissa, 18)) * 100;
        const maxBorrow = compSupplied * (cf / 100);
        compAvailable   = Math.max(0, maxBorrow - compDebt);
        healthFactor    = compDebt === 0
          ? Infinity
          : (compSupplied * (cf / 100)) / compDebt;
      }
    }
    if (exchangeRate && !exRate) {
      exRate = Number(ethers.formatUnits(exchangeRate, 18));
    }

    const fmt6 = (v) => (v != null ? Number(ethers.formatUnits(v, 6)) : 0);
    const poolAddress = await pool.getAddress();

    setStats({
      totalDeposits:      Number(ethers.formatUnits(totalDeposits, 6)),
      totalBorrows:       Number(ethers.formatUnits(totalBorrows, 6)),
      availableLiquidity: aaveAvailable ?? compAvailable ?? Number(ethers.formatUnits(availableLiquidity, 6)),
      utilization,
      userDeposit:        aaveSupplied ?? compSupplied ?? fmt6(userDeposit),
      userDebt:           aaveDebt     ?? compDebt     ?? fmt6(userDebt),
      usdcBalance:        Number(ethers.formatUnits(balance, 6)),
      address:            poolAddress,
      supplyApy,
      borrowApy,
      healthFactor,
      cTokenBalance,
      exchangeRate:       exRate,
      collateralFactor:   cf ? cf.toFixed(0) : null,
    });
  }, [getPoolContract]);

  const deposit = async (amount) => {
    setLoading(true);
    try {
      const signer          = await getSigner();
      const provider        = await getBrowserProvider();
      const { pool, isAave } = await getPoolMeta(provider);
      const poolWithSigner  = getPoolContract(signer);
      const usdc            = getUSDC(signer);
      const poolAddress     = await poolWithSigner.getAddress();
      const amountWei       = ethers.parseUnits(amount.toString(), 6);

      const approveTx = await usdc.approve(poolAddress, amountWei);
      await approveTx.wait();

      let tx;
      if (isAave) {
        const user  = await signer.getAddress();
        const asset = await poolWithSigner.ASSET();
        tx = await poolWithSigner.supply(asset, amountWei, user, 0);
      } else {
        tx = await poolWithSigner.mint(amountWei);
      }
      await tx.wait();
      await syncCollateral(isAave, poolWithSigner, signer);
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async (amount) => {
    setLoading(true);
    try {
      const signer           = await getSigner();
      const provider         = await getBrowserProvider();
      const { pool, isAave } = await getPoolMeta(provider);
      const poolWithSigner   = getPoolContract(signer);
      const amountWei        = ethers.parseUnits(amount.toString(), 6);

      let tx;
      if (isAave) {
        const user  = await signer.getAddress();
        const asset = await poolWithSigner.ASSET();
        tx = await poolWithSigner.withdraw(asset, amountWei, user);
      } else {
        tx = await poolWithSigner.redeemUnderlying(amountWei);
      }
      await tx.wait();
      await syncCollateral(isAave, poolWithSigner, signer);
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  const borrow = async (amount) => {
    setLoading(true);
    try {
      const signer           = await getSigner();
      const provider         = await getBrowserProvider();
      const { pool, isAave } = await getPoolMeta(provider);
      const poolWithSigner   = getPoolContract(signer);
      const amountWei        = ethers.parseUnits(amount.toString(), 6);

      let tx;
      if (isAave) {
        // Aave borrow MUST go through CreditRouter so credit limit is validated
        // and Stylus recordBorrow is called
        const router    = getCreditRouter(signer);
        const user      = await signer.getAddress();
        const asset     = await poolWithSigner.ASSET();
        const poolAddr  = await poolWithSigner.getAddress();

        // Find the AaveAdapter address from the router's known adapter
        // Router.borrowFromAave(adapter, asset, amount)
        const aaveAdapterAddr = addresses.AAVE_ADAPTER;
        tx = await router.borrowFromAave(aaveAdapterAddr, asset, amountWei);
      } else {
        // Compound borrow through CreditRouter
        const router          = getCreditRouter(signer);
        const compAdapterAddr = addresses.COMPOUND_ADAPTER;
        tx = await router.borrowFromCompound(compAdapterAddr, amountWei);
      }
      await tx.wait();
      await syncCollateral(isAave, poolWithSigner, signer);
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  const repay = async (amount) => {
    setLoading(true);
    try {
      const signer           = await getSigner();
      const provider         = await getBrowserProvider();
      const { pool, isAave } = await getPoolMeta(provider);
      const poolWithSigner   = getPoolContract(signer);
      const usdc             = getUSDC(signer);
      const amountWei        = ethers.parseUnits(amount.toString(), 6);

      if (isAave) {
        // Repay through CreditRouter so Stylus recordRepayment is called
        const router          = getCreditRouter(signer);
        const asset           = await poolWithSigner.ASSET();
        const aaveAdapterAddr = addresses.AAVE_ADAPTER;

        const approveTx = await usdc.approve(aaveAdapterAddr, amountWei);
        await approveTx.wait();

        tx = await router.repayToAave(aaveAdapterAddr, asset, amountWei);
      } else {
        const router          = getCreditRouter(signer);
        const compAdapterAddr = addresses.COMPOUND_ADAPTER;
        const poolAddress     = await poolWithSigner.getAddress();

        const approveTx = await usdc.approve(compAdapterAddr, amountWei);
        await approveTx.wait();

        const assetAddr = await poolWithSigner.underlying();
        tx = await router.repayToCompound(compAdapterAddr, assetAddr, amountWei);
      }
      await tx.wait();
      await syncCollateral(isAave, poolWithSigner, signer);
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  const faucet = async (amount = "10000") => {
    setLoading(true);
    try {
      const signer = await getSigner();
      const pool   = getPoolContract(signer);
      const user   = await signer.getAddress();
      const tx     = await pool.faucet(user, ethers.parseUnits(amount, 6));
      await tx.wait();
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stats, loading, deposit, withdraw, borrow, repay, faucet, refetch: fetchData };
}