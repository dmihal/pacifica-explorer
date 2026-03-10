'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Activity, Globe } from 'lucide-react';
import { useNetwork } from './network-provider';

export function Navigation() {
  const { network, setNetwork } = useNetwork();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // Determine what the user is searching for
    // If it's a number, assume it's an Order ID
    if (/^\d+$/.test(query)) {
      router.push(`/order/${query}`);
    } 
    // If it's a long alphanumeric string, assume it's an Account Address
    else if (query.length > 20) {
      router.push(`/account/${query}`);
    } 
    // Otherwise, assume it's a Market Symbol
    else {
      router.push(`/market/${query.toUpperCase()}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-white mr-8">
          <Activity className="h-6 w-6 text-emerald-500" />
          <span className="text-lg font-bold tracking-tight">Pacifica Explorer</span>
        </Link>
        
        <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
          <div className="w-full max-w-lg lg:max-w-xs">
            <form onSubmit={handleSearch} className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-zinc-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-0 bg-zinc-900 py-1.5 pl-10 pr-3 text-zinc-300 ring-1 ring-inset ring-zinc-800 placeholder:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6"
                placeholder="Search Account, Order ID, or Market"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
        </div>
        
        <div className="ml-4 flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-zinc-900 p-1 ring-1 ring-zinc-800">
            <button
              onClick={() => setNetwork('mainnet')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                network === 'mainnet' 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              Mainnet
            </button>
            <button
              onClick={() => setNetwork('testnet')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                network === 'testnet' 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              Testnet
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
