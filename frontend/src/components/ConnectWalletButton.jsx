import { useAccount } from "wagmi";
import { Wallet } from "lucide-react";

export function ConnectWalletButton({ onClick }) {
  const { isConnected } = useAccount();

  if (isConnected) return null;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] hover:bg-[#b8860b] text-[#0a0e17] rounded-lg font-bold text-sm transition-all shadow-lg shadow-[#d4af37]/10"
    >
      <Wallet size={16} />
      <span>Connect Wallet</span>
    </button>
  );
}
