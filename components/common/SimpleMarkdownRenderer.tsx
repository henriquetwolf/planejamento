import React from 'react';

// This simple markdown renderer handles basic formatting used in the generated report.
const SimpleMarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const renderContent = () => {
        if (!content) return null;
        return content.split('\n').map((line, index) => {
            if (line.startsWith('## ')) {
                return <h2 key={index} className="text-2xl font-bold mt-6 mb-3 text-teal-800">{line.substring(3)}</h2>;
            }
            if (line.startsWith('# ')) {
                return <h1 key={index} className="text-3xl font-bold mt-8 mb-4 text-teal-900 border-b-2 border-teal-200 pb-2">{line.substring(2)}</h1>;
            }
             if (line.startsWith('### ')) {
                return <h3 key={index} className="text-xl font-semibold mt-4 mb-2 text-teal-700">{line.substring(4)}</h3>;
            }
            if (line.startsWith('- ')) {
                 return <li key={index} className="ml-6 list-disc">{line.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>;
            }
            if (line.trim() === '') {
                return <br key={index} />;
            }
            
            const parts = line.split('**');
            const styledLine = parts.map((part, i) => 
                i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : <span key={i}>{part}</span>
            );

            return <p key={index} className="text-gray-700 leading-relaxed my-2">{styledLine}</p>;
        });
    };

    return <div className="prose max-w-none">{renderContent()}</div>;
};

export default SimpleMarkdownRenderer;
