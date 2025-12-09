import { Bell, Menu, Settings } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <nav 
      className="sticky top-0 z-30 backdrop-blur-md border-b"
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(10, 42, 67, 0.1)',
      }}
    >
      <div className="flex items-center justify-between p-4 md:p-6">
        {/* User Info (Left Side in RTL) */}
        <div className="flex items-center gap-3">
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
            alt="User"
            className="w-10 h-10 rounded-full ring-2 ring-sky-400/30"
          />
          <div className="hidden md:block">
            <p className="font-semibold" style={{ color: '#0A2A43' }}>
              أحمد محمد
            </p>
            <p className="text-sm text-gray-500">مدير النظام</p>
          </div>
        </div>

        {/* Actions (Right Side in RTL) */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button 
            className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
            style={{ color: '#0A2A43' }}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Settings */}
          <button 
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors hidden md:block"
            style={{ color: '#0A2A43' }}
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors lg:hidden"
            style={{ color: '#0A2A43' }}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
