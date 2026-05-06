import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { getBrowserProvider, getSigner } from "../lib/eth";
import { getUSDC } from "../lib/contracts";

export function useMarketPool(getPoolContract) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalBorrows: 0,
    availableLiquidity: 0,
    utilization: 0,
    userDeposit: 0,
    userDebt: 0,
    usdcBalance: 0,
    address: "",
  });

  const fetchData = useCallback(async () => {
    if (!window.ethereum) return;

    const provider = await getBrowserProvider();
    const signer = await provider.getSigner();
    const user = await signer.getAddress();

    const pool = getPoolContract(provider);
    const usdc = getUSDC(provider);

    const [
      totalDeposits,
      totalBorrows,
      availableLiquidity,
      utilizationBps,
      userDeposit,
      userDebt,
      balance,
    ] = await Promise.all([
      pool.totalDeposits(),
      pool.totalBorrows(),
      pool.availableLiquidity(),
      pool.utilizationBps(),
      pool.userDeposit(user),
      pool.userDebt(user),
      usdc.balanceOf(user),
    ]);

    setStats({
      totalDeposits: Number(ethers.formatUnits(totalDeposits, 6)),
      totalBorrows: Number(ethers.formatUnits(totalBorrows, 6)),
      availableLiquidity: Number(ethers.formatUnits(availableLiquidity, 6)),
      utilization: Number(utilizationBps) / 100,
      userDeposit: Number(ethers.formatUnits(userDeposit, 6)),
      userDebt: Number(ethers.formatUnits(userDebt, 6)),
      usdcBalance: Number(ethers.formatUnits(balance, 6)),
      address: await pool.getAddress(),
    });
  }, [getPoolContract]);

  const deposit = async (amount) => {
    setLoading(true);
    try {
      const signer = await getSigner();
      const pool = getPoolContract(signer);
      const usdc = getUSDC(signer);

      const amountWei = ethers.parseUnits(amount.toString(), 6);

      const approveTx = await usdc.approve(await pool.getAddress(), amountWei);
      await approveTx.wait();

      const tx = await pool.deposit(amountWei);
      await tx.wait();

      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async (amount) => {
    setLoading(true);
    try {
      const signer = await getSigner();
      const pool = getPoolContract(signer);

      const amountWei = ethers.parseUnits(amount.toString(), 6);
      const tx = await pool.withdraw(amountWei);
      await tx.wait();

      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  const borrow = async (amount) => {
    setLoading(true);
    try {
      const signer = await getSigner();
      const pool = getPoolContract(signer);

      const amountWei = ethers.parseUnits(amount.toString(), 6);
      const tx = await pool.borrow(amountWei);
      await tx.wait();

      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  const repay = async (amount) => {
    setLoading(true);
    try {
      const signer = await getSigner();
      const pool = getPoolContract(signer);
      const usdc = getUSDC(signer);

      const amountWei = ethers.parseUnits(amount.toString(), 6);
      const approveTx = await usdc.approve(await pool.getAddress(), amountWei);
      await approveTx.wait();

      const tx = await pool.repay(amountWei);
      await tx.wait();

      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stats, loading, deposit, withdraw, borrow, repay, refetch: fetchData };
}