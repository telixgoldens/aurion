import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { getCreditManager } from "../lib/contracts";
import { fromUnits } from "../utils/format";

export function useDashboard() {
  const { address, isConnected } = useAccount();
  const [data, setData] = useState({
    debt: 0,
    limit: 0,
    available: 0,
    healthFactor: 0
  });

  const fetchData = useCallback(async () => {
    if (!isConnected || !address || !window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const manager = getCreditManager(provider);
      const [debt, limit, health] = await Promise.all([
        manager.totalDebt(address),
        manager.creditLimit(address),
        manager.healthFactor(address) 
      ]);
      const available = limit - debt;

      setData({
        debt: fromUnits(debt, 6), 
        limit: fromUnits(limit, 6),
        available: fromUnits(available, 6),
        healthFactor: fromUnits(health, 18)
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