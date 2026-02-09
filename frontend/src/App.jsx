import { useState } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { Dashboard } from "./components/pages/Dashboard";
import { Borrow } from "./components/pages/Borrow";
import { ProvideCredit } from "./components/pages/ProvideCredit";
import { Pools } from "./components/pages/Pools";
import { Insurance } from "./components/pages/Insurance";
import { Governance } from "./components/pages/Governance";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderPage = () => {
    switch (currentPage) {
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
      case "governance":
        return <Governance />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0B1437] overflow-hidden">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
export default App;