// import { Card } from "../components/CoreUi";
// import { Button } from "../components/CoreUi";
// import { Vote, CheckCircle2, XCircle, Clock, FileText } from "lucide-react";

// export default function Governance() {
//   const protocolParams = [
//     { name: "Base Interest Rate", value: "3.50%", description: "Minimum APR for all pools" },
//     { name: "Risk Multiplier", value: "1.75x", description: "Interest rate scaling factor" },
//     { name: "Utilization Target", value: "70%", description: "Optimal pool utilization" },
//     { name: "Liquidation Threshold", value: "75%", description: "Utilization before liquidation" },
//     { name: "Insurance Fee", value: "0.15%", description: "% of fees to insurance fund" },
//     { name: "Protocol Fee", value: "0.10%", description: "% of fees to treasury" },
//   ];

//   const proposals = [
//     {
//       id: "ACP-012",
//       title: "Increase Insurance Fund Allocation",
//       description: "Increase the insurance fee from 0.15% to 0.20% to build stronger coverage for delegated credit pools.",
//       status: "active",
//       votesFor: 12450000,
//       votesAgainst: 3200000,
//       quorum: "78%",
//       timeLeft: "2 days",
//     },
//     {
//       id: "ACP-011",
//       title: "Add Support for ARB Token",
//       description: "Enable ARB as a borrowable and depositable asset in the protocol's execution layer.",
//       status: "passed",
//       votesFor: 15680000,
//       votesAgainst: 1920000,
//       quorum: "85%",
//       timeLeft: "Ended",
//     },
//   ];

//   const getStatusStyle = (status) => {
//     switch (status) {
//       case "active": return { icon: Clock, color: "text-[#d4af37]", bg: "bg-[#d4af37]/10", border: "border-[#d4af37]/30" };
//       case "passed": return { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" };
//       case "executed": return { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/20", border: "border-emerald-500/50" };
//       default: return { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" };
//     }
//   };

//   return (
//     <div className="max-w-6xl space-y-8">
//       <div>
//         <h1 className="text-3xl font-bold text-white mb-2">Governance</h1>
//         <p className="text-sm text-[#d4af37]/70">Shape the future of the Aurion Credit Layer.</p>
//       </div>

//       {/* Protocol Parameters */}
//       <section>
//         <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Global Parameters</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {protocolParams.map((param) => (
//             <Card key={param.name} className="bg-[#0a0e17] border border-[#d4af37]/20 p-5 hover:border-[#d4af37] transition-all group">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">{param.name}</h3>
//                   <p className="text-[10px] text-gray-600 mt-1">{param.description}</p>
//                 </div>
//                 <span className="text-xl font-bold text-[#d4af37]">{param.value}</span>
//               </div>
//             </Card>
//           ))}
//         </div>
//       </section>

//       {/* Proposals */}
//       <section>
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-sm font-bold text-white uppercase tracking-widest">Active Proposals</h2>
//           <Button className="bg-[#d4af37] hover:bg-[#b8860b] text-[#0a0e17] font-bold">
//             <Vote className="w-4 h-4 mr-2" />
//             Create Proposal
//           </Button>
//         </div>

//         <div className="space-y-4">
//           {proposals.map((proposal) => {
//             const style = getStatusStyle(proposal.status);
//             const StatusIcon = style.icon;
//             const totalVotes = proposal.votesFor + proposal.votesAgainst;
//             const forPercent = (proposal.votesFor / totalVotes) * 100;
//             const againstPercent = (proposal.votesAgainst / totalVotes) * 100;

//             return (
//               <Card key={proposal.id} className="bg-[#0a0e17] border border-[#d4af37]/20 p-6 hover:shadow-[0_0_20px_rgba(212,175,55,0.05)] transition-all">
//                 <div className="flex flex-col lg:flex-row gap-6">
//                   {/* Left: Info */}
//                   <div className="flex-1">
//                     <div className="flex items-center gap-3 mb-3">
//                       <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">{proposal.id}</span>
//                       <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold border ${style.bg} ${style.color} ${style.border}`}>
//                         <StatusIcon className="w-3 h-3" />
//                         <span className="capitalize">{proposal.status}</span>
//                       </div>
//                     </div>
//                     <h3 className="text-xl font-bold text-white mb-2">{proposal.title}</h3>
//                     <p className="text-sm text-gray-400 leading-relaxed">{proposal.description}</p>
//                   </div>

//                   {/* Right: Stats & Actions */}
//                   <div className="lg:w-1/3 flex flex-col justify-between">
//                      {/* Vote Bar */}
//                     <div className="mb-4">
//                       <div className="flex justify-between text-xs mb-2">
//                         <span className="text-emerald-400 font-bold">For: {forPercent.toFixed(1)}%</span>
//                         <span className="text-red-400 font-bold">Against: {againstPercent.toFixed(1)}%</span>
//                       </div>
//                       <div className="w-full h-2 bg-[#1a1f3a] rounded-full overflow-hidden flex">
//                         <div className="h-full bg-emerald-500" style={{ width: `${forPercent}%` }}></div>
//                         <div className="h-full bg-red-500" style={{ width: `${againstPercent}%` }}></div>
//                       </div>
//                     </div>

//                     {/* Actions */}
//                     {proposal.status === "active" ? (
//                       <div className="flex gap-3">
//                         <Button className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
//                           Vote For
//                         </Button>
//                         <Button className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30">
//                           Vote Against
//                         </Button>
//                       </div>
//                     ) : (
//                       <div className="p-3 bg-white/5 rounded-lg text-center">
//                          <span className="text-xs text-gray-500">Voting Closed • Final Quorum: {proposal.quorum}</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </Card>
//             );
//           })}
//         </div>
//       </section>
//     </div>
//   );
// }