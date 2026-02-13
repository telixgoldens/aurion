import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { getCreditManager } from "../lib/contracts";
import CreditPoolAbi from "../abi/CreditPool.json";
import ERC20 from "../abi/ERC20.json";
import { fromUnits } from "../utils/format";

function formatUsd(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function usePoolsData() {
  const { isConnected } = useAccount();

  const [state, setState] = useState({
    loading: false,
    pools: [],
    tvlUsd: "—",
  });

  const enabled = useMemo(() => Boolean(isConnected && window.ethereum), [isConnected]);

  const fetchPools = useCallback(async () => {
    if (!enabled) return;

    setState((s) => ({ ...s, loading: true }));

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      // 1) resolve pool address from manager
      const manager = getCreditManager(provider);
      const poolAddress = await manager.pool();

      if (!poolAddress || poolAddress === ethers.ZeroAddress) {
        setState({ loading: false, pools: [], tvlUsd: "—" });
        return;
      }

      // 2) load pool + usdc
      const pool = new ethers.Contract(poolAddress, CreditPoolAbi.abi, provider);
      const usdcAddress = await pool.USDC();

      const usdc = new ethers.Contract(usdcAddress, ERC20.abi, provider);
      const [symbol, name, decimals, totalDeposits, totalDelegated, availableLiquidity] =
        await Promise.allSettled([
          usdc.symbol(),
          usdc.name(),
          usdc.decimals(),
          pool.totalDeposits(),
          pool.totalDelegated(),
          pool.availableLiquidity(),
        ]);

      const dec = decimals.status === "fulfilled" ? Number(decimals.value) : 6;

      const totalDep = totalDeposits.status === "fulfilled" ? totalDeposits.value : 0n;
      const totalDel = totalDelegated.status === "fulfilled" ? totalDelegated.value : 0n;
      const avail = availableLiquidity.status === "fulfilled" ? availableLiquidity.value : 0n;

      const totalDepNum = fromUnits(totalDep, dec);
      const totalDelNum = fromUnits(totalDel, dec);
      const availNum = fromUnits(avail, dec);

      // utilization = delegated / deposits (simple proxy)
      const utilizationValue = totalDepNum > 0 ? (totalDelNum / totalDepNum) * 100 : 0;

      // NOTE: APR + insuranceCoverage are NOT in your ABIs.
      // So we surface placeholders until contract exposes them.
      const row = {
        asset: symbol.status === "fulfilled" ? symbol.value : "USDC",
        name: name.status === "fulfilled" ? name.value : "—",
        totalLiquidity: formatUsd(totalDepNum),
        utilization: `${utilizationValue.toFixed(1)}%`,
        apr: "—",
        insuranceCoverage: "—",
        utilizationValue,
        // optional raw numbers if you want
        raw: { totalDepNum, totalDelNum, availNum, poolAddress, usdcAddress },
      };

      setState({
        loading: false,
        pools: [row],
        tvlUsd: formatUsd(totalDepNum),
      });
    } catch (e) {
      console.error("usePoolsData failed:", e);
      setState({ loading: false, pools: [], tvlUsd: "—" });
    }
  }, [enabled]);

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  return { ...state, refetch: fetchPools };
}
