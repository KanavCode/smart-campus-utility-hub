import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Msg = { from: 'user' | 'bot'; text: string };

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([
    { from: 'bot', text: 'Hi! I am CampusBot — ask me about timetables, events, or how to get started.' },
  ]);
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg = { from: 'user' as const, text };
    setMessages((m) => [...m, userMsg]);
    setInput('');

    // static response logic
    setTimeout(() => {
      const botText = getStaticResponse(text);
      setMessages((m) => [...m, { from: 'bot', text: botText }]);
    }, 600);
  };

  const getStaticResponse = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes('hi') || t.includes('hello') || t.includes('hey')) return 'Hello! How can I help you today?';
    if (t.includes('timetable') || t.includes('schedule')) return 'You can view your timetable from the dashboard → My Timetable.';
    if (t.includes('event') || t.includes('events')) return 'To find events, go to the Events section. I can show popular events or help you RSVP.';
    if (t.includes('signup') || t.includes('create account')) return 'To create an account, click Get Started or go to the Signup tab on the Auth page.';
    if (t.includes('login') || t.includes('sign in')) return 'Use the Login tab on the Auth page. If you have trouble, reset your password via the profile page.';
    if (t.includes('help') || t.includes('support')) return 'For direct support, email support@campushub.example or use the contact page.';
    if (t.includes('admin')) return 'Admin features are available on the Admin Dashboard when signed in with an admin account.';
    if (t.includes('who are you') || t.includes('what can you do')) return 'I am a lightweight static assistant built into the frontend. I can point you to pages and common features.';
    // quick action triggers
    if (t.includes('go to dashboard') || t.includes('open dashboard')) {
      navigate('/dashboard');
      return 'Opening your dashboard...';
    }

    return "Sorry — I don't understand that yet. Try: 'timetable', 'events', 'signup' or 'help'.";
  };

  return (
    <div>
      {/* Floating button */}
      <div className="fixed right-6 bottom-6 z-[60]">
        <div className="flex items-end">
          {open && (
           <div className="w-[400px] md:w-[400px] max-h-[500vh] bg-background/80 backdrop-blur-md border border-border rounded-2xl shadow-lg overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <div className="font-semibold">CampusBot</div>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Close" className="p-1 rounded hover:bg-accent/10">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div ref={scrollRef} className="p-3 overflow-y-auto flex-1 space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.from === 'bot' ? 'items-start' : 'justify-end'}`}>
                    <div className={`${m.from === 'bot' ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'} px-3 py-2 rounded-lg max-w-[80%]`}> 
                      <div className="text-sm">{m.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-3 py-2 border-t border-border flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') send(input); }}
                  placeholder="Ask me about timetables, events, help..."
                  className="flex-1 bg-transparent outline-none px-3 py-2 rounded-md border border-border/60"
                />
                <button onClick={() => send(input)} className="p-2 rounded bg-primary text-primary-foreground">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Open chat"
            className="ml-3 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
          >
            <MessageCircle className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}