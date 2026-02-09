import { useAccount, usePublicClient } from "wagmi";
import CreditManager from "../abi/CreditManager.json";
import { ethers } from "ethers";

export function useDashboard() {
  const { address } = useAccount();
  const client = usePublicClient();

  const fetchData = async () => {
    if (!address || !client) return null;

    const manager = new ethers.Contract(
      import.meta.env.VITE_CREDIT_MANAGER,
      CreditManager.abi,
      new ethers.BrowserProvider(client.transport)
    );

    const debt = await manager.totalDebt(address);
    const limit = await manager.creditLimit(address);

    return {
      debt: Number(debt) / 1e6,
      limit: Number(limit) / 1e6,
      available: Number(limit - debt) / 1e6,
    };
  };

  return { fetchData };
}
