'use client';

import React, { use } from 'react';
import useSWR from 'swr';
import { useNetwork } from '../../network-provider';
import { Activity, ArrowDown, ArrowUp, Clock, DollarSign, BarChart3, List, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MarketPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = use(params);
  const { baseUrl } = useNetwork();
  
  const { data: infoData } = useSWR(`${baseUrl}/info`, fetcher);
  const { data: pricesData } = useSWR(`${baseUrl}/info/prices`, fetcher);
  const { data: tradesData } = useSWR(`${baseUrl}/trades?symbol=${symbol}`, fetcher, { refreshInterval: 5000 });
  const { data: bookData } = useSWR(`${baseUrl}/book?symbol=${symbol}`, fetcher, { refreshInterval: 5000 });
  const { data: fundingData } = useSWR(`${baseUrl}/funding_rate/history?symbol=${symbol}&limit=10`, fetcher);

  const marketInfo = infoData?.data?.find((m: any) => m.symbol === symbol);
  const priceInfo = pricesData?.data?.find((p: any) => p.symbol === symbol);
  const trades = tradesData?.data || [];
  const book = bookData?.data || { l: [[], []] };
  const fundingHistory = fundingData?.data || [];

  if (!marketInfo && infoData) return <div className="p-8 text-center text-zinc-400">Market not found</div>;
  if (!marketInfo || !priceInfo) return <div className="flex justify-center items-center h-64"><Activity className="w-8 h-8 text-emerald-500 animate-spin" /></div>;

  const bids = book.l[0] || [];
  const asks = book.l[1] || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-white/10">
              <span className="text-sm font-bold text-zinc-300">{symbol.substring(0, 2)}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">{symbol}-USD</h1>
          </div>
          <div className="mt-2 flex items-center gap-4 text-sm text-zinc-400">
            <span className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Mark: <span className="font-mono text-zinc-300">{parseFloat(priceInfo.mark).toFixed(4)}</span>
            </span>
            <span className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              24h Vol: <span className="font-mono text-zinc-300">${parseFloat(priceInfo.volume_24h).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </span>
            <span className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              OI: <span className="font-mono text-zinc-300">${parseFloat(priceInfo.open_interest).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-2xl font-mono font-bold text-white">
            ${parseFloat(priceInfo.oracle).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
          </div>
          <div className="text-sm text-zinc-400">Oracle Price</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Market Info */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <BookOpen className="h-5 w-5 text-emerald-500" />
            Market Details
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <dt className="text-zinc-400">Tick Size</dt>
              <dd className="font-mono text-zinc-300">{marketInfo.tick_size}</dd>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <dt className="text-zinc-400">Lot Size</dt>
              <dd className="font-mono text-zinc-300">{marketInfo.lot_size}</dd>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <dt className="text-zinc-400">Max Leverage</dt>
              <dd className="font-mono text-zinc-300">{marketInfo.max_leverage}x</dd>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <dt className="text-zinc-400">Min Order Size</dt>
              <dd className="font-mono text-zinc-300">${marketInfo.min_order_size}</dd>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <dt className="text-zinc-400">Max Order Size</dt>
              <dd className="font-mono text-zinc-300">${marketInfo.max_order_size}</dd>
            </div>
            <div className="flex justify-between pt-1">
              <dt className="text-zinc-400">Funding Rate</dt>
              <dd className="font-mono text-emerald-400">{(parseFloat(marketInfo.funding_rate) * 100).toFixed(4)}%</dd>
            </div>
          </dl>
        </div>

        {/* Orderbook */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-sm lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <List className="h-5 w-5 text-emerald-500" />
            Orderbook
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="mb-2 flex justify-between text-xs font-medium text-zinc-500">
                <span>Size</span>
                <span>Bid Price</span>
              </div>
              <div className="space-y-1">
                {bids.slice(0, 10).map((bid: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm font-mono">
                    <span className="text-zinc-400">{parseFloat(bid.a).toFixed(4)}</span>
                    <span className="text-emerald-400">{parseFloat(bid.p).toFixed(2)}</span>
                  </div>
                ))}
                {bids.length === 0 && <div className="text-center text-sm text-zinc-500 py-4">No bids</div>}
              </div>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-xs font-medium text-zinc-500">
                <span>Ask Price</span>
                <span>Size</span>
              </div>
              <div className="space-y-1">
                {asks.slice(0, 10).map((ask: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm font-mono">
                    <span className="text-red-400">{parseFloat(ask.p).toFixed(2)}</span>
                    <span className="text-zinc-400">{parseFloat(ask.a).toFixed(4)}</span>
                  </div>
                ))}
                {asks.length === 0 && <div className="text-center text-sm text-zinc-500 py-4">No asks</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Trades */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Activity className="h-5 w-5 text-emerald-500" />
            Recent Trades
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs text-zinc-500">
                <tr>
                  <th className="pb-2 font-medium">Time</th>
                  <th className="pb-2 font-medium text-right">Price</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {trades.slice(0, 10).map((trade: any, i: number) => {
                  const isBuy = trade.side.includes('long'); // simplistic check
                  return (
                    <tr key={i}>
                      <td className="py-2 text-zinc-400">{format(new Date(trade.created_at), 'HH:mm:ss')}</td>
                      <td className={`py-2 text-right ${isBuy ? 'text-emerald-400' : 'text-red-400'}`}>
                        {parseFloat(trade.price).toFixed(2)}
                      </td>
                      <td className="py-2 text-right text-zinc-300">{parseFloat(trade.amount).toFixed(4)}</td>
                    </tr>
                  );
                })}
                {trades.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-zinc-500">No recent trades</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Funding History */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Clock className="h-5 w-5 text-emerald-500" />
            Funding History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs text-zinc-500">
                <tr>
                  <th className="pb-2 font-medium">Time</th>
                  <th className="pb-2 font-medium text-right">Oracle Price</th>
                  <th className="pb-2 font-medium text-right">Funding Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {fundingHistory.map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="py-2 text-zinc-400">{format(new Date(item.created_at), 'MMM d, HH:mm')}</td>
                    <td className="py-2 text-right text-zinc-300">{parseFloat(item.oracle_price).toFixed(2)}</td>
                    <td className={`py-2 text-right ${parseFloat(item.funding_rate) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {(parseFloat(item.funding_rate) * 100).toFixed(4)}%
                    </td>
                  </tr>
                ))}
                {fundingHistory.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-zinc-500">No funding history</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
