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
];

const helpItems = [
  { id: 'docs', label: 'Docs', icon: BookOpen },
  { id: 'help', label: 'Help', icon: HelpCircle },
];

function Sidebar({ currentPage, onNavigate }) {
  return (
    <div className="w-64 min-h-screen bg-[#0a0e17] border-r border-[#d4af37]/20 flex flex-col shadow-2xl z-20">
      <div className="px-6 py-8 border-b border-[#d4af37]/20">
        <h1 className="text-2xl font-bold text-white tracking-tight">AURION</h1>
        <p className="text-[10px] text-[#d4af37] uppercase tracking-widest mt-1">Credit Abstraction</p>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 shadow-lg shadow-[#d4af37]/5' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#d4af37]' : ''}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="px-4 pb-6 space-y-2 border-t border-[#d4af37]/10 pt-6">
        <p className="px-4 text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-2">Support</p>
        {helpItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
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

export default Sidebar;