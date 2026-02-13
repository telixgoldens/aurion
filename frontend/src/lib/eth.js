import { ethers } from "ethers";

export async function getBrowserProvider() {
  if (!window.ethereum) throw new Error("No wallet found");
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = await getBrowserProvider();
  return await provider.getSigner();
}
