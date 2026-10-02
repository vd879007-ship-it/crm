import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSearchParams } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, Video as VideoIcon, Users } from 'lucide-react';

export default function Meetings() {
  const [searchParams] = useSearchParams();
  const initialRoom = searchParams.get('room') || 'general-meeting';
  const initialRoomName = searchParams.get('name') || 'General Meeting';

  const [roomId, setRoomId] = useState(initialRoom);
  const [roomName, setRoomName] = useState(initialRoomName);
  const [inCall, setInCall] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const [socket, setSocket] = useState<Socket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000');
    setSocket(newSocket);

    newSocket.on('webrtc_offer', async (data) => {
      if (!peerConnectionRef.current) createPeerConnection(newSocket);
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await peerConnectionRef.current?.createAnswer();
      await peerConnectionRef.current?.setLocalDescription(answer);
      newSocket.emit('webrtc_answer', { answer, roomId });
      setInCall(true);
    });

    newSocket.on('webrtc_answer', async (data) => {
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
    });

    newSocket.on('webrtc_ice_candidate', async (data) => {
      if (data.candidate) {
        await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    return () => {
      newSocket.close();
      stopMediaTracks();
    };
  }, [roomId]);

  const stopMediaTracks = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const createPeerConnection = (currentSocket: Socket) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        currentSocket.emit('webrtc_ice_candidate', { candidate: event.candidate, roomId });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    peerConnectionRef.current = pc;
    return pc;
  };

  const startCall = async () => {
    try {
      if (socket) {
        socket.emit('join_room', roomId);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      if (socket) {
        const pc = createPeerConnection(socket);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc_offer', { offer, roomId });
      }
      setInCall(true);
      setIsAudioMuted(false);
      setIsVideoMuted(false);
    } catch (err) {
      console.error('Failed to get local media', err);
      alert('Could not access camera/microphone. Please ensure permissions are granted.');
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        if (peerConnectionRef.current && localStreamRef.current) {
          const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        screenTrack.onended = () => {
          stopScreenShare();
        };

        setIsScreenSharing(true);
      } else {
        stopScreenShare();
      }
    } catch (err) {
      console.error('Screen sharing error', err);
    }
  };

  const stopScreenShare = () => {
    if (localStreamRef.current && localVideoRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (peerConnectionRef.current) {
        const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
        if (sender && videoTrack) sender.replaceTrack(videoTrack);
      }
      localVideoRef.current.srcObject = localStreamRef.current;
    }
    setIsScreenSharing(false);
  };

  const endCall = () => {
    if (socket) {
      socket.emit('leave_room', roomId);
    }
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    stopMediaTracks();
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setInCall(false);
    setIsScreenSharing(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm min-h-[calc(100vh-8rem)] flex flex-col justify-between">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <VideoIcon className="w-6 h-6 text-blue-600" />
            <span>{roomName}</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Room ID: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{roomId}</span></p>
        </div>

        {!inCall ? (
          <div className="flex items-center gap-3 w-full md:w-auto">
            <input 
              type="text" 
              value={roomId} 
              onChange={(e) => {
                setRoomId(e.target.value);
                setRoomName(`Room: ${e.target.value}`);
              }}
              placeholder="Enter Room ID..." 
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={startCall}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-md transition-colors flex items-center space-x-2 text-sm shadow-sm"
            >
              <Video className="w-4 h-4" />
              <span>Start / Join Meeting</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>Meeting Active</span>
          </div>
        )}
      </div>

      {/* Video Grid Container */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-950 rounded-2xl p-4 overflow-hidden relative min-h-[400px]">
        {!inCall && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-900/95 z-10 rounded-2xl p-6 text-center">
            <Users className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-200 mb-1">Ready to start video meeting?</h3>
            <p className="text-sm text-gray-400 max-w-sm">
              Click "Start / Join Meeting" to launch real-time WebRTC audio and video stream.
            </p>
          </div>
        )}
        
        {/* Local Video Stream */}
        <div className="relative bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center border border-gray-800 shadow-inner group">
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />
          {isVideoMuted && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-gray-400 text-sm">
              Camera Off
            </div>
          )}
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs px-3 py-1 rounded-md text-white text-xs font-medium flex items-center space-x-2">
            <span>You {isScreenSharing ? '(Sharing Screen)' : ''}</span>
            {isAudioMuted && <MicOff className="w-3.5 h-3.5 text-red-400" />}
          </div>
        </div>

        {/* Remote Video Stream */}
        <div className="relative bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center border border-gray-800 shadow-inner">
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs px-3 py-1 rounded-md text-white text-xs font-medium">
            Remote Peer
          </div>
        </div>
      </div>

      {/* Floating Call Controls Bar */}
      {inCall && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-3.5 rounded-full text-white transition-all shadow-md ${
              isAudioMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-800'
            }`}
            title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3.5 rounded-full text-white transition-all shadow-md ${
              isVideoMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-800'
            }`}
            title={isVideoMuted ? 'Turn On Camera' : 'Turn Off Camera'}
          >
            {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-3.5 rounded-full text-white transition-all shadow-md ${
              isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-800'
            }`}
            title="Share Screen"
          >
            <MonitorUp className="w-5 h-5" />
          </button>

          <button
            onClick={endCall}
            className="p-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all shadow-md font-bold px-6 flex items-center space-x-2 text-sm"
            title="Leave Call"
          >
            <PhoneOff className="w-5 h-5" />
            <span>End Call</span>
          </button>
        </div>
      )}
    </div>
  );
}

