import { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, MapPin, Clock, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

export const AutobotWidget = ({ user }) => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const username = user?.name || user?.collegeEmail?.split('@')[0] || 'there';

  // Initialize initial message when widget opens or user changes
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: `Hi ${username}, looking for something?`,
          timestamp: new Date()
        }
      ]);
    }
  }, [username, messages.length]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend || !textToSend.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await api.post('/search/autobot', { query: textToSend.trim() });
      const data = res?.data || res;

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.replyText || 'Here is what I found for you:',
        items: data.items || [],
        embeddedNames: data.embeddedNames || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: 'Oops! I had trouble checking the found items. Please try again in a moment.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (suggestion) => {
    handleSend(suggestion);
  };

  if (!user) return null; // Only available for logged-in users

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Sticky Popup Chat Window */}
      {isOpen && (
        <div className={`w-80 sm:w-96 h-[520px] rounded-2xl shadow-2xl border flex flex-col overflow-hidden backdrop-blur-xl mb-4 transition-all duration-300 transform scale-100 ${
          isDark 
            ? 'bg-gray-900/95 border-white/10 text-white' 
            : 'bg-white/95 border-gray-200 text-gray-900'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Bot className="h-5 w-5 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">Autobot Assistant</h3>
                <p className="text-[11px] text-indigo-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-ping"></span> Live Found Item Search
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Banner message */}
          <div className={`px-4 py-2.5 text-xs border-b shrink-0 ${
            isDark ? 'bg-indigo-950/40 border-indigo-500/20 text-indigo-200' : 'bg-indigo-50 border-indigo-100 text-indigo-900'
          }`}>
            💡 <strong>Need help?</strong> Write the name of your lost item — maybe somebody already found it and posted!
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Text Bubble */}
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-xs md:text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : isDark 
                      ? 'bg-gray-800 text-gray-100 border border-gray-700/50 rounded-bl-none' 
                      : 'bg-gray-100 text-gray-800 border border-gray-200/60 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>

                {/* Embedded names suggestions if present */}
                {msg.embeddedNames && msg.embeddedNames.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    <span className="text-[11px] text-gray-400 w-full mb-0.5">Found item matches:</span>
                    {msg.embeddedNames.map((name, i) => (
                      <span 
                        key={i} 
                        onClick={() => handleChipClick(name)}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 cursor-pointer hover:bg-indigo-500/30 transition-colors"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Found Item Result Cards */}
                {msg.items && msg.items.length > 0 && (
                  <div className="mt-3 w-full space-y-2.5">
                    {msg.items.map(item => (
                      <div 
                        key={item._id}
                        className={`p-3 rounded-xl border flex gap-3 text-left transition-all ${
                          isDark ? 'bg-gray-800/80 border-gray-700 hover:border-indigo-500/50' : 'bg-white border-gray-200 hover:border-indigo-500/50 shadow-sm'
                        }`}
                      >
                        {item.images && item.images.length > 0 ? (
                          <img src={item.images[0].url} alt={item.itemName} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 ${
                            isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                          }`}>
                            Item
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs truncate text-indigo-400">{item.itemName}</p>
                          <p className={`text-[11px] line-clamp-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.description}</p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                            <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {item.location}</span>
                            <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {new Date(item.eventAt || item.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Link if no items found */}
                {msg.sender === 'bot' && msg.items && msg.items.length === 0 && (
                  <Link
                    to="/reports/create?type=LOST"
                    onClick={() => setIsOpen(false)}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/90 text-white text-xs font-medium hover:bg-red-700 transition-colors shadow-sm"
                  >
                    <PlusCircle className="h-3.5 w-3.5" /> Post Lost Item Report
                  </Link>
                )}

                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Bot className="h-4 w-4 animate-spin text-indigo-400" /> Autobot is searching found items...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className={`px-3 py-2 flex gap-1.5 overflow-x-auto border-t shrink-0 ${
            isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-100'
          }`}>
            {['Purse', 'Wallet', 'AirPods', 'Keys', 'MacBook'].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(chip)}
                className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap border transition-colors ${
                  isDark ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
            className={`p-3 border-t flex gap-2 shrink-0 ${
              isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
            }`}
          >
            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              placeholder="e.g. blue purse, green wallet..."
              className={`flex-1 px-3 py-2 text-xs md:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-100 border-gray-200 text-gray-900'
              }`}
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm rounded-full shadow-2xl hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-300"
      >
        <div className="relative">
          <Bot className="h-5 w-5" />
          <Sparkles className="h-3 w-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
        </div>
        <span>Need help? Ask Autobot</span>
      </button>
    </div>
  );
};

