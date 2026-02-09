import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Vote, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function Governance() {
  const protocolParams = [
    { name: "Base Interest Rate", value: "3.50%", description: "Minimum APR for all pools" },
    { name: "Risk Multiplier", value: "1.75x", description: "Interest rate scaling factor" },
    { name: "Utilization Target", value: "70%", description: "Optimal pool utilization" },
    { name: "Liquidation Threshold", value: "75%", description: "Utilization before liquidation" },
    { name: "Insurance Fee", value: "0.15%", description: "% of fees to insurance fund" },
    { name: "Protocol Fee", value: "0.10%", description: "% of fees to treasury" },
  ];

  const proposals = [
    {
      id: "ACP-012",
      title: "Increase Insurance Fund Allocation",
      description: "Increase the insurance fee from 0.15% to 0.20% to build stronger coverage",
      status: "active",
      votesFor: "12,450,000",
      votesAgainst: "3,200,000",
      quorum: "78%",
      timeLeft: "2 days",
    },
    {
      id: "ACP-011",
      title: "Add Support for ARB Token",
      description: "Enable ARB as a borrowable and depositable asset in the protocol",
      status: "passed",
      votesFor: "15,680,000",
      votesAgainst: "1,920,000",
      quorum: "85%",
      timeLeft: "Ended",
    },
    {
      id: "ACP-010",
      title: "Adjust Base Interest Rate",
      description: "Lower base interest rate from 3.50% to 3.25% to attract more borrowers",
      status: "executed",
      votesFor: "14,200,000",
      votesAgainst: "2,100,000",
      quorum: "82%",
      timeLeft: "Executed",
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <Clock className="w-4 h-4 text-[#D4AF37]" />;
      case "passed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "executed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default:
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30";
      case "passed":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "executed":
        return "bg-emerald-500/20 text-emerald-500 border-emerald-500/30";
      default:
        return "bg-red-500/20 text-red-400 border-red-500/30";
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl text-white mb-2">Governance</h1>
        <p className="text-sm text-[#F5DEB3]/70">Protocol parameters and DAO proposals</p>
      </div>

      {/* Protocol Parameters */}
      <section>
        <h2 className="text-lg text-white/90 mb-4">Protocol Parameters</h2>
        <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-6">
          <div className="grid grid-cols-2 gap-6">
            {protocolParams.map((param) => (
              <div key={param.name} className="flex items-start justify-between p-4 bg-[#0B1437] rounded-lg border border-[#D4AF37]/20">
                <div>
                  <h3 className="text-sm text-white mb-1">{param.name}</h3>
                  <p className="text-xs text-[#F5DEB3]/50">{param.description}</p>
                </div>
                <div className="text-lg text-[#D4AF37] font-medium ml-4">{param.value}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Proposals */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-white/90">Proposals</h2>
          <Button className="bg-[#D4AF37] hover:bg-[#C19A2E] text-[#0B1437] font-medium">
            <Vote className="w-4 h-4 mr-2" />
            Create Proposal
          </Button>
        </div>

        <div className="space-y-4">
          {proposals.map((proposal) => (
            <Card key={proposal.id} className="bg-[#1a1f3a] border-[#D4AF37]/20 p-6 hover:border-[#D4AF37]/40 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-[#F5DEB3]/50 font-mono">{proposal.id}</span>
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs ${getStatusColor(proposal.status)}`}>
                      {getStatusIcon(proposal.status)}
                      <span className="capitalize">{proposal.status}</span>
                    </div>
                  </div>
                  <h3 className="text-base text-white mb-1">{proposal.title}</h3>
                  <p className="text-sm text-[#F5DEB3]/70">{proposal.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-[#F5DEB3]/50 mb-1">For</p>
                  <p className="text-sm text-emerald-400">{proposal.votesFor}</p>
                </div>
                <div>
                  <p className="text-xs text-[#F5DEB3]/50 mb-1">Against</p>
                  <p className="text-sm text-red-400">{proposal.votesAgainst}</p>
                </div>
                <div>
                  <p className="text-xs text-[#F5DEB3]/50 mb-1">Quorum</p>
                  <p className="text-sm text-white">{proposal.quorum}</p>
                </div>
                <div>
                  <p className="text-xs text-[#F5DEB3]/50 mb-1">Time Left</p>
                  <p className="text-sm text-white">{proposal.timeLeft}</p>
                </div>
              </div>

              {/* Vote Progress Bar */}
              <div className="mb-4">
                <div className="w-full h-2 bg-[#0B1437] rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-emerald-500"
                    style={{ width: `${(parseFloat(proposal.votesFor.replace(/,/g, '')) / (parseFloat(proposal.votesFor.replace(/,/g, '')) + parseFloat(proposal.votesAgainst.replace(/,/g, '')))) * 100}%` }}
                  ></div>
                  <div 
                    className="h-full bg-red-500"
                    style={{ width: `${(parseFloat(proposal.votesAgainst.replace(/,/g, '')) / (parseFloat(proposal.votesFor.replace(/,/g, '')) + parseFloat(proposal.votesAgainst.replace(/,/g, '')))) * 100}%` }}
                  ></div>
                </div>
              </div>

              {proposal.status === "active" && (
                <div className="flex items-center gap-3">
                  <Button className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30">
                    Vote For
                  </Button>
                  <Button className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30">
                    Vote Against
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
