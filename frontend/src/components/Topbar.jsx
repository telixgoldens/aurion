import { ConnectWallet } from "./ConnectWallet";
import {  Circle } from "lucide-react";
import { Button } from "../ui/button";

export default function TopBar() {
  return (
    <div className="h-16 bg-[#0B1437] border-b border-[#D4AF37]/20 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Network Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1f3a] border border-[#D4AF37]/30 rounded-lg">
          <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
          <span className="text-sm text-white/90">Arbitrum</span>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1f3a] border border-emerald-500/30 rounded-lg">
          <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
          <span className="text-sm text-white/90">Protocol Healthy</span>
        </div>
      </div>

      {/* Wallet Connect */}
      <Button className="bg-[#D4AF37] hover:bg-[#C19A2E] text-[#0B1437] font-medium">
         <ConnectWallet />
      </Button>
    </div>
  );
}
