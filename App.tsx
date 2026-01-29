import React, { useState, useRef, useEffect } from 'react';
import { Download, Sparkles, FileText, Wand2, MessageSquare, Send, User, Bot, Zap, RefreshCw, Printer, Loader2, Edit, Eye, X, MessageCircle } from 'lucide-react';
import { generateTailoredCV, chatWithAI } from './services/geminiService';
import CVPreview from './components/CVPreview';
import { MasterCVData, ChatMessage } from './types';
import { jsPDF } from 'jspdf';

// --- Master Data (Stateful in App for potential editing, but kept const here for initial) ---
const INITIAL_MASTER_CV_DATA: MasterCVData = {
  personalInfo: {
    name: "Tejaswee Singh",
    email: "t.tejaswee8@gmail.com",
    phone: "+33 745740529",
    location: "Paris, France (Open to Relocation)",
    nationality: "Indian",
    languages: "English (C1), Hindi (Native), French (A2)"
  },
  summary: "Engineer-Marketer Hybrid combining Mechanical Engineering expertise with top-tier FMCG/Automotive commercial experience. Proven track record in e-commerce strategy, product launches, revenue management, and cross-functional collaboration across European markets at L'Oréal and Nissan.",
  experiences: [
    {
      company: "Independent Consultant (Freelance)",
      title: "E-Commerce Operations & AI Automation",
      location: "Remote / Paris",
      dates: "Oct 2024 - Present",
      highlights: [
        "AI Video Production: Producing high-fidelity video assets using GenAI tools (Runway Gen-3, Pika), reducing production costs by 70%",
        "Workflow Automation: Implementing No-Code/Low-Code automation to streamline e-commerce operations",
        "LLM Integration & Fine-Tuning: Advised B2B SaaS client on integrating private fine-tuned LLM, projected 40% reduction in first-response time",
        "AI Journalist/Prompt Coach: Taught 50+ content creators on ethical AI tool usage (GPT-4, Midjourney, Runway)",
        "Process Optimization: Developing scalable SOPs for managing freelance talent and content pipelines"
      ],
      keywords: ["AI", "Automation", "GenAI", "LLM", "E-commerce", "Process Optimization", "Consulting"]
    },
    {
      company: "L'ORÉAL PARIS (L'Oréal Group)",
      title: "E-Commerce & Advocacy Manager / Commercial Operations Analyst",
      location: "Paris, France",
      dates: "Aug 2023 - Sep 2024",
      scope: "€1.3B Portfolio | 17 European Markets",
      highlights: [
        "Revenue Growth: Drove +17% top-line growth and +€3.2M market share capture through pricing strategy execution across 16+ EU markets",
        "Pricing & Promotional Excellence: Monitored pricing compliance and promotional execution, identifying gaps that optimized ROI by 15%",
        "Commercial P&L Analysis: Analyzed complex performance data using SQL and Power BI to generate actionable insights for Zone Directors",
        "Digital Shelf Management: Optimized Amazon A+ Content and PDPs, achieving 35% uplift in search visibility and conversion rates",
        "Supply Chain & Forecasting: Planned stock forecasts and managed critical inventory levels, ensuring Buy Box retention during peak events",
        "Cross-Functional Leadership: Partnered with Supply, Marketing, Finance, and IT teams to align revenue strategies and drive execution",
        "Competitive Intelligence: Conducted market research and competitor analysis to inform pricing guidelines and promotional investments",
        "Automation & Efficiency: Engineered automated data pipelines, saving 70% of manual reporting time",
        "Amazon Vendor Central: Implemented A/B testing for digital listings, improving conversion rates significantly"
      ],
      keywords: ["Revenue Management", "Pricing Strategy", "E-commerce", "Amazon", "Commercial Analysis", "P&L", "SQL", "Power BI", "Supply Chain", "Market Research", "Competitive Intelligence", "ROI Optimization", "Data Analytics"]
    },
    {
      company: "NISSAN MOTOR CORPORATION (AMIEO Region)",
      title: "Product Marketing Specialist & Commercial Strategy Analyst",
      location: "Paris, France",
      dates: "Dec 2022 - Jul 2023",
      highlights: [
        "GTM Strategy & Launch: Owned end-to-end Go-to-Market strategy for Nissan Juke MC across 30+ EMEA markets, coordinating pricing, channel strategy, and marketing execution",
        "Pricing & Positioning: Developed pricing scenarios and commercial models to optimize revenue potential across market segments",
        "Market Research: Conducted comprehensive competitive intelligence analysis, delivering insights that shaped strategic positioning",
        "Fleet Logistics & B2B Marketing: Managed press/dealer fleet logistics (50+ vehicles) and collaborated with LCV team on B2B messaging (TCO, residual value)",
        "Commercial Modeling: Analyzed trade-offs between volume, pricing, and promotional investment to maximize profitability",
        "Cross-Functional Coordination: Partnered with Engineering, Marketing, Sales, and Finance to align product specs with business objectives",
        "Dealer Communication: Developed Sales Guides translating technical specifications into compelling selling points"
      ],
      keywords: ["GTM Strategy", "Pricing Strategy", "Product Marketing", "Market Research", "Competitive Analysis", "Commercial Modeling", "B2B Marketing", "Automotive", "Fleet Management", "Product Launch"]
    },
    {
      company: "BIJOUTERIE PALA (Luxury Goods)",
      title: "Junior Marketing & E-Commerce Analyst",
      location: "Montpellier, France",
      dates: "Apr 2021 - Jul 2022",
      highlights: [
        "E-Commerce Launch: Managed end-to-end launch of new e-commerce platform, achieving 161% performance increase",
        "Optimization & Prioritization: Applied Agile principles to manage optimization backlog (SEO, CRO), prioritizing high-impact initiatives",
        "Data-Driven Growth: Delivered commercial insights through performance analysis and reporting"
      ],
      keywords: ["E-commerce", "Digital Marketing", "SEO", "CRO", "Agile", "Performance Analysis", "Project Management"]
    },
    {
      company: "MARUTI SUZUKI INDIA LTD.",
      title: "Quality Control Engineer",
      location: "New Delhi, India",
      dates: "Jun 2019 - Apr 2020",
      highlights: [
        "Process Engineering: Optimized assembly line operations, saving 3 man-hours per candidate in onboarding",
        "Quality Assurance: Executed stringent quality audits ensuring vehicle compliance with safety standards",
        "Operational Efficiency: Implemented Kaizen methodologies to resolve production bottlenecks"
      ],
      keywords: ["Quality Control", "Process Engineering", "Manufacturing", "Automotive", "Kaizen", "Operational Efficiency"]
    }
  ],
  education: [
    {
      degree: "6.S087: Models & Generative AI",
      institution: "Massachusetts Institute of Technology (MIT) xPro",
      dates: "Apr 2025 - Sep 2025"
    },
    {
      degree: "Master's in Digital Marketing & E-Business",
      institution: "INSEEC Business School",
      location: "Paris, France",
      dates: "Sep 2023 - Mar 2025"
    },
    {
      degree: "Master's in Management (MIM)",
      institution: "Montpellier Business School",
      location: "Montpellier, France",
      dates: "2021 - 2023"
    },
    {
      degree: "Bachelor of Mechanical Engineering",
      institution: "Rajiv Gandhi Proudyogiki Vishwavidyalaya (R.G.P.V)",
      location: "Bhopal, India",
      dates: "Jun 2015 - May 2019"
    }
  ],
  skills: {
    "Revenue & Commercial": ["Pricing Strategy", "Revenue Management", "Commercial P&L Analysis", "ROI Optimization", "Promotional Analysis", "Market Research", "Competitive Intelligence"],
    "Analytics & Data": ["Microsoft Excel (Advanced)", "SQL", "Power BI", "Google Analytics", "Nielsen Data", "Performance Analysis", "KPI Tracking", "Data Visualization"],
    "E-Commerce & Digital": ["Amazon Vendor Central", "Digital Shelf Management", "E-Commerce Strategy", "SEO/CRO", "A/B Testing", "Conversion Optimization"],
    "Product & Marketing": ["GTM Strategy", "Product Launch", "Product Marketing", "Campaign Management", "Content Strategy", "B2B Marketing"],
    "AI & Technology": ["GenAI Applications", "LLM Integration", "AI Automation", "Prompt Engineering", "Workflow Automation"],
    "Project Management": ["Agile Methodologies", "Cross-Functional Leadership", "Stakeholder Management", "Supply Chain Coordination", "Process Optimization"]
  },
  certifications: [
    "Fundamentals of Digital Marketing (Google)",
    "Agile Certification (Coursera)",
    "MIT xPro: Models & Generative AI"
  ]
};

