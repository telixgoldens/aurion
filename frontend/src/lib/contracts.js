import { ethers } from "ethers";
import CreditRouter from "../abi/CreditRouter.json";

export const getCreditRouter = (provider: ethers.Provider) => {
  return new ethers.Contract(
    import.meta.env.VITE_CREDIT_ROUTER,
    CreditRouter.abi,
    provider
  );
};
