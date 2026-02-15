import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import  Sidebar  from "./layout/Sidebar";
import  TopBar  from "./layout/Topbar";
import  Dashboard  from "./pages/Dashboard";
import  Borrow  from "./components/Borrow";
import  ProvideCredit  from "./pages/ProvideCredit";
import  Pools  from "./pages/Pools";
import  Insurance  from "./pages/Insurance";
import  LandingPage  from "./pages/LandingPage"; 
import  Footer  from "./layout/Footer";   
import WalletConnectModal from "./components/WalletConnectModal"; 

function App() {
  const { isConnected } = useAccount();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [connectOpen, setConnectOpen] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      setCurrentPage("landing");
    } else if (currentPage === "landing") {
      setCurrentPage("dashboard");
    }
  }, [isConnected]); 

  const renderPage = () => {
    switch (currentPage) {
      case "landing":
        return <LandingPage onLaunchApp={() => setConnectOpen(true)} />;
      case "dashboard":
        return <Dashboard />;
      case "borrow":
        return <Borrow />;
      case "provide":
        return <ProvideCredit />;
      case "pools":
        return <Pools />;
      case "insurance":
        return <Insurance />;
      default:
        return <Dashboard />;
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-[#01060f] min-h-screen">
      <LandingPage onLaunchApp={() => setConnectOpen(true)} />
      <WalletConnectModal open={connectOpen} onClose={() => setConnectOpen(false)} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0B1437] overflow-hidden">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopBar onOpenConnect={() => setConnectOpen(true)}/>
        <main className="flex-1 overflow-y-auto p-8 mb-12">
          {renderPage()}
        </main>
        <Footer />
      </div>
      <WalletConnectModal open={connectOpen} onClose={() => setConnectOpen(false)} />
    </div>
  );
}

export default App;