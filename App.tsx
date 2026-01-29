import React, { useState, useRef, useEffect } from 'react';
import { Download, Sparkles, FileText, Wand2, MessageSquare, Send, User, Bot, Zap, RefreshCw, Printer, Loader2, Edit, Eye, X, MessageCircle, PenTool, Copy, Check, Globe } from 'lucide-react';
import { generateTailoredCV, generateCoverLetter, chatWithAI } from './services/geminiService';
import CVPreview from './components/CVPreview';
import { MasterCVData, ChatMessage } from './types';
import { jsPDF } from 'jspdf';

// --- Master Data ---
const INITIAL_MASTER_CV_DATA: MasterCVData = {
  personalInfo: {
    name: "Tejaswee Singh",
    email: "t.tejaswee8@gmail.com",
    phone: "+33 745740529",
    location: "Paris, France",
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
        "GTM Strategy & Launch: Owned end-to-end Go-to-Market strategy for Nissan Juke MC across 5 EMEA markets, coordinating pricing, channel strategy, and marketing execution",
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
  const [filenameBase, setFilenameBase] = useState('CV');
  const [language, setLanguage] = useState<'EN' | 'FR'>('EN');
  
  // CV Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Cover Letter State
  const [coverLetter, setCoverLetter] = useState('');
  const [isGeneratingCL, setIsGeneratingCL] = useState(false);
  const [clCopied, setClCopied] = useState(false);
  
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

  const handleGenerateAll = async () => {
    if (!jobDescription.trim()) {
      setError('Please provide a job description.');
      return;
    }

    setIsGenerating(true);
    setIsGeneratingCL(true);
    setError('');
    setSuccess('');
    setTailoredCV('');
    setCoverLetter('');
    setViewMode('preview');

    try {
      const chatContext = chatMessages
        .map(m => `${m.role.toUpperCase()}: ${m.content}`)
        .join('\n');

      // 1. Generate CV
      const rawResult = await generateTailoredCV(INITIAL_MASTER_CV_DATA, jobDescription, chatContext, language);
      
      const metadataRegex = /<!-- METADATA: (.*?) -->/;
      const match = rawResult.match(metadataRegex);
      let cleanCV = rawResult;
      
      if (match) {
        setFilenameBase(match[1].trim());
        cleanCV = rawResult.replace(metadataRegex, '').trim();
      } else {
        setFilenameBase('Tailored_CV');
      }

      setTailoredCV(cleanCV);
      setSuccess('CV & Cover Letter Generated successfully!');

      // 2. Generate Cover Letter (can be parallelized, but sequential allows error isolation)
      try {
        const clResult = await generateCoverLetter(INITIAL_MASTER_CV_DATA, jobDescription, language);
        setCoverLetter(clResult);
      } catch (clErr) {
        console.error("CL Generation failed", clErr);
        // Don't block UI, just leave CL empty or show error in CL box
      }

    } catch (err: any) {
      setError(err.message || "An error occurred while generating.");
    } finally {
      setIsGenerating(false);
      setIsGeneratingCL(false);
    }
  };

  const handleGenerateCoverLetterOnly = async () => {
     if (!jobDescription.trim()) return;
     setIsGeneratingCL(true);
     try {
        const clResult = await generateCoverLetter(INITIAL_MASTER_CV_DATA, jobDescription, language);
        setCoverLetter(clResult);
     } catch(e) {
        console.error(e);
     } finally {
        setIsGeneratingCL(false);
     }
  }

  const copyCoverLetter = () => {
    navigator.clipboard.writeText(coverLetter);
    setClCopied(true);
    setTimeout(() => setClCopied(false), 2000);
  };

  const handleChatMessage = async () => {
    if (!chatInput.trim()) return;

    const newMessage: ChatMessage = { role: 'user', content: chatInput };
    const updatedMessages = [...chatMessages, newMessage];
    
    setChatMessages(updatedMessages);
    setChatInput('');

    try {
      // Pass the current CV as context to the AI
      const reply = await chatWithAI(updatedMessages, chatInput, tailoredCV || "CV not generated yet.");
      setChatMessages([...updatedMessages, { role: 'model', content: reply }]);
    } catch (err) {
      console.error("Chat Error", err);
    }
  };

  // --- PDF GENERATOR ---
  const downloadAsPDF = () => {
    if (!tailoredCV) {
      setError('No CV to download. Please generate one first.');
      return;
    }
    
    setIsDownloading(true);

    try {
      const date = new Date();
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' });
      const dateStr = `${day}_${month}`;
      const safeFilenameBase = filenameBase.replace(/[^a-zA-Z0-9_]/g, '_');
      const langSuffix = language;
      const finalFilename = `${safeFilenameBase}_${dateStr}_${langSuffix}.pdf`;

      const renderDocument = (doc: jsPDF, dryRun: boolean): number => {
          const pageWidth = 210;
          const margin = 12;
          const maxLineWidth = pageWidth - (margin * 2);
          let yPos = 15;

          const printLineWithBold = (line: string, x: number, y: number, fontSize: number, align: 'left' | 'center' | 'justify' = 'left', maxWidth?: number) => {
              const textWidth = doc.getTextWidth(line.replace(/\*\*/g, ''));
              
              if (maxWidth && textWidth > maxWidth && align === 'justify') {
                  doc.setFontSize(fontSize);
                  doc.setFont("times", "normal");
                  if (!dryRun) doc.text(line.replace(/\*\*/g, ''), x, y, { maxWidth, align: 'justify' });
                  return doc.getTextDimensions(line.replace(/\*\*/g, ''), { maxWidth }).h;
              }

              doc.setFontSize(fontSize);
              const parts = line.split(/(\*\*.*?\*\*)/g);
              let currentX = x;
              
              if (align === 'center') {
                  currentX = (pageWidth - textWidth) / 2;
              }

              parts.forEach(part => {
                  const isBold = part.startsWith('**') && part.endsWith('**');
                  const cleanPart = part.replace(/\*\*/g, '');
                  
                  if (!dryRun) {
                      doc.setFont("times", isBold ? "bold" : "normal");
                      if (cleanPart) doc.text(cleanPart, currentX, y);
                  }
                  currentX += doc.getTextWidth(cleanPart);
              });

              return fontSize * 0.3527 + 2; 
          };

          const lines = tailoredCV.split('\n');

          for (let i = 0; i < lines.length; i++) {
            let cleanLine = lines[i].trim();
            let rawLine = cleanLine.replace(/\*\*/g, '');

            if (!cleanLine) {
                if (yPos > 20) yPos += 3;
                continue;
            }

            if (cleanLine.startsWith('# ')) {
                const text = rawLine.replace('# ', '').toUpperCase();
                doc.setFontSize(20);
                doc.setFont("times", "bold");
                if (!dryRun) doc.text(text, pageWidth / 2, yPos, { align: "center" });
                yPos += 9;

            } else if (cleanLine.startsWith('## ')) {
                const text = rawLine.replace('## ', '').toUpperCase();
                doc.setFontSize(11);
                doc.setFont("times", "bold");
                doc.setTextColor(30, 58, 138);
                if (!dryRun) {
                    doc.text(text, margin, yPos);
                    doc.setLineWidth(0.5);
                    doc.setDrawColor(30, 58, 138);
                    doc.line(margin, yPos + 1.5, pageWidth - margin, yPos + 1.5);
                    doc.setTextColor(0, 0, 0);
                }
                yPos += 7;

            } else if (cleanLine.startsWith('### ')) {
                const roleText = rawLine.replace('### ', '');
                doc.setFontSize(10);
                doc.setFont("times", "bold");
                
                let dateText = "";
                if (i + 1 < lines.length && lines[i+1].trim().startsWith('####')) {
                    dateText = lines[i+1].trim().replace('#### ', '').replace(/\*\*/g, '');
                    i++;
                }

                if (!dryRun) {
                    doc.text(roleText, margin, yPos);
                    if (dateText) {
                        doc.setFont("times", "italic");
                        doc.text(dateText, pageWidth - margin, yPos, { align: "right" });
                        doc.setFont("times", "bold");
                    }
                }
                yPos += 5;

            } else if (cleanLine.startsWith('- ')) {
                const text = cleanLine.replace('- ', '');
                const bulletIndent = 4;
                const isSkillLine = text.startsWith('**') && text.length < 100;

                doc.setFontSize(9.5);
                doc.setFont("times", "normal");

                if (isSkillLine) {
                    if (!dryRun) doc.text("•", margin, yPos);
                    yPos += printLineWithBold(text, margin + bulletIndent, yPos, 9.5) - 2 + 5;
                } else {
                    const rawText = text.replace(/\*\*/g, '');
                    const dims = doc.getTextDimensions(rawText, { maxWidth: maxLineWidth - bulletIndent });
                    if (!dryRun) {
                        doc.text("•", margin, yPos);
                        doc.text(rawText, margin + bulletIndent, yPos, { maxWidth: maxLineWidth - bulletIndent, align: "justify" });
                    }
                    yPos += dims.h + 2;
                }

            } else if (cleanLine.startsWith('####')) {
                const text = rawLine.replace('#### ', '');
                doc.setFontSize(9.5);
                doc.setFont("times", "italic");
                if (!dryRun) doc.text(text, pageWidth - margin, yPos - 5, { align: "right" });

            } else {
                doc.setFontSize(9.5);
                doc.setFont("times", "normal");
                
                if (rawLine.includes('|') || rawLine.includes('@')) {
                    const parts = rawLine.split('|').map(p => p.trim());
                    let totalWidth = 0;
                    const gap = 3;
                    
                    // Parse parts to check for Markdown links [Text](URL)
                    const parsedParts = parts.map(part => {
                        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
                        if (linkMatch) {
                            return { text: linkMatch[1], url: linkMatch[2], isLink: true };
                        }
                        return { text: part, url: '', isLink: false };
                    });

                    // Calculate widths using text content only
                    const widths = parsedParts.map(p => doc.getTextWidth(p.text));
                    
                    totalWidth = widths.reduce((a, b) => a + b, 0) + (parts.length - 1) * gap;
                    let currentX = (pageWidth - totalWidth) / 2;

                    parsedParts.forEach((partObj, idx) => {
                        if (!dryRun) {
                            if (partObj.isLink) {
                                doc.setTextColor(0, 0, 128); // Navy Blue
                                doc.text(partObj.text, currentX, yPos);
                                doc.link(currentX, yPos - 3, widths[idx], 4, { url: partObj.url });
                                doc.setTextColor(0,0,0);
                            } else {
                                // Heuristic for raw URLs or emails if needed, but primary is Markdown link
                                const isRawUrl = partObj.text.toLowerCase().includes('http');
                                if (isRawUrl) {
                                    doc.setTextColor(0, 0, 128);
                                    doc.text(partObj.text, currentX, yPos);
                                    doc.link(currentX, yPos - 3, widths[idx], 4, { url: partObj.text.startsWith('http') ? partObj.text : `https://${partObj.text}` });
                                    doc.setTextColor(0,0,0);
                                } else {
                                    doc.text(partObj.text, currentX, yPos);
                                }
                            }
                        }
                        
                        currentX += widths[idx];
                        if (idx < parts.length - 1) {
                            currentX += gap / 2;
                            if(!dryRun) doc.text('|', currentX - gap/2 + 0.5, yPos);
                            currentX += gap / 2;
                        }
                    });

                    yPos += 6;
                } else {
                    const dims = doc.getTextDimensions(rawLine, { maxWidth: maxLineWidth });
                    if (!dryRun) doc.text(rawLine, margin, yPos, { maxWidth: maxLineWidth, align: "justify" });
                    yPos += dims.h + 2;
                }
            }
          }
          return yPos;
      };

      const measureDoc = new jsPDF({ unit: 'mm', format: 'a4' });
      measureDoc.setFont("times");
      const requiredHeight = renderDocument(measureDoc, true);
      const finalHeight = Math.max(297, requiredHeight + 20); 

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [210, finalHeight]
      });
      doc.setFont("times");

      renderDocument(doc, false);

      doc.save(finalFilename);

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
        
        {/* --- LEFT COLUMN: INPUTS --- */}
        <div className={`lg:col-span-5 space-y-6 print:hidden ${tailoredCV ? '' : 'lg:col-start-4 lg:col-span-6'}`}>
          
          {/* JOB DESCRIPTION CARD */}
          <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                 <FileText className="w-6 h-6 text-purple-400" />
                 <h2 className="text-lg font-semibold text-white">Job Context</h2>
               </div>
               
               {/* LANGUAGE TOGGLE */}
               <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-700">
                  <button 
                    onClick={() => setLanguage('EN')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${language === 'EN' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}
                  >
                    EN
                  </button>
                  <button 
                    onClick={() => setLanguage('FR')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${language === 'FR' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}
                  >
                    FR
                  </button>
               </div>
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
                 onClick={handleGenerateAll}
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
                     Generate All
                   </>
                 )}
               </button>
             </div>
          </div>

          {/* COVER LETTER CARD */}
          <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                 <PenTool className="w-6 h-6 text-pink-400" />
                 <h2 className="text-lg font-semibold text-white">Cover Letter AI</h2>
               </div>
               <button
                  onClick={handleGenerateCoverLetterOnly}
                  disabled={isGeneratingCL || !jobDescription}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isGeneratingCL ? 'bg-slate-700 text-slate-400' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
               >
                 {isGeneratingCL ? "Updating..." : "Regenerate Draft"}
               </button>
             </div>

             {coverLetter ? (
               <div className="relative group">
                 <textarea
                   value={coverLetter}
                   onChange={(e) => setCoverLetter(e.target.value)}
                   className="w-full h-64 bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm font-sans text-slate-300 focus:ring-2 focus:ring-pink-500 outline-none resize-none transition-all leading-relaxed whitespace-pre-wrap"
                   placeholder="Your cover letter will appear here..."
                 />
                 <button 
                   onClick={copyCoverLetter}
                   className="absolute top-4 right-4 p-2 bg-slate-800/80 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100"
                   title="Copy to Clipboard"
                 >
                   {clCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                 </button>
               </div>
             ) : (
               <div className="h-24 bg-slate-900/50 rounded-xl border border-slate-700 border-dashed flex items-center justify-center text-slate-500 text-sm">
                  <p>Paste a JD above to automatically generate.</p>
               </div>
             )}
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