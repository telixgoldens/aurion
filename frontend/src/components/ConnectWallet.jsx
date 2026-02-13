import { useAccount, useConnect, useDisconnect } from "wagmi";
import { LogOut, Wallet, ShieldCheck } from "lucide-react";

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end d-none d-md-block">
          <span className="text-[10px] text-[#d4af37] font-bold tracking-widest uppercase">
            Verified Identity
          </span>
          <span className="text-white text-sm font-mono">
            {truncatedAddress}
          </span>
        </div>
        <button
          onClick={() => disconnect()}
          className="btn btn-outline-danger btn-sm rounded-circle p-2 border-opacity-25"
          title="Disconnect Wallet"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] hover:bg-[#b8860b] text-[#0a0e17] rounded-lg font-bold text-sm transition-all shadow-lg shadow-[#d4af37]/10"
        >
          <Wallet size={16} />
          <span>Connect {connector.name}</span>
        </button>
      ))}
    </div>
  );
}
