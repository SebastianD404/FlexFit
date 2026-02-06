'use client';

import { LogOut, User, Settings, HelpCircle, LayoutDashboard, Heart } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useState } from 'react';

interface UserAccountMenuProps {
  displayName: string;
  onLogout: () => void;
}

export function UserAccountMenu({ displayName, onLogout }: UserAccountMenuProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button 
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-full font-medium transition-all duration-200 group border relative overflow-hidden"
          style={{
            backgroundColor: isPressed ? 'rgba(168, 153, 104, 0.2)' : 'transparent',
            borderColor: '#a89968',
            color: '#ffffff',
            transform: isPressed ? 'scale(0.95)' : 'scale(1)',
            boxShadow: isPressed ? 'inset 0 2px 8px rgba(0, 0, 0, 0.3)' : '0 0 0 rgba(168, 153, 104, 0)',
          }}
        >
          {/* Animated background on hover */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-[#a89968]/20 via-[#c4a962]/20 to-[#a89968]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              animation: 'shimmer 2s infinite',
            }}
          />
          
          {/* Glow effect on hover */}
          <div 
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"
            style={{
              backgroundColor: 'rgba(168, 153, 104, 0.3)',
              transform: 'scale(1.1)',
            }}
          />

          <div className="relative w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: '#a89968', borderColor: '#d4c4a0' }}>
            <User className="w-4.5 h-4.5 text-white transition-transform duration-300 group-hover:scale-110" />
          </div>
          <span className="relative text-sm font-semibold truncate max-w-[100px] transition-colors duration-300 group-hover:text-[#d4c4a0]">{displayName}</span>
          
          {/* Pulse effect on click */}
          {isPressed && (
            <div 
              className="absolute inset-0 rounded-full border-2 animate-ping"
              style={{ borderColor: '#a89968', opacity: 0.5 }}
            />
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          className="rounded-2xl shadow-2xl border animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
          style={{
            backgroundColor: '#1a1a1a',
            borderColor: '#333333',
            width: '320px',
            zIndex: 1000,
          }}
          sideOffset={12}
          align="end"
        >
          {/* Profile Header Section */}
          <div 
            className="p-4 border-b"
            style={{ 
              borderColor: '#333333',
              background: 'linear-gradient(135deg, #a89968/10 0%, #8f7d63/5 100%)'
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#a89968' }}
              >
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {displayName}
                </p>
                <p className="text-xs" style={{ color: '#a89968' }}>
                  View your account
                </p>
              </div>
            </div>
          </div>

          {/* Main Menu Section */}
          <div className="py-2">
            <DropdownMenu.Item asChild>
              <button 
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors duration-150 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#a89968/20' }}>
                  <LayoutDashboard className="w-4 h-4" style={{ color: '#a89968' }} />
                </div>
                <span className="font-medium">Dashboard</span>
              </button>
            </DropdownMenu.Item>

            <DropdownMenu.Item asChild>
              <button 
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors duration-150 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#a89968/20' }}>
                  <User className="w-4 h-4" style={{ color: '#a89968' }} />
                </div>
                <span className="font-medium">Profile</span>
              </button>
            </DropdownMenu.Item>

            <DropdownMenu.Item asChild>
              <button 
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors duration-150 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#a89968/20' }}>
                  <Heart className="w-4 h-4" style={{ color: '#a89968' }} />
                </div>
                <span className="font-medium">My Workouts</span>
              </button>
            </DropdownMenu.Item>
          </div>

          {/* Separator */}
          <div style={{ borderColor: '#333333', borderTopWidth: '1px' }} />

          {/* Settings & Support Section */}
          <div className="py-2">
            <DropdownMenu.Item asChild>
              <button 
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors duration-150 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#a89968/20' }}>
                  <Settings className="w-4 h-4" style={{ color: '#a89968' }} />
                </div>
                <span className="font-medium">Settings & Privacy</span>
              </button>
            </DropdownMenu.Item>

            <DropdownMenu.Item asChild>
              <button 
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors duration-150 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#a89968/20' }}>
                  <HelpCircle className="w-4 h-4" style={{ color: '#a89968' }} />
                </div>
                <span className="font-medium">Help & Support</span>
              </button>
            </DropdownMenu.Item>
          </div>

          {/* Separator */}
          <div style={{ borderColor: '#333333', borderTopWidth: '1px' }} />

          {/* Logout Section */}
          <div className="py-2">
            <DropdownMenu.Item asChild>
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-150 cursor-pointer hover:bg-red-600/10"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-600/20">
                  <LogOut className="w-4 h-4 text-red-400" />
                </div>
                <span style={{ color: '#ff6b6b' }}>Log Out</span>
              </button>
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
