import { useReadContracts } from "wagmi";
import { formatUnits } from "viem";

const CREDIT_MANAGER_ABI = [
  {
    name: "userMetrics", type: "function", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "collateral",   type: "uint256" },
      { name: "delegated",    type: "uint256" },
      { name: "debt",         type: "uint256" },
      { name: "hf",           type: "uint256" },
      { name: "score",        type: "uint256" },
      { name: "tier",         type: "uint8"   },
      { name: "openedAt",     type: "uint256" },
      { name: "borrows",      type: "uint256" },
      { name: "repays",       type: "uint256" },
      { name: "liquidations", type: "uint256" },
      { name: "isFrozen",     type: "bool"    },
    ],
  },
  {
    name: "creditScoreBreakdown", type: "function", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "ageScore",           type: "uint256" },
      { name: "healthScore",        type: "uint256" },
      { name: "repayScore",         type: "uint256" },
      { name: "delegatedScore",     type: "uint256" },
      { name: "diversityScore",     type: "uint256" },
      { name: "volatilityPenalty",  type: "uint256" },
      { name: "utilizationPenalty", type: "uint256" },
      { name: "liquidationPenalty", type: "uint256" },
    ],
  },
  {
    name: "aaveDebt", type: "function", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "compoundDebt", type: "function", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "collateralValue", type: "function", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "creditLimit", type: "function", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "totalDebt", type: "function", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "healthFactor", type: "function", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "creditScore", type: "function", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
];

export const TIER_META = {
  3: { label: "Conservative", color: "#4ade80", bg: "#052e16", border: "#166534", maxLtv: "75%" },
  2: { label: "Moderate",     color: "#facc15", bg: "#1c1400", border: "#854d0e", maxLtv: "85%" },
  1: { label: "Aggressive",   color: "#fb923c", bg: "#1c0a00", border: "#9a3412", maxLtv: "95%" },
  0: { label: "Unrated",      color: "#64748b", bg: "#0f172a", border: "#1e293b", maxLtv: "0%"  },
};

export function scoreColor(score) {
  if (score >= 700) return "#4ade80";
  if (score >= 500) return "#facc15";
  if (score >= 300) return "#fb923c";
  return "#f87171";
}

