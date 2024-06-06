import { NextRequest, NextResponse } from 'next/server';
import { EgressClient } from 'livekit-server-sdk';

export async function POST(request: NextRequest) {
  const { egressId } = await request.json();
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!egressId || !apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json({ error: 'Missing parameters or environment variables' }, { status: 400 });
  }

  const egressClient = new EgressClient(wsUrl, apiKey, apiSecret);
  try {
    const response = await egressClient.stopEgress(egressId);
    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to stop recording' }, { status: 500 });
  }
}
