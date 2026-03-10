'use client';

import React, { use } from 'react';
import useSWR from 'swr';
import { useNetwork } from '../../network-provider';
import { Activity, FileText, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { baseUrl } = useNetwork();
  
  const { data: orderData, error } = useSWR(`${baseUrl}/orders/history_by_id?order_id=${id}`, fetcher);

  const isLoading = !orderData && !error;
  const history = orderData?.data || [];

  if (error) return <div className="text-red-400 p-4 bg-red-400/10 rounded-xl border border-red-400/20">Failed to load order data. Please try again later.</div>;
  if (isLoading) return <div className="flex justify-center items-center h-64"><Activity className="w-8 h-8 text-emerald-500 animate-spin" /></div>;

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-zinc-900/50 rounded-2xl border border-white/10">
        <FileText className="h-12 w-12 text-zinc-600 mb-4" />
        <h2 className="text-xl font-semibold text-white">Order Not Found</h2>
        <p className="text-zinc-400 mt-2">Could not find any history for order ID {id}</p>
      </div>
    );
  }

  // Get the most recent state (first item typically, but let's sort by created_at desc just in case)
  const sortedHistory = [...history].sort((a, b) => b.created_at - a.created_at);
  const latestState = sortedHistory[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-white/10">
              <FileText className="h-5 w-5 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono">Order #{id}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-md px-2.5 py-1.5 text-sm font-medium ring-1 ring-inset ${
            latestState.order_status === 'filled' ? 'bg-emerald-400/10 text-emerald-400 ring-emerald-400/20' : 
            latestState.order_status === 'cancelled' || latestState.order_status === 'rejected' ? 'bg-red-400/10 text-red-400 ring-red-400/20' : 
            'bg-blue-400/10 text-blue-400 ring-blue-400/20'
          }`}>
            {latestState.order_status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Order Details */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-sm lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold text-white">Order Details</h2>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-zinc-500 mb-1">Market</dt>
              <dd>
                <Link href={`/market/${latestState.symbol}`} className="inline-flex items-center gap-1 font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                  {latestState.symbol}-USD
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500 mb-1">Side</dt>
              <dd>
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${latestState.side === 'bid' ? 'bg-emerald-400/10 text-emerald-400 ring-emerald-400/20' : 'bg-red-400/10 text-red-400 ring-red-400/20'}`}>
                  {latestState.side.toUpperCase()}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500 mb-1">Type</dt>
              <dd className="font-medium text-zinc-300 capitalize">{latestState.order_type.replace('_', ' ')}</dd>
            </div>
            <div>
              <dt className="text-zinc-500 mb-1">Price</dt>
              <dd className="font-mono text-zinc-300">${parseFloat(latestState.price).toFixed(4)}</dd>
            </div>
            <div>
              <dt className="text-zinc-500 mb-1">Initial Amount</dt>
              <dd className="font-mono text-zinc-300">{parseFloat(latestState.initial_amount).toFixed(4)}</dd>
            </div>
            <div>
              <dt className="text-zinc-500 mb-1">Filled Amount</dt>
              <dd className="font-mono text-zinc-300">{parseFloat(latestState.filled_amount).toFixed(4)}</dd>
            </div>
            <div>
              <dt className="text-zinc-500 mb-1">Cancelled Amount</dt>
              <dd className="font-mono text-zinc-300">{parseFloat(latestState.cancelled_amount).toFixed(4)}</dd>
            </div>
            {latestState.client_order_id && (
              <div>
                <dt className="text-zinc-500 mb-1">Client Order ID</dt>
                <dd className="font-mono text-xs text-zinc-400 break-all">{latestState.client_order_id}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Order History Timeline */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-sm lg:col-span-2">
          <h2 className="mb-6 text-lg font-semibold text-white">Event History</h2>
          <div className="relative border-l border-white/10 ml-3 space-y-8">
            {sortedHistory.map((event: any, i: number) => (
              <div key={i} className="relative pl-6">
                <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-zinc-800 ring-2 ring-zinc-950 border border-emerald-500/50" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white capitalize">{event.event_type.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-zinc-500 font-mono">ID: {event.history_id}</span>
                  </div>
                  <span className="text-sm text-zinc-400">{format(new Date(event.created_at), 'MMM d, yyyy HH:mm:ss.SSS')}</span>
                </div>
                <div className="bg-zinc-900/80 rounded-lg p-4 border border-white/5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-zinc-500 text-xs mb-1">Status</div>
                      <div className="text-zinc-300 capitalize">{event.order_status}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500 text-xs mb-1">Price</div>
                      <div className="font-mono text-zinc-300">${parseFloat(event.price).toFixed(4)}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500 text-xs mb-1">Filled</div>
                      <div className="font-mono text-zinc-300">{parseFloat(event.filled_amount).toFixed(4)}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500 text-xs mb-1">Cancelled</div>
                      <div className="font-mono text-zinc-300">{parseFloat(event.cancelled_amount).toFixed(4)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