export function useCreditScore(creditManagerAddress, userAddress) {
  const enabled = !!creditManagerAddress && !!userAddress;

  const { data, isLoading, isError, refetch } = useReadContracts({
    contracts: [
      { address: creditManagerAddress, abi: CREDIT_MANAGER_ABI, functionName: "userMetrics",          args: [userAddress] },
      { address: creditManagerAddress, abi: CREDIT_MANAGER_ABI, functionName: "creditScoreBreakdown", args: [userAddress] },
      { address: creditManagerAddress, abi: CREDIT_MANAGER_ABI, functionName: "aaveDebt",             args: [userAddress] },
      { address: creditManagerAddress, abi: CREDIT_MANAGER_ABI, functionName: "compoundDebt",         args: [userAddress] },
      { address: creditManagerAddress, abi: CREDIT_MANAGER_ABI, functionName: "collateralValue",      args: [userAddress] },
      { address: creditManagerAddress, abi: CREDIT_MANAGER_ABI, functionName: "creditLimit",          args: [userAddress] },
      { address: creditManagerAddress, abi: CREDIT_MANAGER_ABI, functionName: "totalDebt",            args: [userAddress] },
      { address: creditManagerAddress, abi: CREDIT_MANAGER_ABI, functionName: "healthFactor",         args: [userAddress] },
      { address: creditManagerAddress, abi: CREDIT_MANAGER_ABI, functionName: "creditScore",          args: [userAddress] },
    ],
    query: { enabled, refetchInterval: 15_000 },
  });

  const metricsRaw    = data?.[0]?.result;
  const breakdownRaw  = data?.[1]?.result;
  const aaveDebtRaw   = data?.[2]?.result ?? 0n;
  const compDebtRaw   = data?.[3]?.result ?? 0n;
  const collateralRaw = data?.[4]?.result ?? 0n;
  const limitRaw      = data?.[5]?.result ?? 0n;
  const debtRaw       = data?.[6]?.result ?? 0n;
  const hfRaw         = data?.[7]?.result ?? 0n;
  const scoreRaw      = data?.[8]?.result ?? 0n;

  const metrics = metricsRaw ? {
    collateral:   metricsRaw[0],
    delegated:    metricsRaw[1],
    debt:         metricsRaw[2],
    hf:           metricsRaw[3],
    score:        Number(metricsRaw[4]),
    tier:         Number(metricsRaw[5]),
    openedAt:     Number(metricsRaw[6]),
    borrows:      Number(metricsRaw[7]),
    repays:       Number(metricsRaw[8]),
    liquidations: Number(metricsRaw[9]),
    isFrozen:     metricsRaw[10],
  } : {
    collateral:   collateralRaw,
    delegated:    limitRaw > collateralRaw ? limitRaw - collateralRaw : 0n,
    debt:         debtRaw,
    hf:           hfRaw,
    score:        Number(scoreRaw),
    tier:         0,
    openedAt:     0,
    borrows:      0,
    repays:       0,
    liquidations: 0,
    isFrozen:     false,
  };

  const breakdown = breakdownRaw ? {
    ageScore:          Number(breakdownRaw[0]),
    healthScore:       Number(breakdownRaw[1]),
    repayScore:        Number(breakdownRaw[2]),
    delegatedScore:    Number(breakdownRaw[3]),
    diversityScore:    Number(breakdownRaw[4]),
    volatilityPenalty: Number(breakdownRaw[5]),
    utilizationPenalty:Number(breakdownRaw[6]),
    liquidationPenalty:Number(breakdownRaw[7]),
    grossScore: Number(breakdownRaw[0]) + Number(breakdownRaw[1]) +
                Number(breakdownRaw[2]) + Number(breakdownRaw[3]) +
                Number(breakdownRaw[4]),
    totalPenalty: Number(breakdownRaw[5]) + Number(breakdownRaw[6]) +
                  Number(breakdownRaw[7]),
  } : null;

  const MAX_UINT = 2n ** 256n - 1n;
  const hfFormatted = metrics?.hf
    ? (metrics.hf === MAX_UINT ? "∞" : Number(formatUnits(metrics.hf, 18)).toFixed(2))
    : "—";

  const utilizationPct = (() => {
    const limit = metrics.collateral + (typeof metrics.delegated === 'bigint' ? metrics.delegated : 0n);
    if (!limit || limit === 0n) return 0;
    return Number(formatUnits(metrics.debt * 10000n / limit, 2));
  })();

  const accountAgeDays = metrics?.openedAt
    ? Math.floor((Date.now() / 1000 - metrics.openedAt) / 86400)
    : 0;

  const isAaveActive     = aaveDebtRaw > 0n;
  const isCompoundActive = compDebtRaw > 0n;
  const tierMeta         = TIER_META[metrics?.tier ?? 0];

  const scoreToNextTier = () => {
    const s = metrics?.score ?? 0;
    if (s >= 700) return { next: null, needed: 0, nextLabel: "Max tier" };
    if (s >= 500) return { next: 700, needed: 700 - s, nextLabel: "Conservative" };
    if (s >= 300) return { next: 500, needed: 500 - s, nextLabel: "Moderate" };
    return { next: 300, needed: 300 - s, nextLabel: "Aggressive" };
  };

  return {
    metrics,
    breakdown,
    aaveDebt:      aaveDebtRaw,
    compoundDebt:  compDebtRaw,
    collateral:    collateralRaw,
    creditLimit:   limitRaw,
    totalDebt:     debtRaw,
    hfFormatted,
    utilizationPct,
    accountAgeDays,
    isAaveActive,
    isCompoundActive,
    tierMeta,
    scoreProgress: scoreToNextTier(),
    scoreColor:    scoreColor(metrics?.score ?? 0),
    isLoading,
    isError,
    refetch,
  };
}
