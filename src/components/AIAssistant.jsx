import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import styles from './AIAssistant.module.css';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm PayTrack AI. I can help you navigate the app, track your finances, or just chat if you're stressed. How can I help?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll sa pinakababa
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.toLowerCase();
    const newMessages = [...messages, { text: input, sender: 'user' }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    // Mock AI Response Logic
    setTimeout(() => {
      let aiReply = "I'm your AI assistant. I can help you navigate the app or give you business insights. Try asking about your 'invoices', 'clients', or 'reports'.";
      
      if (userText.includes('tired') || userText.includes('stress') || userText.includes('pagod') || userText.includes('sawa')) {
        aiReply = "Take a deep breath! Running a business is exhausting. Why not take a 15-minute coffee break? I'll keep an eye on the dashboard for you. ☕";
      } else if (userText.includes('hello') || userText.includes('hi') || userText.includes('kamusta')) {
        aiReply = "Hello! I hope you're having a productive day. Do you need help with anything specific today?";
      } else if (userText.includes('invoice') || userText.includes('singil')) {
        aiReply = "To create a new invoice, just click the 'Create New' button at the top right. You can also export your invoices to Excel/CSV from the Invoices page!";
      } else if (userText.includes('client') || userText.includes('customer')) {
        aiReply = "You can manage your clients in the 'Clients' tab on the left sidebar. Clicking 'Add Client' will let you save their details so you don't have to type them again.";
      } else if (userText.includes('overdue') || userText.includes('late') || userText.includes('bayad')) {
        aiReply = "I see you have overdue invoices. It might be a good time to send a gentle reminder. You can do that from the 'Reminders' page.";
      } else if (userText.includes('goal') || userText.includes('target')) {
         aiReply = "Your monthly goal is ₱100,000. You can track your progress on the Dashboard. You're doing great, keep it up!";
      } else if (userText.includes('thank') || userText.includes('salamat')) {
        aiReply = "You're very welcome! I'm always here to help. 😊";
      }

      setIsTyping(false);
      setMessages((prev) => [...prev, { text: aiReply, sender: 'ai' }]);
    }, 1200); // 1.2 seconds delay para realistic
  };

  return (
    <div className={styles.wrapper}>
      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <div className={styles.headerTitle}>
              <Sparkles size={18} color="#f59e0b" />
              <span>PayTrack AI</span>
            </div>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}><X size={18} /></button>
          </div>
          
          <div className={styles.chatBody}>
            {messages.map((msg, i) => (
              <div key={i} className={`${styles.message} ${msg.sender === 'user' ? styles.userMsg : styles.aiMsg}`}>
                {msg.text}
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className={`${styles.message} ${styles.aiMsg} ${styles.typingIndicator}`}>
                <span></span><span></span><span></span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} className={styles.chatInputWrap}>
            <input 
              type="text" 
              placeholder="Ask me anything..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={styles.chatInput}
            />
            <button type="submit" className={styles.sendBtn}><Send size={16} /></button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button className={styles.floatingBtn} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Bot size={28} />}
        {!isOpen && <span className={styles.badge}>AI</span>}
      </button>
    </div>
  );
}