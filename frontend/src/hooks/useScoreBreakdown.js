import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { getBrowserProvider } from "../lib/eth";
import { getCreditManager } from "../lib/contracts";

export function useScoreBreakdown(creditManagerAddress) {
  const { address, isConnected } = useAccount();
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!isConnected || !address || !window.ethereum) return;
    setLoading(true);
    try {
      const provider = await getBrowserProvider();
      const manager = getCreditManager(provider);

      const result = await manager.creditScoreBreakdown(address);

      setBreakdown({
        ageScore:           Number(result.ageScore),
        healthScore:        Number(result.healthScore),
        repayScore:         Number(result.repayScore),
        delegatedScore:     Number(result.delegatedScore),
        diversityScore:     Number(result.diversityScore),
        volatilityPenalty:  Number(result.volatilityPenalty),
        utilizationPenalty: Number(result.utilizationPenalty),
        liquidationPenalty: Number(result.liquidationPenalty),
      });
    } catch (e) {
      setBreakdown(null);
    } finally {
      setLoading(false);
    }
  }, [address, isConnected, creditManagerAddress]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { breakdown, loading, refetch: fetch };
}