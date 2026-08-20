import React, { useEffect, useState } from 'react';

interface ScrambleTextProps {
  text: string;
  className?: string;
  duration?: number; // total duration in ms
  delay?: number; // delay in ms
  scrambleCharacters?: string;
}

export const ScrambleText: React.FC<ScrambleTextProps> = ({ 
  text, 
  className = '', 
  duration = 800,
  delay = 0,
  scrambleCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    const startAnimation = () => {
      let iteration = 0;
      const maxIterations = text.length;
      const step = duration / maxIterations;

      intervalId = setInterval(() => {
        setDisplayText((current) => {
          return text
            .split('')
            .map((char, index) => {
              if (index < iteration) {
                return text[index];
              }
              if (char === ' ') return ' ';
              return scrambleCharacters[Math.floor(Math.random() * scrambleCharacters.length)];
            })
            .join('');
        });

        if (iteration >= maxIterations) {
          clearInterval(intervalId);
          setIsDone(true);
        }

        iteration += 1/3; // Controls speed of reveal vs scramble
      }, step);
    };

    if (delay > 0) {
      // Just show scrambled random string of same length during delay
      setDisplayText(text.split('').map(c => c === ' ' ? ' ' : scrambleCharacters[Math.floor(Math.random() * scrambleCharacters.length)]).join(''));
      timeoutId = setTimeout(startAnimation, delay);
    } else {
      startAnimation();
    }

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [text, duration, delay, scrambleCharacters]);

  return (
    <span className={className}>
      {displayText}
    </span>
  );
};
