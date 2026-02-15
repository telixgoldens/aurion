import { createPortal } from "react-dom";
import { useMemo, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { X } from "lucide-react";
import { arbitrumSepolia } from "wagmi/chains";

export default function WalletConnectModal({ open, onClose }) {
  const { isConnected } = useAccount();
  const { connectors, connectAsync, isPending } = useConnect();
  const [error, setError] = useState("");

  const options = useMemo(() => connectors, [connectors]);

  if (open && isConnected) onClose?.();

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <button
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close modal overlay"
      />
      <div className="relative w-[92vw] max-w-sm rounded-xl border border-white/10 bg-[#0a0e17] p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="text-white font-bold">Connect a wallet</div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
            <X className="w-4 h-4 text-white/80" />
          </button>
        </div>
        {error && (
          <div className="mb-3 text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
            {error}
          </div>
        )}
        <div className="space-y-2">
          {options.map((connector) => (
            <button
              key={connector.uid}
              disabled={isPending}
              onClick={async () => {
                setError("");
                try {
                  await connectAsync({
                    connector,
                    chainId: arbitrumSepolia.id,
                  });
                  onClose?.(); 
                } catch (e) {
                  setError(e?.shortMessage || e?.message || "Failed to connect");
                }
              }}
              className="w-full px-3 py-2 rounded-lg border border-white/10 hover:border-white/20 text-white disabled:opacity-60 text-left flex items-center justify-between"
            >
              <span>{connector.name}</span>
              <span className="text-xs text-white/40">Connect</span>
            </button>
          ))}
        </div>
        <div className="mt-3 text-[11px] text-white/40">
          Tip: Connect to any of the above wallet to stay connected.
        </div>
      </div>
    </div>,
    document.body
  );
}
