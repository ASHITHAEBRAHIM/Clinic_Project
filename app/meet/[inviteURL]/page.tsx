"use client";

import '@livekit/components-styles';
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { redirect, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { MdOutlineChatBubble } from "react-icons/md";
import ChatMsg from '@/components/ChatMsg';
import { BiVideoRecording } from "react-icons/bi";

export default function Page() {
  const params = useSearchParams();

  const [inviteUrl, setInviteUrl] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [token, setToken] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [userid, setUserId] = useState<string>("");

  const [isRecording, setIsRecording] = useState(false);
  const [egressId, setEgressId] = useState(null);

  const toggleRecording = async () => {
    const apiEndpoint = isRecording ? '/api/stop_recording' : '/api/start_recording';
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: inviteUrl, egressId }),
    });
    const data = await response.json();
    if (response.ok) {
      if (!isRecording) setEgressId(data.egressId);
      setIsRecording(!isRecording);
      console.log("room",data.room)
      console.log("egressid",data.egressId)
    } else {
      console.error(data.error);
    }
  };
  
  
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error checking authentication:', error.message);
        return false;
      }
      if (!user) {
        redirect('/signup');
        return false;
      }

      setUserId(user.id); 

      const invite = window.location.href;
      if (!invite) {
        console.error('Invite URL is missing');
        return false;
      }

      const { data: meeting, error: meetingError } = await supabase
        .from('booking')
        .select('*')
        .eq('invite_URL', invite)
        .single();

      if (meetingError) {
        console.error('Error fetching meeting:', meetingError.message);
        return false;
      }

      if (!meeting) {
        console.error('Meeting not found for the given invite URL');
        return false;
      }

      setAuthenticated(true);
      return true;
    }

    async function initialize() {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        const inviteUrl = params.get("invite_url");
        const email = params.get("email");
        if (inviteUrl && email) {
          setInviteUrl(inviteUrl);
          setEmail(email);
          getToken();
        }
      }
    }

    initialize();
  }, [params]);

  async function getToken() {
    if (!inviteUrl || !email) {
      return;
    }

    const isInviteAuthenticated = await checkInviteAuthentication(inviteUrl);

    if (!isInviteAuthenticated) {
      console.error('Invite URL is not authenticated in Supabase');
      return;
    }
    try {
      const resp = await fetch(
        `/api/get-participant-token?room=${inviteUrl}&email=${email}`
      );
      const datas = await resp.json();
      setToken(datas.token);
    } catch (e) {
      console.error(e);
    }
  }

  async function checkInviteAuthentication(inviteUrl: string) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('booking')
        .select('*')
        .eq('invite_URL', inviteUrl)
        .single();

      if (error) {
        console.error('Error querying Supabase:', error.message);
        return false;
      }

      if (!data) {
        console.error('Meeting not found for the given inviteUrl:', inviteUrl);
        return false;
      }

      const bookingid = data.id;
      const { data: insertData, error: insertError } = await supabase
        .from('participants')
        .insert([
          {
            bookingid,
            userid,
          }
        ]);

      if (insertError) {
        console.error('Error saving participant details:', insertError.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving participant details:', error);
      return false;
    }
  }

  if (!authenticated) {
    return (
      <Link
        href='/login'
        className='text-black'
      >
        You Are Not Authorised to Access This Link!
      </Link>
    );
  }

  if (token === "") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          getToken();
        }}
        className='flex flex-col justify-center items-center min-h-screen'
      >
        <Input
          type="text"
          placeholder='Enter the Link'
          value={inviteUrl}
          className='mb-4 text-black'
          onChange={(e) => setInviteUrl(e.target.value)}
        />
        <Input
          type="text"
          placeholder='Username'
          value={email}
          className='mb-4 text-black'
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button className='text-black' type='submit'>Join Now</Button>
      </form>
    );
  }

  const handleCloseChat = () => {
    setShowChat(false);
  };

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      onDisconnected={() => setToken("")}
      data-lk-theme="default"
      style={{ height: '100dvh' }}
    >
      <MyVideoConference />
      <RoomAudioRenderer />
      <div className="flex gap-2 fixed right-4 bottom-4 z-10">
      <Button className='border bg-gray-700' onClick={toggleRecording}>
      <BiVideoRecording />
      {isRecording ? 'Stop Recording' : 'Start Recording'}
      </Button>
        <Button className='border bg-gray-700' onClick={() => setShowChat(!showChat)}> <MdOutlineChatBubble />Chat </Button>
      </div>
      {showChat && (
        <div className="fixed inset-y-0 right-0 w-64 bg-black z-10">
          <ChatMsg participantName={email} onClose={handleCloseChat} inviteUrl={inviteUrl} />
        </div>
      )}
      <ControlBar />
    </LiveKitRoom>
  );
}

function MyVideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );
  return (
    <GridLayout tracks={tracks} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>
      <ParticipantTile />
    </GridLayout>
  );
}
