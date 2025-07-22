import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  X, 
  Send, 
  User, 
  Bot, 
  Plus, 
  Trash2,
  MessageCircle,
  Stethoscope
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import fmcLogo from "../../assets/images/fmc-logo.png";


function generatePatientId() {
  const timestamp = Date.now().toString(36); // Convert current time to base36
  const random = Math.random().toString(36).substr(2, 5); // Random 5 chars
  return `PID-${timestamp}-${random}`.toUpperCase();
}

const ChatBot = () => {
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const [patientId, setPatientId] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSessions, setChatSessions] = useState([]);
  const messagesEndRef = useRef(null);

  // Initial system messages to train the AI
  const systemMessages = [
    // {
    //   role: 'system',
    //   content: 'You are a healthcare AI assistant for Federal Medical Center Keffi (FMC Keffi). You are designed to provide preliminary health consultations, analyze symptoms, and determine if a patient needs immediate medical attention. Always be professional, empathetic, and once you are sure you have provided help to the user remind them you are not a replacement for professional medical advice. If symptoms are severe or require immediate attention, recommend they visit FMC Keffi or contact emergency services.'
    // },
    // {
    //   role: 'system',
    //   content: 'If you do not have enough symptoms from the previous user messages request for more symptoms and also take into account all previous messages from user and assistant'
    // },
    // {
    //   role: 'system',
    //   content: 'When analyzing symptoms, provide: 1) Possible causes, 2) Severity assessment (mild, moderate, severe), 3) Recommended actions (self-care, schedule appointment, seek immediate care), 4) When to seek emergency care. After providing solutions Always end with a reminder to consult healthcare professionals at FMC Keffi for proper diagnosis.'
    // },
    // {
    //   role: 'system',
    //   content: 'Always be straight to the point as long messages might often scare users'
    // },
    {
      role: 'system',
      content: 'You are a healthcare AI assistant for Federal Medical Center Keffi (FMC Keffi). You are designed to provide preliminary health consultations, analyze symptoms, and determine if a patient needs immediate medical attention. Always be professional and empathetic.'
    },
    {
      role: 'system',
      content: 'Always keep responses as short as possible'
    },
    {
      role: 'system',
      content: 'Do not answer any user messages not related to health or medical concerns'
    },
  ];

  // Load chat sessions from localStorage on component mount
  useEffect(() => {
    const savedSessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
    setChatSessions(savedSessions);
    
    const savedPatientId = JSON.parse(localStorage.getItem('patientId')) || generatePatientId();
    setPatientId(savedPatientId);
    
    // Load the most recent chat if available
    if (savedSessions.length > 0) {
      const mostRecent = savedSessions[savedSessions.length - 1];
      setCurrentChatId(mostRecent.id);
      setCurrentMessages(mostRecent.messages || []);
    }
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  // Save chat sessions to localStorage
  const saveChatSessions = (sessions) => {
    localStorage.setItem('chatSessions', JSON.stringify(sessions));
    setChatSessions(sessions);
  };

  // Generate chat title from first message
  const generateChatTitle = (message) => {
    const words = message.split(' ').slice(0, 6).join(' ');
    return words.length > 30 ? words.substring(0, 30) + '...' : words;
  };

  // Create new chat session
  const createNewChat = () => {
    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
    setCurrentMessages([]);
    setSideNavOpen(false);
  };

  // Load existing chat session
  const loadChatSession = (sessionId) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentChatId(sessionId);
      setCurrentMessages(session.messages || []);
    }
    setSideNavOpen(false);
  };

  // Clear all chat history
  const clearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      localStorage.removeItem('chatSessions');
      setChatSessions([]);
      setCurrentChatId(null);
      setCurrentMessages([]);
    }
  };

  // Send message to backend
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      patientId: patientId,
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    // Add user message to current messages
    const updatedMessages = [...currentMessages, userMessage];
    setCurrentMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    // Add "processing" message
    const processingMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: '...',
      timestamp: new Date().toISOString(),
      isProcessing: true
    };
    setCurrentMessages([...updatedMessages, processingMessage]);

    try {
      // Prepare messages for API (include system messages + conversation history)
      const apiMessages = [
        ...systemMessages,
        ...updatedMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      // Determine if this is a new chat session
      const isNewSession = !currentChatId || currentMessages.length === 0;

      const response = await fetch(`/api/chat.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: patientId,
          messages: apiMessages,
          isNewSession: isNewSession,
          chatId: currentChatId
        })
      });

      const data = await response.json();

      if (data.success) {
        // Remove processing message and add real response
        const assistantMessage = {
          id: Date.now() + 2,
          role: 'assistant',
          content: data.message,
          timestamp: new Date().toISOString()
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        setCurrentMessages(finalMessages);

        // Handle new chat session
        if (isNewSession) {
          const newChatId = data.chatId || Date.now().toString();
          const chatTitle = data.title || generateChatTitle(inputMessage);
          
          setCurrentChatId(newChatId);
          
          const newSession = {
            id: newChatId,
            title: chatTitle,
            messages: finalMessages,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          const updatedSessions = [...chatSessions, newSession];
          saveChatSessions(updatedSessions);
        } else {
          // Update existing session
          const updatedSessions = chatSessions.map(session => 
            session.id === currentChatId 
              ? { ...session, messages: finalMessages, updatedAt: new Date().toISOString() }
              : session
          );
          saveChatSessions(updatedSessions);
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove processing message and add error message
      const errorMessage = {
        id: Date.now() + 2,
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again or contact FMC Keffi directly for assistance.',
        timestamp: new Date().toISOString(),
        isError: true
      };

      const finalMessages = [...updatedMessages, errorMessage];
      setCurrentMessages(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Side Navigation - Desktop */}
      <div className="hidden md:flex md:w-80 bg-gray-50 border-r border-gray-200 flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Chat
          </button>
        </div>
        
        {chatSessions.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={clearAllHistory}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear History
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {chatSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => loadChatSession(session.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                currentChatId === session.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 flex-shrink-0" />
                <span className="truncate text-sm">{session.title}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(session.updatedAt).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Side Navigation - Mobile */}
      {sideNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSideNavOpen(false)} />
          <div className="absolute left-0 top-0 w-3/4 h-full bg-gray-50 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={createNewChat}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Chat
              </button>
            </div>
            
            {chatSessions.length > 0 && (
              <div className="p-4 border-b border-gray-200">
                <button
                  onClick={clearAllHistory}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear History
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {chatSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => loadChatSession(session.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentChatId === session.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate text-sm">{session.title}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(session.updatedAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSideNavOpen(!sideNavOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sideNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <NavLink to={"/"} className="flex items-center gap-3">
              <img className='h-[40px]' src={fmcLogo}/>
              <div>
                <h1 className="font-semibold text-gray-900">FMC Keffi</h1>
                <p className="text-sm text-gray-600">AI Health Care Consultation System</p>
              </div>
            </NavLink>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {currentMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-blue-100 p-6 rounded-full mb-6">
                <Bot className="w-12 h-12 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                What can I help you with?
              </h2>
              <p className="text-gray-600 max-w-md">
                I'm here to assist you with your health concerns. Describe your symptoms 
                and I'll provide guidance on whether you need immediate care or can manage 
                your condition at home.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {currentMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 items-start ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Bot className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.isProcessing
                        ? 'bg-gray-100 text-gray-600 animate-pulse'
                        : message.isError
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="bg-gray-100 p-2 rounded-full aspect-[1/1]">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="max-w-3xl mx-auto flex gap-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your symptoms or health concerns..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="1"
              style={{ minHeight: '44px', maxHeight: '120px' }}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="max-w-3xl mx-auto mt-2">
            <p className="text-xs text-gray-500 text-center">
              This AI assistant provides preliminary health guidance. Always consult with 
              healthcare professionals at FMC Keffi for proper diagnosis and treatment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;