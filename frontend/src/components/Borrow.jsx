import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { AlertCircle, TrendingDown, Shield } from "lucide-react";

export default function Borrow() {
  const [amount, setAmount] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("USDC");

  const assets = [
    { symbol: "USDC", name: "USD Coin", available: "107,150" },
    { symbol: "ETH", name: "Ethereum", available: "42.5" },
    { symbol: "USDT", name: "Tether", available: "95,000" },
  ];

  const currentAsset = assets.find(a => a.symbol === selectedAsset);
  const borrowAmount = parseFloat(amount) || 0;
  const currentUtilization = 28.6;
  const resultingUtilization = currentUtilization + (borrowAmount / 150000 * 100);
  const interestRate = 4.5 + (resultingUtilization / 100 * 2);
  const liquidationBuffer = 107150 - borrowAmount;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl text-white mb-2">Borrow</h1>
        <p className="text-sm text-[#F5DEB3]/70">Access undercollateralized credit from the protocol</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Primary Borrow Card */}
        <Card className="col-span-2 bg-[#1a1f3a] border-[#D4AF37]/20 p-6">
          <h2 className="text-lg text-white mb-6">Borrow Assets</h2>

          {/* Asset Selector */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-[#F5DEB3]/70 mb-2 block">Select Asset</label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger className="bg-[#0B1437] border-[#D4AF37]/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0B1437] border-[#D4AF37]/30">
                  {assets.map((asset) => (
                    <SelectItem key={asset.symbol} value={asset.symbol} className="text-white hover:bg-[#D4AF37]/10">
                      <div className="flex items-center justify-between w-full">
                        <span>{asset.symbol}</span>
                        <span className="text-xs text-[#F5DEB3]/50 ml-4">{asset.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount Input */}
            <div>
              <label className="text-sm text-[#F5DEB3]/70 mb-2 block">Borrow Amount</label>
              <div className="relative">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-[#0B1437] border-[#D4AF37]/30 text-white text-2xl pr-20 h-14"
                />
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setAmount(currentAsset?.available || "0")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#D4AF37] hover:text-[#C19A2E] hover:bg-[#D4AF37]/10"
                >
                  MAX
                </Button>
              </div>
              <p className="text-xs text-[#F5DEB3]/50 mt-2">
                Available: {currentAsset?.available} {selectedAsset}
              </p>
            </div>

            {/* Action Button */}
            <Button 
              className="w-full bg-[#D4AF37] hover:bg-[#C19A2E] text-[#0B1437] font-medium h-12 mt-6"
              disabled={!amount || parseFloat(amount) <= 0}
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Borrow {selectedAsset}
            </Button>
          </div>
        </Card>

        {/* Risk Preview Panel */}
        <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-6">
          <h2 className="text-lg text-white mb-6">Risk Preview</h2>

          <div className="space-y-6">
            {/* Resulting Utilization */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#F5DEB3]/70">Utilization</span>
                <span className="text-sm text-white">{resultingUtilization.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-[#0B1437] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${resultingUtilization > 70 ? 'bg-red-500' : resultingUtilization > 50 ? 'bg-[#D4AF37]' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(resultingUtilization, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Interest Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#F5DEB3]/70">Interest Rate</span>
                <span className="text-sm text-white">{interestRate.toFixed(2)}%</span>
              </div>
              <p className="text-xs text-[#F5DEB3]/50">Annual percentage rate</p>
            </div>

            {/* Liquidation Buffer */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#F5DEB3]/70">Liquidation Buffer</span>
                <span className="text-sm text-white">${liquidationBuffer.toLocaleString()}</span>
              </div>
              <p className="text-xs text-[#F5DEB3]/50">Remaining before liquidation</p>
            </div>

            {/* Warning */}
            {resultingUtilization > 70 && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-400">
                  High utilization increases liquidation risk
                </p>
              </div>
            )}

            {/* Insurance Info */}
            <div className="flex items-start gap-2 p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg">
              <Shield className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#F5DEB3]/90">
                This position is covered by protocol insurance
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
