import React from 'react';
import ReactMarkdown from 'react-markdown';

interface CVPreviewProps {
  content: string;
}

const CVPreview: React.FC<CVPreviewProps> = ({ content }) => {
  if (!content) return null;

  return (
    <div 
      id="cv-preview-content"
      className="bg-white text-slate-900 p-8 md:p-12 shadow-2xl rounded-sm min-h-[29.7cm] w-full max-w-[21cm] mx-auto print:shadow-none print:p-0 print:w-full print:max-w-none"
      style={{ fontFamily: "'Georgia', serif" }}
    >
      <div className="prose prose-slate max-w-none print:prose-sm">
        <ReactMarkdown
          components={{
            h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-slate-900 text-center mb-2 border-b-0 uppercase tracking-wide" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-lg font-bold text-blue-900 uppercase border-b-2 border-blue-900 mt-6 mb-3 pb-1 tracking-wider" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-md font-bold text-slate-900 mt-4 mb-0 leading-tight" {...props} />,
            h4: ({node, ...props}) => <h4 className="text-sm font-medium text-slate-600 mb-2 mt-0 italic" {...props} />,
            p: ({node, ...props}) => {
                // Heuristic to detect contact info line (usually second paragraph or after h1)
                const isContact = props.children?.toString().includes('|') && props.children?.toString().includes('@');
                return <p className={`mb-2 text-sm leading-relaxed ${isContact ? 'text-center text-slate-600 font-medium -mt-2 mb-6' : 'text-justify'}`} {...props} />
            },
            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
            li: ({node, ...props}) => <li className="text-sm leading-snug pl-1 text-justify" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default CVPreview;