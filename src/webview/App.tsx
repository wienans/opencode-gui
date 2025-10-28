import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  text: string;
}

// Get VS Code API
declare const acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Listen for messages from extension
    const messageHandler = (event: MessageEvent) => {
      const message = event.data;
      
      switch (message.type) {
        case 'init':
          setIsReady(message.ready);
          break;
        case 'thinking':
          setIsThinking(message.isThinking);
          break;
        case 'response':
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'assistant',
            text: message.text
          }]);
          break;
        case 'error':
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'assistant',
            text: `Error: ${message.message}`
          }]);
          break;
      }
    };

    window.addEventListener('message', messageHandler);
    
    // Tell extension we're ready
    vscode.postMessage({ type: 'ready' });

    return () => window.removeEventListener('message', messageHandler);
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isThinking) {
      return;
    }

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      text: input
    }]);

    // Send to extension
    vscode.postMessage({
      type: 'sendPrompt',
      text: input
    });

    // Clear input
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="app">
      <form className="input-container" onSubmit={handleSubmit}>
        <div className="textarea-wrapper">
          <textarea
            ref={inputRef}
            className="prompt-input"
            placeholder={isReady ? "Ask OpenCode anything..." : "Initializing OpenCode..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isReady || isThinking}
            rows={1}
          />
          <button 
            type="submit" 
            className="shortcut-button"
            disabled={!isReady || isThinking || !input.trim()}
            aria-label="Submit (Cmd+Enter)"
          >
            ⌘⏎
          </button>
        </div>
      </form>

      {isThinking && (
        <div className="thinking-indicator">
          <span className="thinking-icon">▸</span>
          <span>Thinking</span>
        </div>
      )}

      <div className="messages-container">
        {messages.length === 0 && !isThinking && (
          <div className="welcome-message">
            <p>Hello! I'm OpenCode, ready to help you with your OpenCode VSCode extension. What would you like to work on?</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-content">{message.text}</div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default App;