const App: React.FC = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [tailoredCV, setTailoredCV] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Editor State
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen]);

  const handleGenerateCV = async () => {
    if (!jobDescription.trim()) {
      setError('Please provide a job description.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');
    setTailoredCV('');
    setViewMode('preview'); // Reset to preview on new generation

    try {
      const chatContext = chatMessages
        .map(m => `${m.role.toUpperCase()}: ${m.content}`)
        .join('\n');

      const result = await generateTailoredCV(INITIAL_MASTER_CV_DATA, jobDescription, chatContext);
      setTailoredCV(result);
      setSuccess('CV Generated successfully! Review and download below.');
    } catch (err: any) {
      setError(err.message || "An error occurred while generating the CV.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChatMessage = async () => {
    if (!chatInput.trim()) return;

    const newMessage: ChatMessage = { role: 'user', content: chatInput };
    const updatedMessages = [...chatMessages, newMessage];
    
    setChatMessages(updatedMessages);
    setChatInput('');

    try {
      const reply = await chatWithAI(updatedMessages, chatInput);
      setChatMessages([...updatedMessages, { role: 'model', content: reply }]);
    } catch (err) {
      console.error("Chat Error", err);
    }
  };

  // --- PDF GENERATOR V4: BOLD PARSING SUPPORT ---
  const downloadAsPDF = () => {
    if (!tailoredCV) {
      setError('No CV to download. Please generate one first.');
      return;
    }
    
    setIsDownloading(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // --- CONFIGURATION ---
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 12; 
      const maxLineWidth = pageWidth - (margin * 2);
      let yPos = 15;

      doc.setFont("times");

      // Helper to check page bounds
      const checkPageBreak = (heightNeeded: number) => {
        if (yPos + heightNeeded > pageHeight - margin) {
          doc.addPage();
          yPos = 15;
        }
      };

      // --- BOLD TEXT PARSER HELPER ---
      // Prints a line that might contain **bold** segments.
      // NOTE: Only supports simple inline bolding (no wrapping logic for mixed styles to keep it stable)
      const printLineWithBold = (line: string, x: number, y: number, fontSize: number, align: 'left' | 'center' | 'justify' = 'left', maxWidth?: number) => {
        
        // If line is too long and needs wrapping (and is NOT a header), fallback to standard print to avoid overlapping
        // We only apply mixed-style bolding to short lines or bullet headers (like Skills)
        const textWidth = doc.getTextWidth(line.replace(/\*\*/g, ''));
        if (maxWidth && textWidth > maxWidth && align === 'justify') {
           // Fallback for wrapped justified paragraphs: Strip bolding to ensure clean wrapping
           doc.setFontSize(fontSize);
           doc.setFont("times", "normal");
           doc.text(line.replace(/\*\*/g, ''), x, y, { maxWidth, align: 'justify' });
           return doc.getTextDimensions(line.replace(/\*\*/g, ''), { maxWidth }).h;
        }

        doc.setFontSize(fontSize);
        const parts = line.split(/(\*\*.*?\*\*)/g);
        let currentX = x;
        
        // Center alignment offset calculation if needed
        if (align === 'center') {
           currentX = (pageWidth - textWidth) / 2;
        }

        parts.forEach(part => {
           if (part.startsWith('**') && part.endsWith('**')) {
              const text = part.replace(/\*\*/g, '');
              doc.setFont("times", "bold");
              doc.text(text, currentX, y);
              currentX += doc.getTextWidth(text);
           } else if (part) {
              doc.setFont("times", "normal");
              doc.text(part, currentX, y);
              currentX += doc.getTextWidth(part);
           }
        });

        return fontSize * 0.3527 + 2; // Approximate height (mm)
      };


      const lines = tailoredCV.split('\n');

      for (let i = 0; i < lines.length; i++) {
        let cleanLine = lines[i].trim();
        // We keep bold markers in 'cleanLine' to parse them in 'printLineWithBold'
        // But for structural checks, we might want a raw string
        let rawLine = cleanLine.replace(/\*\*/g, ''); 
        
        if (!cleanLine) {
            if (yPos > 20) yPos += 3;
            continue;
        }

        if (cleanLine.startsWith('# ')) {
          // --- H1: NAME ---
          const text = rawLine.replace('# ', '').toUpperCase();
          doc.setFontSize(20);
          doc.setFont("times", "bold");
          
          checkPageBreak(12);
          doc.text(text, pageWidth / 2, yPos, { align: "center" });
          yPos += 9;

        } else if (cleanLine.startsWith('## ')) {
          // --- H2: SECTION HEADERS ---
          const text = rawLine.replace('## ', '').toUpperCase();
          doc.setFontSize(11);
          doc.setFont("times", "bold");
          doc.setTextColor(30, 58, 138); 
          
          checkPageBreak(10);
          yPos += 4;
          doc.text(text, margin, yPos);
          
          doc.setLineWidth(0.5);
          doc.setDrawColor(30, 58, 138);
          doc.line(margin, yPos + 1.5, pageWidth - margin, yPos + 1.5);
          
          doc.setTextColor(0, 0, 0); 
          yPos += 7;

        } else if (cleanLine.startsWith('### ')) {
          // --- H3: ROLE / COMPANY ---
          const roleText = rawLine.replace('### ', '');
          doc.setFontSize(10);
          doc.setFont("times", "bold");
          
          // Look ahead for H4 (Date)
          let dateText = "";
          if (i + 1 < lines.length && lines[i+1].trim().startsWith('####')) {
             dateText = lines[i+1].trim().replace('#### ', '').replace(/\*\*/g, '');
             i++; 
          }

          checkPageBreak(6);
          doc.text(roleText, margin, yPos);
          if (dateText) {
            doc.setFont("times", "italic");
            doc.text(dateText, pageWidth - margin, yPos, { align: "right" });
            doc.setFont("times", "bold");
          }
          yPos += 5;

        } else if (cleanLine.startsWith('- ')) {
           // --- BULLETS ---
           const text = cleanLine.replace('- ', ''); // Keep ** markers
           const bulletIndent = 4;
           const bulletWidth = maxLineWidth - bulletIndent;
           
           // Heuristic: If it starts with **, it's likely a Skill line (Short, non-wrapping)
           // If it's long, it's an experience bullet (Wrap, ignore bold)
           const isSkillLine = text.startsWith('**') && text.length < 100;
           
           if (isSkillLine) {
               // Skills: Support Bold Parsing
               doc.setFontSize(9.5);
               doc.setFont("times", "normal"); // Reset base
               checkPageBreak(6);
               doc.text("•", margin, yPos);
               printLineWithBold(text, margin + bulletIndent, yPos, 9.5);
               yPos += 5;
           } else {
               // Experience: Standard Wrapped Text
               doc.setFontSize(9.5);
               doc.setFont("times", "normal");
               
               const rawText = text.replace(/\*\*/g, ''); // Strip bold for wrapping safety
               const dims = doc.getTextDimensions(rawText, { maxWidth: bulletWidth });
               checkPageBreak(dims.h + 2);
               doc.text("•", margin, yPos);
               doc.text(rawText, margin + bulletIndent, yPos, { maxWidth: bulletWidth, align: "justify" });
               yPos += dims.h + 2;
           }

        } else if (cleanLine.startsWith('####')) {
             // Fallback H4
             const text = rawLine.replace('#### ', '');
             doc.setFontSize(9.5);
             doc.setFont("times", "italic");
             doc.text(text, pageWidth - margin, yPos - 5, { align: "right" });

        } else {
          // --- PARAGRAPHS ---
          // Check for Contact Info
          if (rawLine.includes('|') || rawLine.includes('@')) {
            doc.setFontSize(9.5);
            doc.setFont("times", "normal");
            checkPageBreak(6);
            doc.text(rawLine, pageWidth / 2, yPos, { align: "center" });
            yPos += 6;
          } else {
            // Summary Paragraph
            doc.setFontSize(9.5);
            doc.setFont("times", "normal");
            const dims = doc.getTextDimensions(rawLine, { maxWidth: maxLineWidth });
            checkPageBreak(dims.h + 2);
            doc.text(rawLine, margin, yPos, { maxWidth: maxLineWidth, align: "justify" });
            yPos += dims.h + 2;
          }
        }
      }

      doc.save('Tejaswee_Singh_CV.pdf');
    } catch (err: any) {
      console.error("Download failed", err);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-20 print:bg-white print:text-black print:pb-0 relative">
      
      {/* --- HEADER --- */}
      <header className="py-8 px-4 text-center print:hidden">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-3 rounded-full shadow-lg mb-4">
          <Zap className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Smart CV Builder AI</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 print:block print:w-full print:max-w-none print:p-0">
        
        {/* --- LEFT COLUMN: INPUT --- */}
        <div className={`lg:col-span-5 space-y-6 print:hidden ${tailoredCV ? '' : 'lg:col-start-4 lg:col-span-6'}`}>
          <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl">
             <div className="flex items-center gap-3 mb-4">
               <FileText className="w-6 h-6 text-purple-400" />
               <h2 className="text-lg font-semibold text-white">Job Context</h2>
             </div>
             <p className="text-xs text-slate-400 mb-2">Paste the Job Description to tailor your CV.</p>
             <textarea
               className="w-full h-64 bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm font-mono text-slate-300 focus:ring-2 focus:ring-purple-500 outline-none resize-none transition-all placeholder:text-slate-600"
               placeholder="Paste JD here..."
               value={jobDescription}
               onChange={(e) => setJobDescription(e.target.value)}
             />
             <div className="mt-4 flex justify-end">
               <button
                 onClick={handleGenerateCV}
                 disabled={isGenerating || !jobDescription}
                 className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${isGenerating ? 'bg-slate-600 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/30'}`}
               >
                 {isGenerating ? (
                   <>
                     <RefreshCw className="w-5 h-5 animate-spin" />
                     Thinking...
                   </>
                 ) : (
                   <>
                     <Wand2 className="w-5 h-5" />
                     Generate CV
                   </>
                 )}
               </button>
             </div>
          </div>
           {error && <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm">{error}</div>}
           {success && <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-200 p-4 rounded-xl text-sm">{success}</div>}
        </div>

        {/* --- RIGHT COLUMN: PREVIEW & EDIT --- */}
        {(tailoredCV || isGenerating) && (
          <div className="lg:col-span-7 animate-in slide-in-from-bottom-8 duration-500 print:col-span-12 print:block print:w-full">
             
             {/* Toolbar */}
             <div className="flex items-center justify-between mb-4 print:hidden">
                <div className="flex gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
                    <button 
                        onClick={() => setViewMode('preview')}
                        className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${viewMode === 'preview' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Eye className="w-4 h-4" /> Preview
                    </button>
                    <button 
                        onClick={() => setViewMode('edit')}
                        className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${viewMode === 'edit' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Edit className="w-4 h-4" /> Manual Edit
                    </button>
                </div>
                
                <button 
                     onClick={downloadAsPDF}
                     disabled={isDownloading}
                     className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-600 ${isDownloading ? 'bg-slate-600 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500'}`}
                   >
                     {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                     Download PDF
                </button>
             </div>

             {/* CV Container */}
             <div className="relative group min-h-[800px]">
                {isGenerating ? (
                  <div className="absolute inset-0 z-10 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center rounded-sm">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="font-medium text-indigo-200">Gemini is writing...</p>
                    </div>
                  </div>
                ) : (
                    <>
                        {viewMode === 'preview' ? (
                            <CVPreview content={tailoredCV} />
                        ) : (
                            <div className="w-full h-full bg-slate-800 rounded-xl border border-slate-700 p-4 shadow-inner">
                                <p className="text-xs text-slate-400 mb-2 font-mono">Markdown Mode: Edit precisely. Changes reflect in PDF.</p>
                                <textarea
                                    value={tailoredCV}
                                    onChange={(e) => setTailoredCV(e.target.value)}
                                    className="w-full h-[29.7cm] bg-slate-900 text-slate-200 font-mono text-sm p-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-none"
                                    spellCheck={false}
                                />
                            </div>
                        )}
                    </>
                )}
             </div>
          </div>
        )}
      </main>

      {/* --- FLOATING AI ASSISTANT --- */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end print:hidden">
          {isChatOpen ? (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-80 md:w-96 flex flex-col h-[500px] animate-in slide-in-from-bottom-10 fade-in duration-300 mb-4 overflow-hidden">
                  <div className="bg-indigo-600 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white font-semibold">
                          <Bot className="w-5 h-5" /> AI Consultant
                      </div>
                      <button onClick={() => setIsChatOpen(false)} className="text-white/80 hover:text-white transition-colors">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                      {chatMessages.length === 0 && (
                          <div className="text-center text-slate-500 mt-8 text-sm">
                              <p>Ask me to refine sections, suggest power verbs, or shorten bullets!</p>
                          </div>
                      )}
                      {chatMessages.map((msg, idx) => (
                          <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`p-3 rounded-2xl text-sm max-w-[85%] ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-slate-700 text-slate-200 rounded-bl-sm'}`}>
                                  {msg.content}
                              </div>
                          </div>
                      ))}
                      <div ref={chatEndRef} />
                  </div>

                  <div className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
                      <input 
                          className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                          placeholder="Ask for changes..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleChatMessage()}
                      />
                      <button 
                          onClick={handleChatMessage}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg"
                      >
                          <Send className="w-4 h-4" />
                      </button>
                  </div>
              </div>
          ) : (
              <button 
                  onClick={() => setIsChatOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-lg shadow-indigo-500/30 transition-transform hover:scale-105 flex items-center gap-2 font-semibold"
              >
                  <MessageCircle className="w-6 h-6" />
                  <span className="hidden md:inline">AI Assistant</span>
              </button>
          )}
      </div>

    </div>
  );
};

export default App;