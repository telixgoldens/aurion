import { ConnectWallet } from "../components/ConnectWallet"; // Ensure path is correct based on your folder structure
import { Circle, Activity } from "lucide-react";

function TopBar() {
  return (
    <div className="h-20 bg-[#0a0e17] border-b border-[#d4af37]/20 px-8 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-opacity-90">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1f3a] border border-[#d4af37]/30 rounded-full">
          <div className="w-2 h-2 bg-[#28a0f0] rounded-full shadow-[0_0_8px_#28a0f0]"></div>
          <span className="text-xs font-bold text-white tracking-wide">Arbitrum Sepolia</span>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#1a1f3a] border border-emerald-500/30 rounded-full">
          <Activity className="w-3 h-3 text-emerald-500" />
          <span className="text-xs font-bold text-white tracking-wide">Protocol Healthy</span>
        </div>
      </div>
      <div>
         <ConnectWallet />
      </div>
    </div>
  );
}
export default TopBar;