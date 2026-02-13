import { useEffect, useState } from "react";
import { ethers } from "ethers";
import ERC20 from "../abi/ERC20.json";

export function useTokenMeta(tokenAddress, enabled = true) {
  const [meta, setMeta] = useState({ symbol: "", decimals: 18, name: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !tokenAddress || !ethers.isAddress(tokenAddress) || !window.ethereum) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const token = new ethers.Contract(tokenAddress, ERC20.abi, provider);

        const [symbol, decimals, name] = await Promise.allSettled([
          token.symbol?.(),
          token.decimals?.(),
          token.name?.(),
        ]);

        if (cancelled) return;

        setMeta({
          symbol: symbol.status === "fulfilled" ? symbol.value : "",
          decimals: decimals.status === "fulfilled" ? Number(decimals.value) : 18,
          name: name.status === "fulfilled" ? name.value : "",
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tokenAddress, enabled]);

  return { meta, loading };
}
