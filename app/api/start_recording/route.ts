import { NextRequest, NextResponse } from 'next/server';
import { EgressClient, EncodedFileOutput } from 'livekit-server-sdk';

export async function POST(request: NextRequest) {
  const { room } = await request.json();
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  console.log('Room:', room);
  console.log('API Key:', apiKey);
  console.log('API Secret:', apiSecret);
  console.log('WebSocket URL:', wsUrl);

  if (!room || !apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json({ error: 'Missing parameters or environment variables' }, { status: 400 });
  }

  const filepath = "livekit-recordings/";
  const fileOutput = new EncodedFileOutput({ filepath });

  const egressClient = new EgressClient(wsUrl, apiKey, apiSecret);

  try {
    console.log('Starting egress...');
    const info = await egressClient.startRoomCompositeEgress(room, {
      file: fileOutput,
    }, {
      layout: 'speaker',
    });
    
    const egressID = info.egressId;
    console.log('Egress ID:', egressID);
    return NextResponse.json({ message: 'Recording started successfully', egressId: egressID });
  } catch (error: any) {
    console.error('Failed to start egress:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: 'Failed to start recording', details: errorMessage }, { status: 500 });
  }
}
