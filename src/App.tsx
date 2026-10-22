import React, { useState, useEffect } from 'react';
import { Bus, Accessibility } from 'lucide-react';

interface NextBusInfo {
  OriginCode?: string;
  DestinationCode?: string;
  EstimatedArrival?: string;
  Latitude?: string;
  Longitude?: string;
  VisitNumber?: string;
  Load?: 'SEA' | 'SDA' | 'LSD' | string;
  Feature?: 'WAB' | string;
  Type?: 'SD' | 'DD' | 'BD' | string;
}

interface BusService {
  ServiceNo: string;
  Operator: string;
  NextBus?: NextBusInfo;
  NextBus2?: NextBusInfo;
  NextBus3?: NextBusInfo;
}

interface BusArrivalApiResponse {
  'odata.metadata'?: string;
  BusStopCode: string;
  Services: BusService[];
  isMock?: boolean;
}

export default function App() {
  const [data, setData] = useState<BusArrivalApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Read bus stop code or account key from URL search parameters if provided (e.g. ?BusStopCode=83139&AccountKey=...)
  const getParams = () => {
    if (typeof window === 'undefined') return { stopCode: '83139', accountKey: '' };
    const params = new URLSearchParams(window.location.search);
    return {
      stopCode: params.get('BusStopCode') || params.get('busstopcode') || '83139',
      accountKey: params.get('AccountKey') || params.get('accountkey') || params.get('key') || '',
    };
  };

  const fetchArrivals = async () => {
    const { stopCode, accountKey } = getParams();
    try {
      const headers: Record<string, string> = {
        accept: 'application/json',
      };
      if (accountKey) {
        headers['AccountKey'] = accountKey;
      }

      const res = await fetch(`/api/busarrival?BusStopCode=${encodeURIComponent(stopCode)}`, {
        headers,
      });

      if (res.ok) {
        const json: BusArrivalApiResponse = await res.json();
        if (json && Array.isArray(json.Services)) {
          setData(json);
        }
      }
    } catch (err) {
      console.error('Error fetching arrivals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArrivals();
    // Auto-refresh arrivals in background every 30 seconds
    const interval = setInterval(fetchArrivals, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatArrival = (isoString?: string) => {
    if (!isoString) return { label: '-', isArr: false, minutes: 999 };
    const diffMs = new Date(isoString).getTime() - Date.now();
    const minutes = Math.round(diffMs / (60 * 1000));
    if (minutes <= 0) return { label: 'Arr', isArr: true, minutes: 0 };
    if (minutes === 1) return { label: '1m', isArr: false, minutes: 1 };
    return { label: `${minutes}m`, isArr: false, minutes };
  };

  const getLoadBadge = (load?: string) => {
    switch (load) {
      case 'SEA':
        return { text: 'Seats', cls: 'text-emerald-400 bg-emerald-950/70 border-emerald-800' };
      case 'SDA':
        return { text: 'Standing', cls: 'text-amber-400 bg-amber-950/70 border-amber-800' };
      case 'LSD':
        return { text: 'Crowded', cls: 'text-rose-400 bg-rose-950/70 border-rose-800' };
      default:
        return { text: '', cls: '' };
    }
  };

  const services = data?.Services || [];
  const sortedServices = [...services].sort((a, b) => {
    const numA = parseInt(a.ServiceNo, 10);
    const numB = parseInt(b.ServiceNo, 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.ServiceNo.localeCompare(b.ServiceNo);
  });

  const stopCode = data?.BusStopCode || getParams().stopCode;

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center overflow-hidden font-arial-12 select-none">
      {/* 
        The only element on the UI: Scrolling section.
        Scrolls from left to right at slow speed.
        Arial font, size 12.
      */}
      <div
        className="ticker-container w-full bg-neutral-900 border-y-2 border-amber-500 py-3 overflow-hidden relative shadow-2xl"
        style={{
          // Slow scrolling speed (70 seconds per loop)
          '--ticker-duration': '70s',
          '--hover-play-state': 'running',
        } as React.CSSProperties}
      >
        {/* Subtle edge fades */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-neutral-900 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-neutral-900 to-transparent z-10" />

        {/* Scrolling track: moves from Right to Left */}
        <div className="ticker-track-rtl">
          {/* Duplicated 2 times for exact 50% seamless continuous loop */}
          {[0, 1].map((loopIdx) => (
            <div key={loopIdx} className="flex items-center shrink-0">
              {/* Bus Stop Identifier Tag */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 mx-2 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold tracking-wider uppercase font-arial-12">
                <Bus className="h-3 w-3 text-amber-400" />
                <span>BUS STOP {stopCode}</span>
              </div>

              {sortedServices.length === 0 ? (
                <div className="px-4 py-1 text-neutral-400 italic font-arial-12">
                  {loading ? 'Loading bus arrival times...' : 'No services active'}
                </div>
              ) : (
                sortedServices.map((svc) => {
                  const nb1 = formatArrival(svc.NextBus?.EstimatedArrival);
                  const nb2 = formatArrival(svc.NextBus2?.EstimatedArrival);
                  const nb3 = formatArrival(svc.NextBus3?.EstimatedArrival);
                  const load1 = getLoadBadge(svc.NextBus?.Load);

                  return (
                    <div
                      key={`${loopIdx}-${svc.ServiceNo}`}
                      className="inline-flex items-center gap-2.5 px-3.5 py-1.5 mx-2 rounded bg-neutral-950/90 border border-neutral-800 shadow-sm font-arial-12 whitespace-nowrap"
                    >
                      {/* Bus Service Number */}
                      <span className="inline-flex items-center justify-center font-bold px-2 py-0.5 rounded bg-amber-500 text-black">
                        {svc.ServiceNo}
                      </span>

                      {/* Next Arrival */}
                      <span className="text-neutral-400">Next:</span>
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded ${
                          nb1.isArr
                            ? 'bg-rose-900 text-rose-200 animate-pulse'
                            : nb1.minutes <= 3
                            ? 'bg-amber-900 text-amber-200'
                            : 'bg-neutral-800 text-neutral-100'
                        }`}
                      >
                        {nb1.label}
                      </span>

                      {/* Load indicator */}
                      {load1.text && (
                        <span
                          className={`px-1.5 py-0.5 rounded border text-[11px] ${load1.cls}`}
                        >
                          {load1.text}
                        </span>
                      )}

                      {svc.NextBus?.Feature === 'WAB' && (
                        <Accessibility className="h-3 w-3 text-sky-400 shrink-0" />
                      )}

                      {/* Subsequent Buses */}
                      {(svc.NextBus2?.EstimatedArrival || svc.NextBus3?.EstimatedArrival) && (
                        <span className="text-neutral-400 border-l border-neutral-800 pl-2 space-x-2">
                          {svc.NextBus2?.EstimatedArrival && (
                            <span>
                              2nd: <strong className="text-neutral-200">{nb2.label}</strong>
                            </span>
                          )}
                          {svc.NextBus3?.EstimatedArrival && (
                            <span>
                              3rd: <strong className="text-neutral-200">{nb3.label}</strong>
                            </span>
                          )}
                        </span>
                      )}

                      {/* Operator Tag */}
                      <span className="text-neutral-500 text-[11px] font-mono">
                        [{svc.Operator}]
                      </span>

                      {/* Ticker separator dot */}
                      <span className="text-amber-500/50 select-none ml-1.5">&bull;</span>
                    </div>
                  );
                })
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
