import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { Card } from "../components/CoreUi";
import { Button } from "../components/CoreUi";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/CoreUi";
import { Shield, TrendingUp } from "lucide-react";

import CreditPool from "../abi/CreditPool.json"; 
import { getCreditRouter, getCreditManager, getUSDC } from "../lib/contracts";
import { getBrowserProvider, getSigner } from "../lib/eth";
import { formatCurrency } from "../utils/format";

function pct(n) {
  if (!Number.isFinite(n)) return "0.00%";
  return `${n.toFixed(2)}%`;
}

function safeDiv(a, b) {
  if (!b || b === 0) return 0;
  return a / b;
}

export default function Pools() {
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(false);

  const [routerInfo, setRouterInfo] = useState({
    creditManager: "",
    insurancePool: "",
    closeFactorBps: "",
  });

  const [credit, setCredit] = useState({
    creditLimit: 0,
    totalDebt: 0,
    available: 0,
    healthFactor: 0,
    collateralValue: 0,
  });

  const [poolLive, setPoolLive] = useState({
    poolAddress: "",
    assetSymbol: "USDC",
    assetName: "USD Coin",
    totalDepositsUsd: 0,
    availableLiquidityUsd: 0,
    utilizationPct: 0,
    totalDelegatedUsd: 0,
  });

  const pools = useMemo(() => {
    // single live pool for now
    return [
      {
        asset: poolLive.assetSymbol,
        name: poolLive.assetName,
        totalLiquidity: formatCurrency(poolLive.totalDepositsUsd),
        utilization: pct(poolLive.utilizationPct),
        apr: "N/A",
        insuranceCoverage: "N/A",
        utilizationValue: poolLive.utilizationPct,
        _poolAddress: poolLive.poolAddress,
      },
    ];
  }, [poolLive]);

  async function connect() {
    const signer = await getSigner();
    const addr = await signer.getAddress();
    setAccount(addr);
    return signer;
  }

  async function refreshReads(userAddress) {
    const provider = await getBrowserProvider();

    // Router reads
    const router = getCreditRouter(provider);
    const [cmAddr, ipAddr, cfBps] = await Promise.all([
      router.creditManager(),
      router.insurancePool(),
      router.closeFactorBps(),
    ]);

    setRouterInfo({
      creditManager: cmAddr,
      insurancePool: ipAddr,
      closeFactorBps: cfBps?.toString?.() ?? String(cfBps),
    });

    // CreditManager + pool reads
    const manager = getCreditManager(provider);

    const [
      poolAddress,
      debt,
      limit,
      health,
      collateral,
    ] = await Promise.all([
      manager.pool(),
      manager.totalDebt(userAddress),
      manager.creditLimit(userAddress),
      manager.healthFactor(userAddress),
      manager.collateralValue(userAddress),
    ]);

    // NOTE: your CreditManager values look 6 decimals for debt/limit (USDC-style)
    const debtNum = Number(ethers.formatUnits(debt ?? 0n, 6));
    const limitNum = Number(ethers.formatUnits(limit ?? 0n, 6));
    const availableNum = Math.max(0, limitNum - debtNum);
    const collateralNum = Number(ethers.formatUnits(collateral ?? 0n, 6));
    const healthNum = Number(ethers.formatUnits(health ?? 0n, 18));

    setCredit({
      totalDebt: debtNum,
      creditLimit: limitNum,
      available: availableNum,
      collateralValue: collateralNum,
      healthFactor: healthNum,
    });

    // Pool contract (CreditPool ABI)
    const pool = new ethers.Contract(poolAddress, CreditPool.abi, provider);
    const [totalDeposits, availableLiquidity, totalDelegated] = await Promise.all([
      pool.totalDeposits(),
      pool.availableLiquidity(),
      pool.totalDelegated(),
    ]);

    const totalDepositsNum = Number(ethers.formatUnits(totalDeposits ?? 0n, 6));
    const availableLiqNum = Number(ethers.formatUnits(availableLiquidity ?? 0n, 6));
    const totalDelegatedNum = Number(ethers.formatUnits(totalDelegated ?? 0n, 6));

    const utilized = Math.max(0, totalDepositsNum - availableLiqNum);
    const utilizationPct = safeDiv(utilized, totalDepositsNum) * 100;

    setPoolLive({
      poolAddress,
      assetSymbol: "USDC",
      assetName: "USD Coin",
      totalDepositsUsd: totalDepositsNum,
      availableLiquidityUsd: availableLiqNum,
      totalDelegatedUsd: totalDelegatedNum,
      utilizationPct,
    });
  }

  useEffect(() => {
    (async () => {
      if (!window.ethereum) return;
      const provider = await getBrowserProvider();
      const accounts = await provider.send("eth_accounts", []);
      if (accounts?.[0]) {
        setAccount(accounts[0]);
        await refreshReads(accounts[0]);
      } else {
        // still fetch protocol-level reads without user, if you want
        // no-op
      }
    })();
  }, []);

  async function handleDeposit() {
    setLoading(true);
    try {
      const amountHuman = prompt("Deposit amount in USDC", "10");
      if (!amountHuman) return;

      const signer = account ? await getSigner() : await connect();
      const user = await signer.getAddress();

      // need pool address
      const provider = await getBrowserProvider();
      const manager = getCreditManager(provider);
      const poolAddress = await manager.pool();

      // approve USDC -> pool, then deposit
      const usdc = getUSDC(signer);
      const amountWei = ethers.parseUnits(amountHuman.toString(), 6);

      const approveTx = await usdc.approve(poolAddress, amountWei);
      await approveTx.wait();

      const pool = new ethers.Contract(poolAddress, CreditPool.abi, signer);
      const tx = await pool.deposit(amountWei);
      await tx.wait();

      await refreshReads(user);
      alert("Deposit successful");
    } catch (e) {
      console.error(e);
      alert(e?.shortMessage || e?.message || "Deposit failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-white mb-2">Credit Pools</h1>
          <p className="text-sm text-[#F5DEB3]/70">Browse and deposit into available lending pools</p>

          <div className="mt-3 text-xs text-[#F5DEB3]/60 space-y-1">
            <div>
              Router creditManager <span className="text-white">{routerInfo.creditManager || "..."}</span>
            </div>
            <div>
              Router insurancePool <span className="text-white">{routerInfo.insurancePool || "..."}</span>
            </div>
            <div>
              Close factor bps <span className="text-white">{routerInfo.closeFactorBps || "..."}</span>
            </div>

            {account ? (
              <div className="pt-2 space-y-1">
                <div>
                  Wallet <span className="text-white">{account}</span>
                </div>
                <div>
                  Credit limit <span className="text-white">{formatCurrency(credit.creditLimit)}</span>
                </div>
                <div>
                  Total debt <span className="text-white">{formatCurrency(credit.totalDebt)}</span>
                </div>
                <div>
                  Available <span className="text-white">{formatCurrency(credit.available)}</span>
                </div>
                <div>
                  Health factor <span className="text-white">{credit.healthFactor.toFixed(4)}</span>
                </div>
                <div>
                  Collateral value <span className="text-white">{formatCurrency(credit.collateralValue)}</span>
                </div>
              </div>
            ) : (
              <div className="pt-2">
                <Button
                  size="sm"
                  className="bg-[#D4AF37] hover:bg-[#C19A2E] text-[#0B1437] font-medium"
                  onClick={async () => {
                    const signer = await connect();
                    await refreshReads(await signer.getAddress());
                  }}
                >
                  Connect wallet
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1f3a] border border-[#D4AF37]/20 rounded-lg">
          <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-sm text-[#F5DEB3]/70">Total TVL</span>
          <span className="text-sm text-white">{formatCurrency(poolLive.totalDepositsUsd)}</span>
        </div>
      </div>

      <Card className="bg-[#1a1f3a] border-[#D4AF37]/20">
        <Table>
          <TableHeader>
            <TableRow className="border-[#D4AF37]/20 hover:bg-transparent">
              <TableHead className="text-[#F5DEB3]/70">Asset</TableHead>
              <TableHead className="text-[#F5DEB3]/70">Total Liquidity</TableHead>
              <TableHead className="text-[#F5DEB3]/70">Utilization</TableHead>
              <TableHead className="text-[#F5DEB3]/70">APR</TableHead>
              <TableHead className="text-[#F5DEB3]/70">Insurance</TableHead>
              <TableHead className="text-[#F5DEB3]/70"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pools.map((pool) => (
              <TableRow key={pool.asset} className="border-[#D4AF37]/20 hover:bg-[#D4AF37]/5">
                <TableCell>
                  <div>
                    <div className="text-white font-medium">{pool.asset}</div>
                    <div className="text-xs text-[#F5DEB3]/50">{pool.name}</div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-white">{pool.totalLiquidity}</div>
                  <div className="text-[10px] text-[#F5DEB3]/50 mt-1">
                    Available {formatCurrency(poolLive.availableLiquidityUsd)}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <div className="text-white">{pool.utilization}</div>
                    <div className="w-24 h-1.5 bg-[#0B1437] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pool.utilizationValue > 70 ? "bg-[#D4AF37]" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min(100, Math.max(0, pool.utilizationValue))}%` }}
                      />
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-[#D4AF37] font-medium">{pool.apr}</div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="text-white">{pool.insuranceCoverage}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <Button
                    size="sm"
                    disabled={loading}
                    className="bg-[#D4AF37] hover:bg-[#C19A2E] text-[#0B1437] font-medium disabled:opacity-60"
                    onClick={handleDeposit}
                  >
                    {loading ? "Processing" : "Deposit"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
