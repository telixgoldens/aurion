import CreditGovernor from "../abi/CreditGovernor.json";

export const useGovernance = async (provider: any) => {
  const gov = new ethers.Contract(
    import.meta.env.VITE_GOVERNOR,
    CreditGovernor.abi,
    provider
  );

  const apr = await gov.creditApr();
  return { apr: Number(apr) / 100 };
};
