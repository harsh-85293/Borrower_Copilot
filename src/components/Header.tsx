import { Scale, ChevronDown, BookOpen, RotateCcw } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { personas } from '@/data/personas';
import type { Persona } from '@/types';

interface HeaderProps {
  onLoadPersona: (persona: Persona) => void;
  onShowRules: () => void;
  onReset: () => void;
}

export function Header({ onLoadPersona, onShowRules, onReset }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-plum-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-plum-600 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5 text-cream" strokeWidth={2} />
          </div>
          <div className="leading-tight">
            <h1 className="text-lg sm:text-xl font-serif font-semibold text-plum-700">
              Borrower Copilot
            </h1>
            <p className="text-[10px] sm:text-xs text-plum-400 font-sans tracking-wide uppercase hidden sm:block">
              Know Before You Owe
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onReset} className="btn-ghost flex items-center gap-1.5 text-sm">
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="btn-secondary flex items-center gap-2 text-sm py-2 px-3 sm:px-4"
            >
              <span className="hidden sm:inline">Quick Load</span>
              <span className="sm:hidden">Persona</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-plum-100 shadow-lg overflow-hidden z-50">
                {personas.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onLoadPersona(p);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-plum-50 transition-colors border-b border-plum-50 last:border-b-0"
                  >
                    <p className="font-medium text-plum-700 text-sm">{p.label}</p>
                    <p className="text-xs text-plum-400">{p.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={onShowRules} className="btn-secondary flex items-center gap-2 text-sm py-2 px-3 sm:px-4">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Rules</span>
          </button>
        </div>
      </div>
    </header>
  );
}
