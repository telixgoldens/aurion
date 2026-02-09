import { 
  LayoutDashboard, 
  TrendingDown, 
  Droplet, 
  Layers, 
  Shield, 
  Vote,
  BookOpen,
  HelpCircle
} from "lucide-react";

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'borrow', label: 'Borrow', icon: TrendingDown },
  { id: 'provide', label: 'Provide Credit', icon: Droplet },
  { id: 'pools', label: 'Pools', icon: Layers },
  { id: 'insurance', label: 'Insurance', icon: Shield },
  { id: 'governance', label: 'Governance', icon: Vote },
];

const helpItems = [
  { id: 'docs', label: 'Docs', icon: BookOpen },
  { id: 'help', label: 'Help', icon: HelpCircle },
];

export default function Sidebar({ currentPage, onNavigate }) {
  return (
    <div className="w-64 h-screen bg-[#0B1437] border-r border-[#D4AF37]/20 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-[#D4AF37]/20">
        <h1 className="text-xl font-semibold text-white">Arbitrum Credit</h1>
        <p className="text-xs text-[#F5DEB3]/60 mt-1">On-Chain Credit Protocol</p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                ${isActive 
                  ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Help Section */}
      <div className="px-3 pb-4 space-y-1 border-t border-[#D4AF37]/20 pt-4">
        {helpItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
