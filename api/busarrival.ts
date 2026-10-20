import type { Request, Response } from 'express';

export interface NextBusInfo {
  OriginCode?: string;
  DestinationCode?: string;
  EstimatedArrival?: string;
  Latitude?: string;
  Longitude?: string;
  VisitNumber?: string;
  Load?: 'SEA' | 'SDA' | 'LSD' | string; // SEA = Seats Available, SDA = Standing Available, LSD = Limited Standing
  Feature?: 'WAB' | string; // Wheelchair Accessible Bus
  Type?: 'SD' | 'DD' | 'BD' | string; // Single Deck, Double Deck, Bendy
}

export interface BusService {
  ServiceNo: string;
  Operator: string;
  NextBus?: NextBusInfo;
  NextBus2?: NextBusInfo;
  NextBus3?: NextBusInfo;
}

export interface BusArrivalResponse {
  'odata.metadata'?: string;
  BusStopCode: string;
  Services: BusService[];
  isMock?: boolean;
  message?: string;
  error?: string;
}

/**
 * Generates sample live arrival times relative to the current timestamp
 * for preview when AccountKey is not yet configured.
 */
function getSampleBusArrivalData(busStopCode: string): BusArrivalResponse {
  const now = Date.now();
  const makeTime = (offsetMinutes: number) =>
    new Date(now + offsetMinutes * 60 * 1000).toISOString();

  return {
    'odata.metadata': 'https://datamall2.mytransport.sg/ltaodataservice/v3/$metadata#BusArrival',
    BusStopCode: busStopCode,
    isMock: true,
    message: 'Sample data active: Set LTA_ACCOUNT_KEY in environment or provide AccountKey header/input to fetch live LTA Datamall data.',
    Services: [
      {
        ServiceNo: '8',
        Operator: 'SBST',
        NextBus: {
          OriginCode: '52009',
          DestinationCode: '03239',
          EstimatedArrival: makeTime(2),
          Load: 'SEA',
          Feature: 'WAB',
          Type: 'DD',
        },
        NextBus2: {
          OriginCode: '52009',
          DestinationCode: '03239',
          EstimatedArrival: makeTime(11),
          Load: 'SDA',
          Feature: 'WAB',
          Type: 'SD',
        },
        NextBus3: {
          OriginCode: '52009',
          DestinationCode: '03239',
          EstimatedArrival: makeTime(22),
          Load: 'SEA',
          Feature: 'WAB',
          Type: 'DD',
        },
      },
      {
        ServiceNo: '15',
        Operator: 'GAS',
        NextBus: {
          OriginCode: '77009',
          DestinationCode: '77009',
          EstimatedArrival: makeTime(0.5),
          Load: 'SDA',
          Feature: 'WAB',
          Type: 'SD',
        },
        NextBus2: {
          OriginCode: '77009',
          DestinationCode: '77009',
          EstimatedArrival: makeTime(8),
          Load: 'SEA',
          Feature: 'WAB',
          Type: 'SD',
        },
        NextBus3: {
          OriginCode: '77009',
          DestinationCode: '77009',
          EstimatedArrival: makeTime(17),
          Load: 'SEA',
          Feature: 'WAB',
          Type: 'SD',
        },
      },
      {
        ServiceNo: '21',
        Operator: 'SBST',
        NextBus: {
          OriginCode: '77009',
          DestinationCode: '01109',
          EstimatedArrival: makeTime(4),
          Load: 'SEA',
          Feature: 'WAB',
          Type: 'DD',
        },
        NextBus2: {
          OriginCode: '77009',
          DestinationCode: '01109',
          EstimatedArrival: makeTime(14),
          Load: 'SEA',
          Feature: 'WAB',
          Type: 'DD',
        },
        NextBus3: {
          OriginCode: '77009',
          DestinationCode: '01109',
          EstimatedArrival: makeTime(26),
          Load: 'SDA',
          Feature: 'WAB',
          Type: 'SD',
        },
      },
      {
        ServiceNo: '22',
        Operator: 'SBST',
        NextBus: {
          OriginCode: '55009',
          DestinationCode: '75009',
          EstimatedArrival: makeTime(7),
          Load: 'SEA',
          Feature: 'WAB',
          Type: 'SD',
        },
        NextBus2: {
          OriginCode: '55009',
          DestinationCode: '75009',
          EstimatedArrival: makeTime(19),
          Load: 'SEA',
          Feature: 'WAB',
          Type: 'SD',
        },
      },
      {
        ServiceNo: '60',
        Operator: 'SBST',
        NextBus: {
          OriginCode: '84009',
          DestinationCode: '84009',
          EstimatedArrival: makeTime(3),
          Load: 'SDA',
          Feature: 'WAB',
          Type: 'DD',
        },
        NextBus2: {
          OriginCode: '84009',
          DestinationCode: '84009',
          EstimatedArrival: makeTime(13),
          Load: 'SEA',
          Feature: 'WAB',
          Type: 'DD',
        },
      },
      {
        ServiceNo: '65',
        Operator: 'SBST',
        NextBus: {
          OriginCode: '75009',
          DestinationCode: '03218',
          EstimatedArrival: makeTime(1),
          Load: 'LSD',
          Feature: 'WAB',
          Type: 'DD',
        },
        NextBus2: {
          OriginCode: '75009',
          DestinationCode: '03218',
          EstimatedArrival: makeTime(10),
          Load: 'SDA',
          Feature: 'WAB',
          Type: 'DD',
        },
        NextBus3: {
          OriginCode: '75009',
          DestinationCode: '03218',
          EstimatedArrival: makeTime(21),
          Load: 'SEA',
          Feature: 'WAB',
          Type: 'DD',
        },
      },
      {
        ServiceNo: '506',
        Operator: 'SBST',
        NextBus: {
          OriginCode: '28009',
          DestinationCode: '84009',
          EstimatedArrival: makeTime(6),
          Load: 'SEA',
          Feature: 'WAB',
          Type: 'SD',
        },
        NextBus2: {
          OriginCode: '28009',
          DestinationCode: '84009',
          EstimatedArrival: makeTime(18),
          Load: 'SEA',
          Feature: 'WAB',
          Type: 'SD',
        },
      },
    ],
  };
}

