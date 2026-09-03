import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Send, 
  MapPin, 
  Check, 
  CheckCheck, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  Inbox, 
  Clock, 
  ArrowLeft,
  ExternalLink,
  Tag,
  AlertTriangle,
  Loader2,
  XCircle,
  CheckCircle2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/auth.service';
import { chatService } from '../services/chat.service';
import { initSocket, getSocket } from '../services/socket';
import { LocationModal } from '../components/Chat/LocationModal';

export const ChatView = () => {
  const { isDark } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Current logged in user
  const [currentUser, setCurrentUser] = useState(null);

  // Tabs & Conversations
  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE' | 'REQUESTS'
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [loadingList, setLoadingList] = useState(true);

  // Active chat messages
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [decorumError, setDecorumError] = useState(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Mobile layout state
  const [showMobileChat, setShowMobileChat] = useState(false);

  const messagesEndRef = useRef(null);

  // 1. Fetch current user & conversations
  useEffect(() => {
    const fetchUserAndChats = async () => {
      try {
        setLoadingList(true);
        const userData = await authService.getMe();
        const user = userData?.user || userData;
        if (!user) {
          navigate('/login');
          return;
        }
        setCurrentUser(user);

        // Initialize Socket
        const socket = initSocket(user._id);

        // Fetch Conversations
        const res = await chatService.getConversations();
        const fetchedConversations = res.conversations || [];
        setConversations(fetchedConversations);

        // Check URL params for Contact button trigger
        const reportId = searchParams.get('reportId');
        const recipientId = searchParams.get('recipientId');
        const itemName = searchParams.get('itemName');

        if (recipientId || reportId) {
          await handleInitialContact(reportId, recipientId, itemName, fetchedConversations, user);
        } else if (fetchedConversations.length > 0) {
          // Select first active chat by default if available
          const firstActive = fetchedConversations.find(c => c.status === 'ACCEPTED') || fetchedConversations[0];
          setSelectedChat(firstActive);
        }
      } catch (err) {
        console.error('Failed to init chat', err);
      } finally {
        setLoadingList(false);
      }
    };

    fetchUserAndChats();
  }, []);

  // Handle direct "Contact" redirection from a post card
  const handleInitialContact = async (reportId, recipientId, itemName, existingChats, user) => {
    // Check if matching chat already exists
    const existing = existingChats.find(c => {
      const matchReport = reportId ? c.reportId?._id === reportId || c.reportId === reportId : true;
      const matchRecipient = recipientId ? c.participants.some(p => (p._id || p) === recipientId) : true;
      return matchReport && matchRecipient;
    });

    // Prevent self-chat
    if (recipientId && user && recipientId.toString() === user._id.toString()) {
      if (existingChats.length > 0) {
        setSelectedChat(existingChats[0]);
      }
      return;
    }

    if (existing) {
      setSelectedChat(existing);
      setShowMobileChat(true);
    } else {
      try {
        const defaultMsg = itemName 
          ? `Hi, I saw your report regarding "${itemName}". Could you please share more details?` 
          : 'Hi, I would like to connect regarding your campus report.';
        
        const res = await chatService.initiateConversation({
          reportId,
          recipientId,
          initialMessage: defaultMsg
        });

        if (res.conversation) {
          setConversations(prev => [res.conversation, ...prev]);
          setSelectedChat(res.conversation);
          setShowMobileChat(true);
        }
      } catch (err) {
        console.error('Failed to initiate conversation', err);
      }
    }
  };

  // 2. Real-time socket listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !currentUser) return;

    const handleNewMessage = (newMsg) => {
      if (selectedChat && newMsg.conversationId === selectedChat._id) {
        setMessages(prev => {
          if (prev.some(m => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
        chatService.markAsRead(selectedChat._id);
      }

      // Update conversations list snippet
      setConversations(prev => prev.map(c => {
        if (c._id === newMsg.conversationId) {
          return {
            ...c,
            lastMessage: {
              text: newMsg.text,
              type: newMsg.type,
              senderId: newMsg.senderId,
              createdAt: newMsg.createdAt
            },
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      }));
    };

    const handleNewConversation = ({ conversation }) => {
      setConversations(prev => {
        if (prev.some(c => c._id === conversation._id)) return prev;
        return [conversation, ...prev];
      });
    };

    const handleConversationAccepted = ({ conversation }) => {
      setConversations(prev => prev.map(c => c._id === conversation._id ? conversation : c));
      if (selectedChat && selectedChat._id === conversation._id) {
        setSelectedChat(conversation);
      }
    };

    socket.on('message.new', handleNewMessage);
    socket.on('conversation.new', handleNewConversation);
    socket.on('conversation.accepted', handleConversationAccepted);

    return () => {
      socket.off('message.new', handleNewMessage);
      socket.off('conversation.new', handleNewConversation);
      socket.off('conversation.accepted', handleConversationAccepted);
    };
  }, [selectedChat, currentUser]);

  // 3. Load messages when selectedChat changes
  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      try {
        const socket = getSocket();
        if (socket) {
          socket.emit('join_conversation', { conversationId: selectedChat._id });
        }

        const res = await chatService.getMessages(selectedChat._id);
        setMessages(res.messages || []);
        chatService.markAsRead(selectedChat._id);
      } catch (err) {
        console.error('Failed to load messages', err);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send text message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedChat || sendingMessage) return;

    try {
      setSendingMessage(true);
      setDecorumError(null);

      const res = await chatService.sendMessage(selectedChat._id, {
        text: messageText.trim(),
        type: 'TEXT'
      });

      if (res.message) {
        setMessages(prev => [...prev, res.message]);
        setMessageText('');
      }
    } catch (err) {
      if (err.code === 'DECORUM_VIOLATION' || err.message?.includes('decorum')) {
        setDecorumError(err.message || 'Message violates campus decorum rules. Please communicate politely.');
      } else {
        alert(err.message || 'Failed to send message');
      }
    } finally {
      setSendingMessage(false);
    }
  };

  // Share location
  const handleShareLocation = async ({ latitude, longitude, label }) => {
    if (!selectedChat) return;

    try {
      setDecorumError(null);
      const res = await chatService.sendMessage(selectedChat._id, {
        type: 'LOCATION',
        locationData: {
          latitude,
          longitude,
          label
        }
      });

      if (res.message) {
        setMessages(prev => [...prev, res.message]);
      }
    } catch (err) {
      alert(err.message || 'Failed to share location');
    }
  };

  // Accept chat request
  const handleAcceptRequest = async (convId) => {
    try {
      const res = await chatService.acceptConversation(convId);
      if (res.conversation) {
        setConversations(prev => prev.map(c => c._id === convId ? res.conversation : c));
        setSelectedChat(res.conversation);
      }
    } catch (err) {
      alert(err.message || 'Failed to accept chat request');
    }
  };

  // Reject chat request
  const handleRejectRequest = async (convId) => {
    if (!confirm('Are you sure you want to decline this chat request?')) return;
    try {
      await chatService.rejectConversation(convId);
      setConversations(prev => prev.filter(c => c._id !== convId));
      if (selectedChat?._id === convId) {
        setSelectedChat(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to decline request');
    }
  };

  // Filter conversations
  const getOtherParticipant = (conv) => {
    if (!conv || !currentUser) return { name: 'Campus Student', rollNumber: 'Student' };
    return conv.participants.find(p => (p._id || p) !== currentUser._id) || conv.participants[0] || {};
  };

  const isIncomingRequest = (conv) => {
    return conv.status === 'PENDING' && conv.initiatedBy && conv.initiatedBy.toString() !== currentUser?._id?.toString();
  };

  const activeChatsList = conversations.filter(c => c.status === 'ACCEPTED' || (c.status === 'PENDING' && c.initiatedBy === currentUser?._id));
  const requestsList = conversations.filter(isIncomingRequest);

  const filteredConversations = (activeTab === 'ACTIVE' ? activeChatsList : requestsList).filter(conv => {
    const other = getOtherParticipant(conv);
    const search = searchFilter.toLowerCase();
    return (
      (other.name && other.name.toLowerCase().includes(search)) ||
      (other.rollNumber && other.rollNumber.toLowerCase().includes(search)) ||
      (conv.reportId?.itemName && conv.reportId.itemName.toLowerCase().includes(search))
    );
  });

  const selectedOther = selectedChat ? getOtherParticipant(selectedChat) : null;
  const isSelectedIncomingRequest = selectedChat ? isIncomingRequest(selectedChat) : false;
  const isSelectedPendingSender = selectedChat ? (selectedChat.status === 'PENDING' && selectedChat.initiatedBy === currentUser?._id) : false;

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col p-2 sm:p-6 max-w-7xl mx-auto w-full">
      <div className={`flex-grow rounded-3xl border shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col md:flex-row transition-all duration-300 ${
        isDark ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
      }`}>

        {/* ======================================================== */}
        {/* LEFT SIDEBAR: ACTIVE CHATS & MESSAGE REQUESTS */}
        {/* ======================================================== */}
        <div className={`w-full md:w-80 lg:w-96 border-r flex flex-col shrink-0 ${
          showMobileChat ? 'hidden md:flex' : 'flex'
        } ${isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50/50'}`}>
          
          {/* Header & Search */}
          <div className="p-4 border-b border-inherit space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold tracking-tight">Messages</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
              }`}>
                {conversations.length} total
              </span>
            </div>

            {/* Tab Selectors: Active vs Requests */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-200/50 dark:bg-slate-900 border border-slate-300/40 dark:border-slate-800">
              <button
                onClick={() => setActiveTab('ACTIVE')}
                className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'ACTIVE'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Active Chats</span>
              </button>

              <button
                onClick={() => setActiveTab('REQUESTS')}
                className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 relative cursor-pointer ${
                  activeTab === 'REQUESTS'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Inbox className="h-3.5 w-3.5" />
                <span>Requests</span>
                {requestsList.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
              </button>
            </div>

            {/* Contact Search Input */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search people or items..."
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs outline-none border transition-colors ${
                  isDark 
                    ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500' 
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 shadow-sm'
                }`}
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-inherit">
            {loadingList ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-3">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                <p className="text-xs text-slate-400">Loading chats...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-2 text-slate-400">
                <MessageSquare className="h-8 w-8 mx-auto opacity-40" />
                <p className="text-sm font-semibold">
                  {activeTab === 'ACTIVE' ? 'No active conversations' : 'No pending requests'}
                </p>
                <p className="text-xs">
                  {activeTab === 'ACTIVE'
                    ? 'Start a chat by clicking "Contact" on any Lost or Found report!'
                    : 'New incoming message requests from students will appear here.'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const isSelected = selectedChat?._id === conv._id;
                const unread = conv.unreadCounts ? (conv.unreadCounts[currentUser?._id] || 0) : 0;
                const otherInitial = (other.name || 'S').charAt(0).toUpperCase();

                return (
                  <div
                    key={conv._id}
                    onClick={() => {
                      setSelectedChat(conv);
                      setShowMobileChat(true);
                    }}
                    className={`p-3.5 transition-all cursor-pointer flex items-start gap-3 relative ${
                      isSelected
                        ? isDark ? 'bg-indigo-950/40 border-l-4 border-indigo-500' : 'bg-indigo-50/80 border-l-4 border-indigo-600'
                        : isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100/70'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                      {otherInitial}
                    </div>

                    {/* Chat summary details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="font-bold text-xs truncate">
                          {other.name || 'Campus Student'}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>

                      <p className="text-[11px] text-indigo-400 dark:text-indigo-400 font-medium truncate mb-1">
                        Roll No: {other.rollNumber || 'Student'}
                      </p>

                      {/* Associated Report Tag */}
                      {conv.reportId?.itemName && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-500 font-semibold mb-1">
                          <Tag className="h-3 w-3 shrink-0" />
                          <span className="truncate">{conv.reportId.itemName}</span>
                        </div>
                      )}

                      {/* Last message preview */}
                      <p className={`text-xs truncate ${unread > 0 ? 'font-bold text-indigo-400' : 'text-slate-400'}`}>
                        {conv.lastMessage?.type === 'LOCATION'
                          ? '📍 Shared location'
                          : conv.lastMessage?.text || 'Started a conversation'}
                      </p>
                    </div>

                    {/* Unread badge */}
                    {unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold flex items-center justify-center shrink-0 shadow-md">
                        {unread}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT SIDE: INTERACTIVE CHAT THREAD */}
        {/* ======================================================== */}
        <div className={`flex-1 flex flex-col h-[70vh] md:h-auto ${
          !showMobileChat ? 'hidden md:flex' : 'flex'
        }`}>
          {selectedChat ? (
            <>
              {/* Chat Thread Header */}
              <div className={`p-4 border-b flex items-center justify-between gap-3 ${
                isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-white'
              }`}>
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back button */}
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className="p-1.5 rounded-xl border md:hidden text-slate-400 hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                    {(selectedOther?.name || 'S').charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 text-left">
                    <h3 className="font-bold text-sm leading-tight truncate">
                      {selectedOther?.name || 'Campus Student'}
                    </h3>
                    <p className="text-xs text-slate-400 truncate flex items-center gap-2">
                      <span>Roll: {selectedOther?.rollNumber || 'N/A'}</span>
                      {selectedOther?.department && <span>• {selectedOther.department}</span>}
                    </p>
                  </div>
                </div>

                {/* Report Reference Badge */}
                {selectedChat.reportId?.itemName && (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold shrink-0">
                    <Tag className="h-3.5 w-3.5" />
                    <span>{selectedChat.reportId.itemName}</span>
                  </div>
                )}
              </div>

              {/* Decorum & Civil Communication Notice Banner */}
              <div className="px-4 py-2 bg-indigo-500/10 border-b border-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center gap-2 text-center font-medium">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Please maintain decorum and civil language. Abuse, threats, or harassment will result in a ban.</span>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
                    <MessageSquare className="h-10 w-10 opacity-30" />
                    <p className="font-bold text-sm">No messages yet</p>
                    <p className="text-xs max-w-xs">Send a polite greeting or ask about the item details to start the conversation.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = (msg.senderId?._id || msg.senderId) === currentUser?._id;

                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        {/* Bubble */}
                        <div className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                          isMe
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-none'
                            : isDark
                              ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                              : 'bg-slate-100 border border-slate-200 text-slate-900 rounded-bl-none'
                        }`}>
                          {/* Location Card if type === 'LOCATION' */}
                          {msg.type === 'LOCATION' && msg.locationData ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 font-bold text-amber-300">
                                <MapPin className="h-4 w-4 shrink-0" />
                                <span>{msg.locationData.label || 'Shared Meeting Location'}</span>
                              </div>
                              <p className="text-[11px] opacity-90">
                                Coordinates: {msg.locationData.latitude?.toFixed(4)}, {msg.locationData.longitude?.toFixed(4)}
                              </p>
                              <a
                                href={`https://www.google.com/maps?q=${msg.locationData.latitude},${msg.locationData.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white font-bold text-[11px] transition-colors"
                              >
                                <span>Open in Google Maps</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          )}

                          {/* Timestamp & Read Status */}
                          <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] opacity-75`}>
                            <span>
                              {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                            {isMe && (
                              msg.isRead ? <CheckCheck className="h-3 w-3 text-emerald-300" /> : <Check className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Decorum Error Alert Banner */}
              {decorumError && (
                <div className="px-4 py-2.5 mx-4 mb-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{decorumError}</span>
                </div>
              )}

              {/* Bottom Action / Input Area */}
              {isSelectedIncomingRequest ? (
                /* Recipient pending request action prompt */
                <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
                  isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-slate-50'
                }`}>
                  <div className="text-xs text-left">
                    <p className="font-bold">Incoming Message Request</p>
                    <p className="text-slate-400">Do you want to accept messages from this student?</p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleRejectRequest(selectedChat._id)}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="h-4 w-4" /> Decline
                    </button>
                    <button
                      onClick={() => handleAcceptRequest(selectedChat._id)}
                      className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Accept Request
                    </button>
                  </div>
                </div>
              ) : isSelectedPendingSender ? (
                /* Sender waiting message */
                <div className="p-4 border-t border-inherit text-center text-xs text-amber-500 font-medium bg-amber-500/5">
                  <Clock className="h-4 w-4 inline-block mr-1.5 -mt-0.5" />
                  Your chat request is pending. Waiting for {selectedOther?.name || 'recipient'} to accept before sending more messages.
                </div>
              ) : (
                /* Normal input bar */
                <form 
                  onSubmit={handleSendMessage}
                  className={`p-3 sm:p-4 border-t flex items-center gap-2 ${
                    isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-white'
                  }`}
                >
                  {/* Share Location Button */}
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    title="Share Meeting Location"
                    className="p-3 rounded-2xl border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <MapPin className="h-5 w-5" />
                  </button>

                  {/* Text Input */}
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a polite message..."
                    className={`flex-1 p-3 rounded-2xl text-xs sm:text-sm outline-none border transition-colors ${
                      isDark 
                        ? 'bg-slate-900/80 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 shadow-sm'
                    }`}
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!messageText.trim() || sendingMessage}
                    className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                  >
                    {sendingMessage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </button>
                </form>
              )}
            </>
          ) : (
            /* No conversation selected placeholder */
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shadow-inner">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-lg text-slate-200">Select a conversation</h3>
              <p className="text-xs max-w-sm">Choose an active chat from the sidebar or click "Contact" on any Lost & Found card to connect with the reporter.</p>
            </div>
          )}
        </div>

      </div>

      {/* Mandatory Location Sharing Disclaimer Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onShareLocation={handleShareLocation}
      />
    </div>
  );
};
