import { Home, Building2, DoorOpen, FileText, CreditCard, Wrench, Brain, Settings, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'الرئيسية', path: '/' },
    { icon: Building2, label: 'العقارات', path: '/properties' },
    { icon: DoorOpen, label: 'الوحدات', path: '/units' },
    { icon: FileText, label: 'العقود', path: '/contracts' },
    { icon: CreditCard, label: 'الفواتير والدفع', path: '/billing' },
    { icon: Wrench, label: 'الصيانة', path: '/maintenance' },
    { icon: Brain, label: 'ذكاء اصطناعي', path: '/ai' },
    { icon: Settings, label: 'الإعدادات', path: '/settings' },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 right-0 h-full w-64 z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: 'linear-gradient(180deg, #0A2A43 0%, #0d3a5a 100%)',
        }}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold">إدارة العقارات</h1>
              <p className="text-xs text-blue-200">نظام متكامل</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path || 
                           (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <button
                key={index}
                onClick={() => handleNavigate(item.path)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-sky-400/20 to-cyan-400/20 text-white shadow-lg' 
                    : 'text-blue-100 hover:bg-white/5'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}