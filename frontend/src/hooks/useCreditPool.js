import { ethers } from "ethers";
import CreditPool from "../abi/CreditPool.json";

export const useCreditPool = (provider: ethers.BrowserProvider) => {
  const deposit = async (amount: string) => {
    const signer = await provider.getSigner();

    const pool = new ethers.Contract(
      import.meta.env.VITE_CREDIT_POOL,
      CreditPool.abi,
      signer
    );

    const tx = await pool.deposit({
      value: ethers.parseEther(amount),
    });

    return tx.wait();
  };

  return { deposit };
};
