import { useState } from "react";
import  Sidebar  from "./layout/Sidebar";
import  TopBar  from "./layout/Topbar";
import  Dashboard  from "./pages/Dashboard";
import  Borrow  from "./components/Borrow";
import  ProvideCredit  from "./pages/ProvideCredit";
import  Pools  from "./pages/Pools";
import  Insurance  from "./pages/Insurance";
import  LandingPage  from "./pages/LandingPage"; 
import  Footer  from "./layout/Footer";    

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

  if (currentPage === "landing") {
    return <div className="bg-[#01060f]">{renderPage()}</div>;
  }

  return (
    <div className="flex h-screen bg-[#0B1437] overflow-hidden">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-8 mb-12">
          {renderPage()}
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;