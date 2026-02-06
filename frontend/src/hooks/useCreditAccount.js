import { ethers } from "ethers";
import CreditManager from "../abi/CreditManager.json";

export const useCreditAccount = async (
  provider: ethers.Provider,
  user: string
) => {
  const manager = new ethers.Contract(
    import.meta.env.VITE_CREDIT_MANAGER,
    CreditManager.abi,
    provider
  );

  const debt = await manager.totalDebt(user);
  const limit = await manager.creditLimit(user);

  return {
    debt: Number(debt),
    limit: Number(limit),
    available: Number(limit - debt),
  };
};
