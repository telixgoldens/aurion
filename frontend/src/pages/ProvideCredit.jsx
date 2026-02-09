import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { TrendingUp, Droplet, Shield, Info } from "lucide-react";

export function ProvideCredit() {
  const [amount, setAmount] = useState("");

  const depositAmount = parseFloat(amount) || 0;
  const expectedYield = depositAmount * 0.0875;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl text-white mb-2">Provide Credit</h1>
        <p className="text-sm text-[#F5DEB3]/70">Earn yield by providing liquidity to the protocol</p>
      </div>

      {/* Pool Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Droplet className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-sm text-[#F5DEB3]/70">Total Liquidity</h3>
          </div>
          <div className="text-2xl text-white">$12,450,000</div>
        </Card>

        <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm text-[#F5DEB3]/70">Utilization Rate</h3>
          </div>
          <div className="text-2xl text-white">68.5%</div>
        </Card>

        <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-sm text-[#F5DEB3]/70">Current APR</h3>
          </div>
          <div className="text-2xl text-white">8.75%</div>
        </Card>
      </div>

      {/* Deposit Card */}
      <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-6">
        <h2 className="text-lg text-white mb-6">Deposit USDC</h2>

        <div className="space-y-4">
          {/* Amount Input */}
          <div>
            <label className="text-sm text-[#F5DEB3]/70 mb-2 block">Deposit Amount</label>
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
                onClick={() => setAmount("10000")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#D4AF37] hover:text-[#C19A2E] hover:bg-[#D4AF37]/10"
              >
                MAX
              </Button>
            </div>
            <p className="text-xs text-[#F5DEB3]/50 mt-2">
              Balance: 50,000.00 USDC
            </p>
          </div>

          {/* Expected Yield */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-[#0B1437] rounded-lg border border-[#D4AF37]/20">
            <div>
              <p className="text-xs text-[#F5DEB3]/60 mb-1">Expected Annual Yield</p>
              <p className="text-xl text-[#D4AF37]">${expectedYield.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-xs text-[#F5DEB3]/60 mb-1">APR</p>
              <p className="text-xl text-white">8.75%</p>
            </div>
          </div>

          {/* Insurance Coverage */}
          <div className="flex items-start gap-3 p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg">
            <Shield className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-[#F5DEB3] mb-1">Insurance Coverage</p>
              <p className="text-xs text-[#F5DEB3]/70">
                Your deposit is covered up to 95% by the protocol insurance fund. 
                In the event of bad debt, losses are absorbed by the insurance pool before affecting depositors.
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 bg-[#1a1f3a]/50 border border-[#D4AF37]/20 rounded-lg">
            <Info className="w-5 h-5 text-[#F5DEB3]/60 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-[#F5DEB3]/80 mb-1">How it works</p>
              <p className="text-xs text-[#F5DEB3]/60">
                Your USDC is pooled with other providers and lent to credit-worthy borrowers. 
                Interest earned is distributed proportionally based on your share of the pool. 
                You can withdraw your funds at any time, subject to available liquidity.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            className="w-full bg-[#D4AF37] hover:bg-[#C19A2E] text-[#0B1437] font-medium h-12 mt-4"
            disabled={!amount || parseFloat(amount) <= 0}
          >
            <Droplet className="w-4 h-4 mr-2" />
            Deposit USDC
          </Button>
        </div>
      </Card>
    </div>
  );
}
