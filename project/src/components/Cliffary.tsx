import React, { useState } from 'react';
import axios from 'axios';
import { Send, User, Bot } from 'lucide-react';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<{ sender: string; message: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    setChat(prev => [...prev, { sender: 'user', message: input }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/chat', { message: input });
      setChat(prev => [...prev, { sender: 'ai', message: res.data.reply }]);
    } catch (err) {
      setChat(prev => [...prev, { sender: 'ai', message: 'Something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow-xl rounded-xl space-y-4">
      <h2 className="text-xl font-bold">🧠 AI Health Q&A</h2>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {chat.map((msg, idx) => (
          <div key={idx} className={`flex items-start space-x-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-lg p-3 text-sm ${msg.sender === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <p>{msg.message}</p>
            </div>
            {msg.sender === 'user' ? <User className="w-4 h-4 text-blue-500" /> : <Bot className="w-4 h-4 text-gray-500" />}
          </div>
        ))}
        {loading && <p className="text-gray-400 italic">Thinking...</p>}
      </div>
      <div className="flex space-x-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a health question..."
          className="flex-1 border p-2 rounded-lg"
        />
        <button onClick={handleSend} className="bg-blue-600 text-white p-2 rounded-lg">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
