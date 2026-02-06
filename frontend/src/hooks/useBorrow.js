import { ethers } from "ethers";
import { getCreditRouter } from "../lib/contracts";

export const useBorrow = () => {
  const borrow = async (
    provider: ethers.BrowserProvider,
    adapter: string,
    asset: string,
    amount: string
  ) => {
    const signer = await provider.getSigner();
    const router = getCreditRouter(signer);

    const tx = await router.borrowFromAave(
      adapter,
      asset,
      ethers.parseUnits(amount, 6)
    );

    return tx.wait();
  };

  return { borrow };
};
