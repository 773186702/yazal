import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Send, 
  User, 
  Bot, 
  Loader2, 
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { ChatMessage, Project, Task, Transaction } from '../types';

interface AIAssistantProps {
  projects: Project[];
  tasks: Task[];
  transactions: Transaction[];
  businessName: string;
}

export default function AIAssistant({
  projects,
  tasks,
  transactions,
  businessName
}: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'أهلاً بك! أنا **مساعد يزل الذكي** 🤖✨ مستشارك الشخصي لتحليل الأعمال وإدارة البيانات.\n\nيمكنني مساعدتك في تحليل ميزانيتك، تقديم إحصائيات دقيقة عن المشاريع والمهام الحالية، صياغة مراسلات مهنية وعقود للعملاء، أو حتى تقديم توصيات استباقية لرفع مستويات الأداء المالي والإنتاجي.\n\nكيف يمكنني دعمك اليوم؟',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Gather app context to send to Gemini
      const stateContext = {
        businessName,
        projectsSummary: projects.map(p => ({
          name: p.name,
          manager: p.manager,
          status: p.status,
          budget: p.budget,
          progress: p.progress,
          startDate: p.startDate,
          endDate: p.endDate
        })),
        tasksSummary: tasks.map(t => ({
          title: t.title,
          status: t.status,
          priority: t.priority,
          assignedTo: t.assignedTo,
          dueDate: t.dueDate
        })),
        financialsSummary: {
          totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
          totalExpense: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
          transactionsCount: transactions.length,
          lastTransactions: transactions.slice(0, 5).map(t => ({
            type: t.type,
            category: t.category,
            amount: t.amount,
            date: t.date,
            description: t.description
          }))
        }
      };

      // Prepare request payload
      // Send message history along with the context
      const chatHistory = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: chatHistory,
          stateContext
        })
      });

      if (!response.ok) {
        throw new Error('فشل الخادم في الرد بالشكل الصحيح.');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant-${Math.floor(Math.random() * 1000000)}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: `${Date.now()}-err-${Math.floor(Math.random() * 1000000)}`,
        role: 'assistant',
        content: '⚠️ **عذراً، حدث خطأ أثناء الاتصال بالخادم الذكي.** يرجى التحقق من توفر اتصال بالشبكة أو إعداد مفتاح GEMINI_API_KEY بنجاح ثم المحاولة مجدداً.',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestionText: string) => {
    handleSend(suggestionText);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'أهلاً بك مجدداً! تم مسح سجل المحادثة. كيف يمكنني مساندة أعمالك وبياناتك في "يزل" الآن؟',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const suggestions = [
    'لخص لي الأداء المالي العام وصافي الأرباح الحقيقي',
    'ما هي المشاريع المتأخرة أو التي تحتاج لتقدم فوري؟',
    'اكتب بريد إلكتروني للعميل لؤي الحرك لتذكيره بالدفعة المالية القادمة',
    'قدم لي 3 مقترحات ملموسة لتقليص المصاريف التشغيلية'
  ];

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col md:flex-row gap-6">
      {/* Suggestions Sidebar panel (desktop) */}
      <div className="hidden md:flex md:w-80 flex-col gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shrink-0 h-full justify-between shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold">
            <HelpCircle className="w-5 h-5" />
            <h2 className="text-sm">اقتراحات الأسئلة والتحاليل</h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium">
            مساعد يزل يمتلك وعياً كاملاً بكافة البيانات المالية والمشاريع والمهام التي قمت بتسجيلها في لوحة التحكم، جرب نقر أحد الأسئلة التالية:
          </p>

          <div className="space-y-2.5 pt-2">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => handleSuggestionClick(s)}
                className="w-full text-right text-xs bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300 leading-normal block cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={clearChat}
          className="w-full flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          بدء محادثة جديدة
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col h-full overflow-hidden shadow-sm">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">مساعد يزل الاستشاري</h2>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-450 animate-ping"></span> متصل ويعمل بالذكاء الاصطناعي الفائق
              </p>
            </div>
          </div>
          
          {/* Mobile Clear Chat button */}
          <button
            onClick={clearChat}
            className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="مسح سجل المحادثة"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Bubbles Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
          {messages.map((message) => {
            const isBot = message.role === 'assistant';
            return (
              <div 
                key={message.id}
                className={`flex gap-3.5 max-w-[85%] ${isBot ? 'self-start mr-0 ml-auto' : 'flex-row-reverse mr-auto ml-0'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border text-xs font-bold ${
                  isBot 
                    ? 'bg-blue-50 dark:bg-blue-950 border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400' 
                    : 'bg-slate-100 dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-550 dark:text-slate-400'
                }`}>
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Bubble Container */}
                <div className="space-y-1">
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed border ${
                    isBot 
                      ? 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm' 
                      : 'bg-blue-600 border-blue-600 text-white font-semibold'
                  }`}>
                    {/* Render message with line breaks and basic markdown bolding */}
                    <span className="whitespace-pre-wrap block">
                      {message.content.split('\n').map((line, lIdx) => (
                        <span key={lIdx} className="block min-h-[0.5rem]">
                          {line.split('**').map((part, pIdx) => {
                            if (part && pIdx % 2 !== 0) {
                              return <strong key={pIdx} className={isBot ? "text-blue-600 dark:text-blue-400 font-extrabold" : "text-white font-extrabold"}>{part}</strong>;
                            }
                            return part;
                          })}
                        </span>
                      ))}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono block px-1 text-left">
                    {message.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Loading bubble */}
          {isLoading && (
            <div className="flex gap-3.5 max-w-[80%] self-start mr-0 ml-auto">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs shadow-sm">
                <span>يقوم مساعد يزل بتحليل بياناتك وصياغة الرد الأمثل...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestions Panel for mobile (visible only when no scrolling is active) */}
        <div className="p-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 flex gap-2 overflow-x-auto md:hidden whitespace-nowrap scrollbar-none">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSuggestionClick(s)}
              className="text-xs bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 inline-block font-semibold shadow-sm cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex gap-2.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اسأل يزل: لخص لي المشروع س، صِغ بريد للعملاء..."
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-colors shadow-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 text-white p-3 rounded-xl transition-all shadow-md flex items-center justify-center shadow-blue-500/10 cursor-pointer"
            >
              <Send className="w-4 h-4 scale-x-[-1]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
