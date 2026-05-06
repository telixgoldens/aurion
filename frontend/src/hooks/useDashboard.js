import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { getCreditManager } from "../lib/contracts";
import { fromUnits } from "../utils/format";

const tierLabels = ["Restricted", "Aggressive", "Moderate", "Conservative"];

export function useDashboard() {
  const { address, isConnected } = useAccount();

  const [data, setData] = useState({
    debt: 0,
    limit: 0,
    available: 0,
    healthFactor: 0,
    creditScore: 0,
    riskTier: "Restricted",
    riskTierValue: 0,
    collateralValue: 0,
    delegatedCredit: 0,
    borrows: 0,
    repays: 0,
    liquidations: 0,
    isFrozen: false,
  });

  const fetchData = useCallback(async () => {
    if (!isConnected || !address || !window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const manager = getCreditManager(provider);

      const [
        debt,
        limit,
        health,
        score,
        tier,
        metrics,
      ] = await Promise.all([
        manager.totalDebt(address),
        manager.creditLimit(address),
        manager.healthFactor(address),
        manager.creditScore(address),
        manager.riskTier(address),
        manager.userMetrics(address),
      ]);

      const available = limit > debt ? limit - debt : 0n;

      setData({
        debt: fromUnits(debt, 6),
        limit: fromUnits(limit, 6),
        available: fromUnits(available, 6),
        healthFactor:
          health === ethers.MaxUint256 ? 999999999 : fromUnits(health, 18),

        creditScore: Number(score),
        riskTier: tierLabels[Number(tier)] ?? "Restricted",
        riskTierValue: Number(tier),

        collateralValue: fromUnits(metrics.collateral, 6),
        delegatedCredit: fromUnits(metrics.delegated, 6),

        borrows: Number(metrics.borrows),
        repays: Number(metrics.repays),
        liquidations: Number(metrics.liquidations),
        isFrozen: Boolean(metrics.isFrozen),
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  }, [address, isConnected]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, refetch: fetchData };
}