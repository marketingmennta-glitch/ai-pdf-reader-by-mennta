import React, { useState } from 'react';
import { Settings, Shield, User, HardDrive, Sparkles, Check, Lock, Key } from 'lucide-react';
import { UserProfile } from '../types/pdfak';

interface SettingsModalProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  user,
  onUpdateUser,
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [twoFactor, setTwoFactor] = useState(user.twoFactorEnabled);
  const [savedMessage, setSavedMessage] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name,
      email,
      twoFactorEnabled: twoFactor,
    });
    setSavedMessage('Settings updated successfully!');
    setTimeout(() => setSavedMessage(''), 2500);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Account & Enterprise Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Manage profile information, 2FA security, storage plan, and Gemini AI status.</p>
      </div>

      {savedMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold text-center flex items-center justify-center space-x-2">
          <Check className="w-4 h-4" />
          <span>{savedMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Profile Details */}
        <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4 bg-black/40">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <User className="w-4 h-4 text-blue-400" />
            <span>Profile Identity</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>
          </div>
        </div>

        {/* Security & 2FA */}
        <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4 bg-black/40">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span>Security & Authentication</span>
          </h3>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <div>
              <p className="text-xs font-bold text-white">Two-Factor Authentication (2FA)</p>
              <p className="text-[10px] text-gray-400">Require FIDO2 / WebAuthn code on every login</p>
            </div>
            <input
              type="checkbox"
              checked={twoFactor}
              onChange={(e) => setTwoFactor(e.target.checked)}
              className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-blue-600 cursor-pointer"
            />
          </div>
        </div>

        {/* AI & Cloud Integration Status */}
        <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4 bg-black/40">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Gemini AI Runtime Environment</span>
          </h3>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold">Gemini 3.6 Flash Server Key Active</span>
            </div>
            <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded font-mono">Managed via Settings &gt; Secrets</span>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
        >
          Save Settings Changes
        </button>

      </form>

    </div>
  );
};
