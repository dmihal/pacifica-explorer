'use client';

import React, { use, useState } from 'react';
import useSWR from 'swr';
import { useNetwork } from '../../network-provider';
import { Activity, Wallet, PieChart, List, Clock, ArrowUpRight, ArrowDownRight, History } from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AccountPage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  const { baseUrl } = useNetwork();
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'trades' | 'balance'>('positions');
  
  const { data: accountData } = useSWR(`${baseUrl}/account?account=${address}`, fetcher);
  const { data: positionsData } = useSWR(`${baseUrl}/positions?account=${address}`, fetcher);
  const { data: ordersData } = useSWR(`${baseUrl}/orders?account=${address}`, fetcher);
  const { data: tradesData } = useSWR(`${baseUrl}/trades/history?account=${address}`, fetcher);
  const { data: balanceHistoryData } = useSWR(`${baseUrl}/account/balance/history?account=${address}`, fetcher);
  const { data: portfolioData } = useSWR(`${baseUrl}/portfolio?account=${address}&time_range=7d`, fetcher);

  const account = accountData?.data;
  const positions = positionsData?.data || [];
  const orders = ordersData?.data || [];
  const trades = tradesData?.data || [];
  const balanceHistory = balanceHistoryData?.data || [];
  const portfolio = portfolioData?.data || [];

  if (!account && accountData) return <div className="p-8 text-center text-zinc-400">Account not found</div>;
  if (!account) return <div className="flex justify-center items-center h-64"><Activity className="w-8 h-8 text-emerald-500 animate-spin" /></div>;

  const chartData = [...portfolio].reverse().map((p: any) => ({
    time: format(new Date(p.timestamp), 'MMM d'),
    equity: parseFloat(p.account_equity),
    pnl: parseFloat(p.pnl),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-white/10">
              <Wallet className="h-5 w-5 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono break-all">{address}</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Account Info Cards */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-sm">
          <div className="text-sm font-medium text-zinc-400">Account Equity</div>
          <div className="mt-2 text-3xl font-bold text-white font-mono">
            ${parseFloat(account.account_equity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-sm">
          <div className="text-sm font-medium text-zinc-400">Balance</div>
          <div className="mt-2 text-3xl font-bold text-white font-mono">
            ${parseFloat(account.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-sm">
          <div className="text-sm font-medium text-zinc-400">Available to Spend</div>
          <div className="mt-2 text-3xl font-bold text-white font-mono">
            ${parseFloat(account.available_to_spend).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-sm">
          <div className="text-sm font-medium text-zinc-400">Margin Used</div>
          <div className="mt-2 text-3xl font-bold text-white font-mono">
            ${parseFloat(account.total_margin_used).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Portfolio Chart */}
      {chartData.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-sm h-80">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <PieChart className="h-5 w-5 text-emerald-500" />
            7D Equity History
          </h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
              <XAxis dataKey="time" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '0.5rem' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Line type="monotone" dataKey="equity" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabs */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('positions')}
            className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'positions' ? 'border-b-2 border-emerald-500 text-emerald-400' : 'text-zinc-400 hover:text-zinc-300'}`}
          >
            Positions ({positions.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'orders' ? 'border-b-2 border-emerald-500 text-emerald-400' : 'text-zinc-400 hover:text-zinc-300'}`}
          >
            Open Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('trades')}
            className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'trades' ? 'border-b-2 border-emerald-500 text-emerald-400' : 'text-zinc-400 hover:text-zinc-300'}`}
          >
            Trade History
          </button>
          <button
            onClick={() => setActiveTab('balance')}
            className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'balance' ? 'border-b-2 border-emerald-500 text-emerald-400' : 'text-zinc-400 hover:text-zinc-300'}`}
          >
            Balance History
          </button>
        </div>

        <div className="p-0">
          {activeTab === 'positions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-zinc-900/80 text-zinc-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Market</th>
                    <th className="px-6 py-4 font-medium">Side</th>
                    <th className="px-6 py-4 font-medium text-right">Size</th>
                    <th className="px-6 py-4 font-medium text-right">Entry Price</th>
                    <th className="px-6 py-4 font-medium text-right">Funding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {positions.map((pos: any, i: number) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{pos.symbol}-USD</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${pos.side === 'bid' || pos.side === 'long' ? 'bg-emerald-400/10 text-emerald-400 ring-emerald-400/20' : 'bg-red-400/10 text-red-400 ring-red-400/20'}`}>
                          {pos.side.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-zinc-300">{parseFloat(pos.amount).toFixed(4)}</td>
                      <td className="px-6 py-4 text-right font-mono text-zinc-300">${parseFloat(pos.entry_price).toFixed(2)}</td>
                      <td className={`px-6 py-4 text-right font-mono ${parseFloat(pos.funding) > 0 ? 'text-emerald-400' : parseFloat(pos.funding) < 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                        ${parseFloat(pos.funding).toFixed(4)}
                      </td>
                    </tr>
                  ))}
                  {positions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No open positions</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-zinc-900/80 text-zinc-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Market</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Side</th>
                    <th className="px-6 py-4 font-medium text-right">Price</th>
                    <th className="px-6 py-4 font-medium text-right">Amount</th>
                    <th className="px-6 py-4 font-medium text-right">Filled</th>
                    <th className="px-6 py-4 font-medium text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map((order: any, i: number) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{order.symbol}-USD</td>
                      <td className="px-6 py-4 text-zinc-300 capitalize">{order.order_type.replace('_', ' ')}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${order.side === 'bid' ? 'bg-emerald-400/10 text-emerald-400 ring-emerald-400/20' : 'bg-red-400/10 text-red-400 ring-red-400/20'}`}>
                          {order.side.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-zinc-300">${parseFloat(order.price).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-mono text-zinc-300">{parseFloat(order.initial_amount).toFixed(4)}</td>
                      <td className="px-6 py-4 text-right font-mono text-zinc-300">{parseFloat(order.filled_amount).toFixed(4)}</td>
                      <td className="px-6 py-4 text-right text-zinc-400">{format(new Date(order.created_at), 'MMM d, HH:mm')}</td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">No open orders</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'trades' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-zinc-900/80 text-zinc-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Time</th>
                    <th className="px-6 py-4 font-medium">Market</th>
                    <th className="px-6 py-4 font-medium">Side</th>
                    <th className="px-6 py-4 font-medium text-right">Price</th>
                    <th className="px-6 py-4 font-medium text-right">Amount</th>
                    <th className="px-6 py-4 font-medium text-right">Fee</th>
                    <th className="px-6 py-4 font-medium text-right">PnL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {trades.map((trade: any, i: number) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-zinc-400">{format(new Date(trade.created_at), 'MMM d, HH:mm:ss')}</td>
                      <td className="px-6 py-4 font-medium text-white">{trade.symbol}-USD</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${trade.side.includes('long') ? 'bg-emerald-400/10 text-emerald-400 ring-emerald-400/20' : 'bg-red-400/10 text-red-400 ring-red-400/20'}`}>
                          {trade.side.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-zinc-300">${parseFloat(trade.entry_price).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-mono text-zinc-300">{parseFloat(trade.amount).toFixed(4)}</td>
                      <td className="px-6 py-4 text-right font-mono text-zinc-400">${parseFloat(trade.fee).toFixed(4)}</td>
                      <td className={`px-6 py-4 text-right font-mono ${parseFloat(trade.pnl) > 0 ? 'text-emerald-400' : parseFloat(trade.pnl) < 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                        ${parseFloat(trade.pnl).toFixed(4)}
                      </td>
                    </tr>
                  ))}
                  {trades.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">No trade history</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'balance' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-zinc-900/80 text-zinc-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Time</th>
                    <th className="px-6 py-4 font-medium">Event Type</th>
                    <th className="px-6 py-4 font-medium text-right">Amount Change</th>
                    <th className="px-6 py-4 font-medium text-right">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {balanceHistory.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-zinc-400">{format(new Date(item.created_at), 'MMM d, HH:mm:ss')}</td>
                      <td className="px-6 py-4 text-zinc-300 capitalize">{item.event_type.replace('_', ' ')}</td>
                      <td className={`px-6 py-4 text-right font-mono ${parseFloat(item.amount) > 0 ? 'text-emerald-400' : parseFloat(item.amount) < 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                        {parseFloat(item.amount) > 0 ? '+' : ''}{parseFloat(item.amount).toFixed(4)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-zinc-300">${parseFloat(item.balance).toFixed(4)}</td>
                    </tr>
                  ))}
                  {balanceHistory.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No balance history</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