/**
 * Serverless / API endpoint to pull live data from LTA Datamall:
 * GET https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=83139
 *
 * Headers:
 * - AccountKey: <LTA_ACCOUNT_KEY>
 * - accept: application/json
 */
export default async function busArrivalHandler(req: Request, res: Response) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const busStopCode = (req.query.BusStopCode as string) || '83139';
    const serviceNo = (req.query.ServiceNo as string) || '';

    // Check for AccountKey from environment or request headers/query
    // User requirement: "do not hardcopy any key, I will include them later"
    const accountKey =
      process.env.LTA_ACCOUNT_KEY ||
      process.env.ACCOUNT_KEY ||
      (req.headers['accountkey'] as string) ||
      (req.headers['x-account-key'] as string) ||
      (req.query.accountKey as string) ||
      '';

    if (!accountKey || accountKey.trim() === '' || accountKey === '<LTA_ACCOUNT_KEY>') {
      // Return helpful notice with realistic preview data so the ticker works immediately
      const sample = getSampleBusArrivalData(busStopCode);
      if (serviceNo) {
        sample.Services = sample.Services.filter((s) => s.ServiceNo === serviceNo);
      }
      return res.status(200).json(sample);
    }

    // Call live LTA Datamall API
    let url = `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${encodeURIComponent(
      busStopCode
    )}`;
    if (serviceNo) {
      url += `&ServiceNo=${encodeURIComponent(serviceNo)}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        AccountKey: accountKey.trim(),
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`LTA API returned status ${response.status}: ${errorText}`);
      
      // If unauthorized or error, send informative response
      return res.status(response.status).json({
        BusStopCode: busStopCode,
        Services: [],
        error: `LTA DataMall API responded with HTTP ${response.status}`,
        details: errorText || response.statusText,
        isMock: false,
      });
    }

    const data = await response.json();
    return res.status(200).json({
      ...data,
      isMock: false,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Error fetching LTA Bus Arrival:', errorMsg);
    return res.status(500).json({
      BusStopCode: (req.query.BusStopCode as string) || '83139',
      Services: [],
      error: 'Failed to communicate with LTA Datamall service',
      details: errorMsg,
    });
  }
}
