import React, { useState } from 'react';
import { HelpCircle, X, Play, BookOpen, ShieldAlert } from 'lucide-react';

export const HelpModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating circular trigger button matching Restream screenshot */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 bg-[#162035] hover:bg-[#1E2D4A] border border-[#1E293B] hover:border-slate-500 text-slate-300 hover:text-white px-3.5 py-2 rounded-full shadow-2xl flex items-center space-x-2 text-xs font-semibold transition-all hover:scale-105"
      >
        <HelpCircle className="w-4 h-4 text-blue-400" />
        <span>Need help?</span>
      </button>

      {/* Help dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#111726] border border-[#1E293B] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Flash Live Encoder Guide</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="bg-[#0B0F17] p-3.5 rounded-xl border border-[#1E293B] space-y-1.5">
                <div className="font-bold text-white flex items-center space-x-1.5">
                  <Play className="w-3.5 h-3.5 text-blue-400" />
                  <span>Connecting OBS Studio:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                  <li>Open OBS Studio → Settings → Stream.</li>
                  <li>Set Service to <strong>Custom...</strong></li>
                  <li>Server: paste your Flash Live <strong>RTMP Server Ingest URL</strong>.</li>
                  <li>Stream Key: paste your secured <strong>Stream Key</strong>.</li>
                  <li>Click <strong>Apply</strong>, then click <strong>Start Streaming</strong> in OBS.</li>
                </ol>
              </div>

              <div className="bg-[#0B0F17] p-3.5 rounded-xl border border-[#1E293B] space-y-1.5">
                <div className="font-bold text-white flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Connecting vMix / Wirecast:</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Select Custom RTMP Destination, paste the Ingest URL into URL and Stream Key into Stream Name or Key. Set bitrate to 4000-6000 Kbps.
                </p>
              </div>

              <div className="bg-[#0B0F17] p-3.5 rounded-xl border border-[#1E293B] space-y-1.5">
                <div className="font-bold text-white flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Multi-Destination Relay:</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Toggle on each connected Facebook Page and YouTube Channel on the right panel. All toggled destinations receive your live video stream simultaneously.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
