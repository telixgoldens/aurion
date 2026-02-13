import { useState } from "react";
import { Sidebar } from "./layout/Sidebar";
import { TopBar } from "./layout/Topbar";
import { Dashboard } from "./pages/Dashboard";
import { Borrow } from "./pages/Borrow";
import { ProvideCredit } from "./pages/ProvideCredit";
import { Pools } from "./pages/Pools";
import { Insurance } from "./pages/Insurance";
import { LandingPage } from "./pages/LandingPage"; 
import { AppFooter } from "./layout/AppFooter";    

function App() {
  const [currentPage, setCurrentPage] = useState("landing");
  const renderPage = () => {
    switch (currentPage) {
      case "landing":
        return <LandingPage onEnterApp={() => setCurrentPage("dashboard")} />;
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
        return <LandingPage />;
    }
  };

  // Conditional Layout: Landing page doesn't get Sidebar/TopBar
  if (currentPage === "landing") {
    return <div className="bg-[#01060f]">{renderPage()}</div>;
  }

  return (
    <div className="flex h-screen bg-[#0B1437] overflow-hidden">
      {/* Sidebar - Visible only in-app */}
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Bar - Visible only in-app */}
        <TopBar />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 mb-12">
          {renderPage()}
        </main>

        {/* Minimal App Footer - Positioned at bottom of main area */}
        <AppFooter />
      </div>
    </div>
  );
}

export default App;