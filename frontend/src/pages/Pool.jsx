import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Shield, TrendingUp } from "lucide-react";

export default function Pools() {
  const pools = [
    {
      asset: "USDC",
      name: "USD Coin",
      totalLiquidity: "$12,450,000",
      utilization: "68.5%",
      apr: "8.75%",
      insuranceCoverage: "95%",
      utilizationValue: 68.5,
    },
    {
      asset: "ETH",
      name: "Ethereum",
      totalLiquidity: "$8,920,000",
      utilization: "72.3%",
      apr: "9.20%",
      insuranceCoverage: "92%",
      utilizationValue: 72.3,
    },
    {
      asset: "USDT",
      name: "Tether",
      totalLiquidity: "$6,780,000",
      utilization: "61.8%",
      apr: "7.95%",
      insuranceCoverage: "95%",
      utilizationValue: 61.8,
    },
    {
      asset: "WBTC",
      name: "Wrapped Bitcoin",
      totalLiquidity: "$4,320,000",
      utilization: "58.2%",
      apr: "7.40%",
      insuranceCoverage: "90%",
      utilizationValue: 58.2,
    },
    {
      asset: "DAI",
      name: "Dai Stablecoin",
      totalLiquidity: "$3,150,000",
      utilization: "54.7%",
      apr: "6.85%",
      insuranceCoverage: "95%",
      utilizationValue: 54.7,
    },
  ];

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-white mb-2">Credit Pools</h1>
          <p className="text-sm text-[#F5DEB3]/70">Browse and deposit into available lending pools</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1f3a] border border-[#D4AF37]/20 rounded-lg">
          <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-sm text-[#F5DEB3]/70">Total TVL:</span>
          <span className="text-sm text-white">$35,620,000</span>
        </div>
      </div>

      {/* Pools Table */}
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
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-white">{pool.utilization}</div>
                    <div className="w-24 h-1.5 bg-[#0B1437] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${pool.utilizationValue > 70 ? 'bg-[#D4AF37]' : 'bg-emerald-500'}`}
                        style={{ width: `${pool.utilizationValue}%` }}
                      ></div>
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
                  <Button size="sm" className="bg-[#D4AF37] hover:bg-[#C19A2E] text-[#0B1437] font-medium">
                    Deposit
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
