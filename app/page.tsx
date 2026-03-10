'use client';

import React from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useNetwork } from './network-provider';
import { ArrowRight, TrendingUp, Activity } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HomePage() {
  const { baseUrl } = useNetwork();
  
  const { data: infoData, error: infoError } = useSWR(`${baseUrl}/info`, fetcher);
  const { data: pricesData, error: pricesError } = useSWR(`${baseUrl}/info/prices`, fetcher);

  const isLoading = !infoData || !pricesData;
  const error = infoError || pricesError;

  if (error) return <div className="text-red-400 p-4 bg-red-400/10 rounded-xl border border-red-400/20">Failed to load market data. Please try again later.</div>;
  if (isLoading) return <div className="flex justify-center items-center h-64"><Activity className="w-8 h-8 text-emerald-500 animate-spin" /></div>;

  const markets = infoData?.data || [];
  const prices = pricesData?.data || [];

  // Merge market info with prices
  const mergedMarkets = markets.map((market: any) => {
    const priceInfo = prices.find((p: any) => p.symbol === market.symbol) || {};
    return { ...market, ...priceInfo };
  });

  // Sort by 24h volume descending
  mergedMarkets.sort((a: any, b: any) => parseFloat(b.volume_24h || '0') - parseFloat(a.volume_24h || '0'));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Markets Overview</h1>
          <p className="text-zinc-400 mt-1">Explore trading pairs, prices, and volumes on Pacifica.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-900/50 overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-zinc-900/80 text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Market</th>
                <th className="px-6 py-4 font-medium text-right">Price</th>
                <th className="px-6 py-4 font-medium text-right">24h Volume</th>
                <th className="px-6 py-4 font-medium text-right">Open Interest</th>
                <th className="px-6 py-4 font-medium text-right">Funding Rate</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mergedMarkets.map((market: any) => {
                const price = parseFloat(market.mark || market.oracle || '0');
                const volume = parseFloat(market.volume_24h || '0');
                const oi = parseFloat(market.open_interest || '0');
                const funding = parseFloat(market.funding_rate || '0');
                
                return (
                  <tr key={market.symbol} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-white/10">
                          <span className="text-xs font-bold text-zinc-300">{market.symbol.substring(0, 2)}</span>
                        </div>
                        <span className="font-medium text-white">{market.symbol}-USD</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-zinc-300">
                      ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-zinc-400">
                      ${volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-zinc-400">
                      ${oi.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono">
                      <span className={funding > 0 ? 'text-emerald-400' : funding < 0 ? 'text-red-400' : 'text-zinc-400'}>
                        {(funding * 100).toFixed(4)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link 
                        href={`/market/${market.symbol}`}
                        className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
                      >
                        Details
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
