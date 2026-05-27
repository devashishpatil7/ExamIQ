import React from 'react';
import { cn } from '../lib/utils';
import { Sun, Moon } from 'lucide-react';

export default function SettingsView({ theme, onThemeChange, userName }) {
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    onThemeChange(newTheme);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      <div className="flex items-center gap-4">
        <span className="font-medium">Theme:</span>
        <button onClick={toggleTheme} className="flex items-center gap-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
          {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
          <span className="capitalize">{theme}</span>
        </button>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold">User</h3>
        <p>{userName}</p>
      </div>
    </div>
  );
}
