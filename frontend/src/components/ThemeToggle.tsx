import React from 'react';
import { Moon, Sun, Leaf } from 'lucide-react';
import { ThemeMode } from '../utils/theme.js';

interface ThemeToggleProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <div className="glass-pill p-1 flex items-center space-x-1 border border-[var(--border)] shadow-sm bg-[var(--surface)]">
      {/* Dark Theme Option */}
      <button
        type="button"
        onClick={() => onThemeChange('dark')}
        className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-all duration-200 ${
          currentTheme === 'dark'
            ? 'bg-[var(--accent)] text-white shadow-md shadow-[var(--accent-glow)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text)]'
        }`}
        title="Apex Dark Navy Theme"
      >
        <Moon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline text-[11px]">Dark</span>
      </button>

      {/* Light Theme Option */}
      <button
        type="button"
        onClick={() => onThemeChange('light')}
        className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-all duration-200 ${
          currentTheme === 'light'
            ? 'bg-[var(--accent)] text-white shadow-md shadow-[var(--accent-glow)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text)]'
        }`}
        title="Clean Pearl Light Theme"
      >
        <Sun className="w-3.5 h-3.5" />
        <span className="hidden sm:inline text-[11px]">Light</span>
      </button>

      {/* Green Mint Theme Option */}
      <button
        type="button"
        onClick={() => onThemeChange('green')}
        className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-all duration-200 ${
          currentTheme === 'green'
            ? 'bg-[var(--accent)] text-white shadow-md shadow-[var(--accent-glow)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text)]'
        }`}
        title="Soft Mint Green Theme"
      >
        <Leaf className="w-3.5 h-3.5" />
        <span className="hidden sm:inline text-[11px]">Green</span>
      </button>
    </div>
  );
};

