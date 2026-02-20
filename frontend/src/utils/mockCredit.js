import React from "react";

export function mockCreditScore(address) {
  if (!address) return 0;
  let h = 0;
  const s = address.toLowerCase();
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  const score = 300 + (h % 651);
  return score;
}

export function scoreToTier(score) {
  if (score >= 700) return "Conservative";
  if (score >= 500) return "Moderate";
  if (score >= 300) return "Aggressive";
  return "Restricted";
}

export function tierMeta(tier) {
  switch (tier) {
    case "Conservative":
      return { color: "text-emerald-400", bar: "bg-emerald-500", hint: "Best rates" };
    case "Moderate":
      return { color: "text-yellow-300", bar: "bg-yellow-400", hint: "Balanced" };
    case "Aggressive":
      return { color: "text-[#D4AF37]", bar: "bg-[#D4AF37]", hint: "Higher risk" };
    default:
      return { color: "text-red-400", bar: "bg-red-500", hint: "Limited access" };
  }
}