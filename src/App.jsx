import { useState, useRef, useEffect } from 'react';
import { FiSend, FiTrash2 } from 'react-icons/fi';
import { RiRobot2Fill, RiSparklingFill } from 'react-icons/ri';
import { BsPersonCircle } from 'react-icons/bs';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey || apiKey === 'your-api-key-here') {
        throw new Error('Please set up your Gemini API key in the .env file');
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: input }] }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to get response from Gemini API');
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from API');
      }

      const aiResponse = { 
        role: 'assistant', 
        content: data.candidates[0].content.parts[0].text 
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message || 'An unexpected error occurred'}. Please check the console for more details.`
      }]);
    }

    setIsLoading(false);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 px-4">
              <div className="relative">
                <RiSparklingFill className="absolute -top-2 -right-2 text-cyan-400 text-xl animate-pulse" />
                <RiRobot2Fill className="text-7xl text-emerald-400" />
              </div>
              <div className="text-center space-y-4">
                <h1 className="text-5xl font-bold gradient-text">
                  NovaGem
                </h1>
                <p className="text-slate-400 text-lg max-w-md">
                  Your next-generation AI companion powered by Gemini. Experience intelligence reimagined.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                <div className="glass-effect p-6 rounded-2xl">
                  <h3 className="text-emerald-400 font-semibold text-lg mb-3">Try asking about</h3>
                  <ul className="text-slate-300 space-y-3">
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                      <span>Complex technical concepts</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                      <span>Code explanations & debugging</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                      <span>Creative writing & brainstorming</span>
                    </li>
                  </ul>
                </div>
                <div className="glass-effect p-6 rounded-2xl">
                  <h3 className="text-emerald-400 font-semibold text-lg mb-3">Capabilities</h3>
                  <ul className="text-slate-300 space-y-3">
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                      <span>Advanced reasoning</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                      <span>Detailed explanations</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                      <span>Real-time problem solving</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex space-x-3 max-w-[80%] ${
                  message.role === 'user'
                    ? 'flex-row-reverse space-x-reverse'
                    : 'flex-row'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {message.role === 'user' ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center">
                      <BsPersonCircle className="text-xl text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 flex items-center justify-center">
                      <RiRobot2Fill className="text-xl text-white" />
                    </div>
                  )}
                </div>
                <div
                  className={`message-bubble p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                      : 'glass-effect text-slate-200'
                  }`}
                >
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={atomDark}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={`${className} bg-slate-800 px-1 rounded`} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 flex items-center justify-center">
                  <RiRobot2Fill className="text-xl text-white" />
                </div>
                <div className="glass-effect rounded-2xl p-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="glass-effect p-4 border-t border-slate-700/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={clearChat}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
            >
              <FiTrash2 className="text-slate-300" />
              <span className="text-slate-300">Clear chat</span>
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="flex space-x-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 rounded-lg glass-effect px-4 py-3 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                <span>Send</span>
                <FiSend />
              </button>
            </div>
          </form>
        </div>
      </footer>
    </div>
  );
}

export default App;