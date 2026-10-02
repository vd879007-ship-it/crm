import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Video, Hash, MessageSquare, Paperclip, Send, X } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email?: string;
}

interface Channel {
  id: string;
  name: string;
  isGroup: boolean;
}

interface Message {
  id: string;
  content: string;
  userId: string;
  channelId: string;
  fileUrl?: string;
  createdAt: string;
  user: { id?: string; name: string };
}

export default function Chat() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // New channel modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Load User & Channels
  useEffect(() => {
    // Read current user from Auth
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }

    fetchChannels();

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000');
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const fetchChannels = () => {
    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/channels`).then(res => {
      setChannels(res.data);
      const stateChannelId = location.state?.activeChannelId;
      if (stateChannelId) {
        const found = res.data.find((c: Channel) => c.id === stateChannelId);
        if (found) {
          setActiveChannel(found);
          return;
        }
      }
      if (res.data.length > 0 && !activeChannel) {
        setActiveChannel(res.data[0]);
      }
    });
  };

  // Listen for newly created channels
  useEffect(() => {
    if (socket) {
      const channelCreatedHandler = (newChan: Channel) => {
        setChannels(prev => {
          if (prev.some(c => c.id === newChan.id)) return prev;
          return [...prev, newChan];
        });
      };
      socket.on('channel_created', channelCreatedHandler);
      return () => {
        socket.off('channel_created', channelCreatedHandler);
      };
    }
  }, [socket]);

  // Handle active channel change and room sockets
  useEffect(() => {
    if (activeChannel) {
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/channels/${activeChannel.id}/messages`).then(res => {
        setMessages(res.data);
      });

      if (socket) {
        socket.emit('join_room', activeChannel.id);
        return () => {
          socket.emit('leave_room', activeChannel.id);
        };
      }
    }
  }, [activeChannel, socket]);

  // Socket message listener
  useEffect(() => {
    if (socket) {
      const messageHandler = (msg: Message) => {
        if (activeChannel && msg.channelId === activeChannel.id) {
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      };
      socket.on('receive_message', messageHandler);
      return () => {
        socket.off('receive_message', messageHandler);
      };
    }
  }, [socket, activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !activeChannel || !currentUser || !socket) return;

    let fileUrl = null;
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/upload`, formData);
        fileUrl = res.data.url;
      } catch (err) {
        console.error('File upload failed', err);
      }
    }

    socket.emit('send_message', {
      content: newMessage,
      channelId: activeChannel.id,
      userId: currentUser.id,
      fileUrl
    });

    setNewMessage('');
    setSelectedFile(null);
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/channels`, {
        name: newChannelName.trim(),
        isGroup: true,
        userIds: currentUser ? [currentUser.id] : []
      });
      setChannels(prev => [...prev, res.data]);
      setActiveChannel(res.data);
      setNewChannelName('');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create channel', err);
    }
  };

  const handleStartCall = () => {
    if (!activeChannel) return;
    navigate(`/meetings?room=${activeChannel.id}&name=${encodeURIComponent(activeChannel.name)}`);
  };

  const groupChannels = channels.filter(c => c.isGroup);
  const dmChannels = channels.filter(c => !c.isGroup);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-[calc(100vh-8rem)] flex overflow-hidden relative">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
          <h2 className="font-bold text-gray-800">Messages & Channels</h2>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
            title="Create Channel"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 overflow-y-auto flex-1 space-y-6">
          {/* Channels List */}
          <div>
            <div className="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Channels
            </div>
            <div className="space-y-1">
              {groupChannels.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel)}
                  className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeChannel?.id === channel.id 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Hash className={`w-4 h-4 mr-2.5 ${activeChannel?.id === channel.id ? 'text-white' : 'text-gray-400'}`} />
                  <span className="truncate">{channel.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Direct Messages List */}
          <div>
            <div className="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Direct Messages
            </div>
            <div className="space-y-1">
              {dmChannels.length === 0 ? (
                <p className="px-2 text-xs text-gray-400">No DMs yet. Start one from Directory.</p>
              ) : (
                dmChannels.map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannel(channel)}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeChannel?.id === channel.id 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <MessageSquare className={`w-4 h-4 mr-2.5 ${activeChannel?.id === channel.id ? 'text-white' : 'text-gray-400'}`} />
                    <span className="truncate">{channel.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeChannel ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                {activeChannel.isGroup ? <Hash className="w-5 h-5 text-gray-500" /> : <MessageSquare className="w-5 h-5 text-blue-500" />}
                <h2 className="text-lg font-bold text-gray-900">{activeChannel.name}</h2>
              </div>
              
              <button
                onClick={handleStartCall}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                <Video className="w-4 h-4" />
                <span>Start Video Call</span>
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
              {messages.map(msg => {
                const isMe = currentUser?.id === msg.userId;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-gray-500 mb-1 px-1">
                      {isMe ? 'You' : msg.user?.name || 'User'}
                    </span>
                    <div className={`px-4 py-2.5 rounded-2xl max-w-lg shadow-sm ${
                      isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-900 border border-gray-200 rounded-tl-none'
                    }`}>
                      {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                      {msg.fileUrl && (
                        <div className="mt-2 pt-2 border-t border-black/10">
                          <a 
                            href={msg.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={`flex items-center space-x-2 text-xs underline font-medium hover:opacity-80 ${isMe ? 'text-blue-100' : 'text-blue-600'}`}
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                            <span className="truncate">View File Attachment</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 border-t border-gray-200 bg-white">
              {selectedFile && (
                <div className="mb-2 text-xs text-gray-600 bg-gray-100 p-2 rounded-md flex items-center justify-between">
                  <span className="truncate max-w-xs font-medium">{selectedFile.name}</span>
                  <button onClick={() => setSelectedFile(null)} className="text-red-500 hover:text-red-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                <label className="cursor-pointer text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-gray-100">
                  <input type="file" className="hidden" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                  <Paperclip className="w-5 h-5" />
                </label>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message #${activeChannel.name}...`}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim() && !selectedFile}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2.5 rounded-full transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Select a channel or direct message to start chatting
          </div>
        )}
      </div>

      {/* Create Channel Modal */}
      {showCreateModal && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Create a New Channel</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateChannel}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Channel Name</label>
              <input 
                type="text" 
                placeholder="e.g. project-launch, announcements" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newChannelName.trim()}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

