import { env } from '../config/env.js';
import { query } from '../config/database.js';
import type { SkipTraceResult } from '../types/index.js';

interface TraceInput {
  propertyId: number;
  ownerName?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

interface TraceResponse {
  phones: { number: string; type: string; confidence: number; dnc: boolean }[];
  emails: { address: string; confidence: number }[];
  provider: string;
}

// Check if we already have results
async function getCachedResult(propertyId: number): Promise<SkipTraceResult | null> {
  const result = await query<SkipTraceResult>(
    'SELECT * FROM skip_trace_results WHERE property_id = $1 ORDER BY created_at DESC LIMIT 1',
    [propertyId]
  );
  return result.rows[0] || null;
}

// Try Tracerfy API first, fall back to BatchData
async function callProvider(input: TraceInput): Promise<TraceResponse> {
  if (env.USE_MOCK) {
    return generateMockResult();
  }

  // Try Tracerfy
  if (env.TRACERFY_API_KEY) {
    try {
      const response = await fetch('https://api.tracerfy.com/v1/skip-trace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.TRACERFY_API_KEY}`,
        },
        body: JSON.stringify({
          name: input.ownerName,
          address: input.address,
          city: input.city,
          state: input.state,
          zip: input.zip,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          phones: (data.phones || []).map((p: any) => ({
            number: p.phone || p.number,
            type: p.type || 'unknown',
            confidence: p.confidence || 0.5,
            dnc: p.dnc || false,
          })),
          emails: (data.emails || []).map((e: any) => ({
            address: e.email || e.address,
            confidence: e.confidence || 0.5,
          })),
          provider: 'tracerfy',
        };
      }
    } catch (err) {
      console.error('Tracerfy API error:', err);
    }
  }

  // Fallback to BatchData
  if (env.BATCHDATA_API_KEY) {
    try {
      const response = await fetch('https://api.batchdata.com/api/v1/skip-trace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.BATCHDATA_API_KEY}`,
        },
        body: JSON.stringify({
          requests: [{
            name: { full: input.ownerName },
            address: {
              street: input.address,
              city: input.city,
              state: input.state,
              zip: input.zip,
            },
          }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const result = data.results?.[0] || {};
        return {
          phones: (result.phones || []).map((p: any) => ({
            number: p.phone_number,
            type: p.phone_type || 'unknown',
            confidence: p.confidence || 0.5,
            dnc: p.do_not_call || false,
          })),
          emails: (result.emails || []).map((e: any) => ({
            address: e.email_address,
            confidence: e.confidence || 0.5,
          })),
          provider: 'batchdata',
        };
      }
    } catch (err) {
      console.error('BatchData API error:', err);
    }
  }

  // If no API keys, return mock
  return generateMockResult();
}

function generateMockResult(): TraceResponse {
  const areaCode = ['713', '832', '281', '305', '786', '602', '480', '404', '770'][Math.floor(Math.random() * 9)];
  const num1 = String(Math.floor(Math.random() * 900) + 100);
  const num2 = String(Math.floor(Math.random() * 9000) + 1000);

  return {
    phones: [
      { number: `(${areaCode}) ${num1}-${num2}`, type: 'mobile', confidence: 0.85, dnc: false },
      { number: `(${areaCode}) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`, type: 'landline', confidence: 0.65, dnc: false },
    ],
    emails: [
      { address: `owner${Math.floor(Math.random() * 9999)}@gmail.com`, confidence: 0.72 },
    ],
    provider: 'mock',
  };
}

export async function traceProperty(input: TraceInput): Promise<SkipTraceResult> {
  // Check cache first
  const cached = await getCachedResult(input.propertyId);
  if (cached) return cached;

  // Call skip trace provider
  const traceResult = await callProvider(input);

  // Store result
  const result = await query<SkipTraceResult>(
    `INSERT INTO skip_trace_results (property_id, phone_numbers, email_addresses, provider, confidence_score)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      input.propertyId,
      JSON.stringify(traceResult.phones),
      JSON.stringify(traceResult.emails),
      traceResult.provider,
      traceResult.phones.length > 0 ? traceResult.phones[0].confidence : 0,
    ]
  );

  return result.rows[0];
}

export async function traceMultiple(inputs: TraceInput[]): Promise<SkipTraceResult[]> {
  const results: SkipTraceResult[] = [];
  for (const input of inputs) {
    const result = await traceProperty(input);
    results.push(result);
  }
  return results;
}

export async function deductCredits(userId: number, count: number): Promise<boolean> {
  const result = await query(
    `UPDATE user_credits SET skip_trace_credits = skip_trace_credits - $2, updated_at = NOW()
     WHERE user_id = $1 AND skip_trace_credits >= $2
     RETURNING skip_trace_credits`,
    [userId, count]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function getCredits(userId: number): Promise<number> {
  const result = await query<{ skip_trace_credits: number }>(
    'SELECT skip_trace_credits FROM user_credits WHERE user_id = $1',
    [userId]
  );
  return result.rows[0]?.skip_trace_credits ?? 0;
}
