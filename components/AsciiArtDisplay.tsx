import React, { useState, useEffect } from 'react';
import type { AsciiArtData } from '../services/geminiService';

interface AsciiArtDisplayProps {
  artData: AsciiArtData | null;
  topic: string;
}

const AsciiArtDisplay: React.FC<AsciiArtDisplayProps> = ({ artData, topic }) => {
  const [visibleContent, setVisibleContent] = useState<string>('*');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  useEffect(() => {
    let intervalId: number;

    if (artData) {
      setVisibleContent('');
      setIsStreaming(true);

     
      const fullText = artData.text ? `${artData.art}\n\n${artData.text}` : artData.art;
      let currentIndex = 0;
      
      intervalId = window.setInterval(() => {
        const char = fullText[currentIndex];
        if (char !== undefined) {
          setVisibleContent(prev => prev + char);
          currentIndex++;
        } else {
         
          window.clearInterval(intervalId);
          setIsStreaming(false);
        }
      }, 5);

    } else {
     
      setVisibleContent('*');
      setIsStreaming(false);
    }
    
   
    return () => window.clearInterval(intervalId);
  }, [artData]);

  const accessibilityLabel = `ASCII art for ${topic}`;

  return (
    /*{ <pre className="ascii-art" aria-label={accessibilityLabel}>
      {visibleContent}
      {isStreaming && <span className="blinking-cursor">|</span>}
    </pre> }*/
    <div></div>
  );
};

export default AsciiArtDisplay;