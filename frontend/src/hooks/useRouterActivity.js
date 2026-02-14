import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { fromUnits } from "../utils/format";

const CREDIT_ROUTER_EVENTS = [
  {
    type: "event",
    name: "Liquidated",
    anonymous: false,
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: true, name: "liquidator", type: "address" },
      { indexed: true, name: "asset", type: "address" },
      { indexed: false, name: "repayAmount", type: "uint256" },
      { indexed: false, name: "seizeAmount", type: "uint256" },
      { indexed: false, name: "bonusPaid", type: "uint256" },
      { indexed: false, name: "bonusShortfall", type: "uint256" },
    ],
  },
];

function timeAgo(unixSeconds) {
  const diff = Math.max(0, Math.floor(Date.now() / 1000) - Number(unixSeconds));
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function useRouterActivity(routerAddress, { lookbackBlocks = 50_000 } = {}) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const enabled = useMemo(
    () => Boolean(isConnected && address && publicClient && routerAddress),
    [isConnected, address, publicClient, routerAddress]
  );

  const fetchActivity = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    try {
      const latestBlock = await publicClient.getBlockNumber();
      const fromBlock = latestBlock > BigInt(lookbackBlocks) ? latestBlock - BigInt(lookbackBlocks) : 0n;
      const [asUser, asLiquidator] = await Promise.all([
        publicClient.getLogs({
          address: routerAddress,
          event: CREDIT_ROUTER_EVENTS[0],
          args: { user: address },
          fromBlock,
          toBlock: latestBlock,
        }),
        publicClient.getLogs({
          address: routerAddress,
          event: CREDIT_ROUTER_EVENTS[0],
          args: { liquidator: address },
          fromBlock,
          toBlock: latestBlock,
        }),
      ]);

      const merged = [...asUser, ...asLiquidator];
      merged.sort((a, b) => Number(b.blockNumber - a.blockNumber));
      const uniqueBlocks = [...new Set(merged.map((l) => l.blockNumber.toString()))].slice(0, 30);
      const blockMap = new Map();
      await Promise.all(
        uniqueBlocks.map(async (bnStr) => {
          const bn = BigInt(bnStr);
          const block = await publicClient.getBlock({ blockNumber: bn });
          blockMap.set(bnStr, Number(block.timestamp));
        })
      );

      const normalized = merged.slice(0, 20).map((log) => {
        const ts = blockMap.get(log.blockNumber.toString());
        const repay = fromUnits(log.args.repayAmount ?? 0n, 6);
        const seize = fromUnits(log.args.seizeAmount ?? 0n, 6);
        const isUser = (log.args.user || "").toLowerCase() === address.toLowerCase();

        return {
          type: "Liquidated",
          role: isUser ? "Borrower" : "Liquidator",
          asset: log.args.asset,
          repayAmount: repay,
          seizeAmount: seize,
          timestamp: ts ? timeAgo(ts) : `Block #${log.blockNumber}`,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
        };
      });

      setItems(normalized);
    } catch (e) {
      console.error("Failed to fetch router activity:", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, publicClient, routerAddress, address, lookbackBlocks]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return { activity: items, loading, refetch: fetchActivity };
}
