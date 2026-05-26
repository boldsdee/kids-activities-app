import React from 'react';
import { 
  Droplet, BookOpen, Paintbrush, Scissors, Dices, Eye, Beaker, 
  Flame, Music, Sparkles, Map, ClipboardList, Utensils, Hammer, CheckCircle
} from 'lucide-react';

const getIconForSentence = (sentence, color) => {
  const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
  
  for (let word of words) {
    if (['water', 'pour', 'liquid', 'wash'].includes(word)) return <Droplet size={24} color={color} strokeWidth={2.5} />;
    if (['read', 'bible', 'story', 'book'].includes(word)) return <BookOpen size={24} color={color} strokeWidth={2.5} />;
    if (['craft', 'draw', 'paper', 'color', 'paint'].includes(word)) return <Paintbrush size={24} color={color} strokeWidth={2.5} />;
    if (['cut', 'scissors'].includes(word)) return <Scissors size={24} color={color} strokeWidth={2.5} />;
    if (['game', 'play', 'puzzle'].includes(word)) return <Dices size={24} color={color} strokeWidth={2.5} />;
    if (['scavenger', 'hunt', 'outdoor', 'outside'].includes(word)) return <Map size={24} color={color} strokeWidth={2.5} />;
    if (['observe', 'look', 'record', 'findings'].includes(word)) return <Eye size={24} color={color} strokeWidth={2.5} />;
    if (['science', 'experiment', 'mix', 'stir', 'liquid'].includes(word)) return <Beaker size={24} color={color} strokeWidth={2.5} />;
    if (['bake', 'oven', 'heat'].includes(word)) return <Flame size={24} color={color} strokeWidth={2.5} />;
    if (['sing', 'music', 'song'].includes(word)) return <Music size={24} color={color} strokeWidth={2.5} />;
    if (['build', 'construct', 'make'].includes(word)) return <Hammer size={24} color={color} strokeWidth={2.5} />;
    if (['list', 'check', 'follow'].includes(word)) return <ClipboardList size={24} color={color} strokeWidth={2.5} />;
    if (['eat', 'food', 'snack'].includes(word)) return <Utensils size={24} color={color} strokeWidth={2.5} />;
    if (['pray', 'god', 'jesus'].includes(word)) return <Sparkles size={24} color={color} strokeWidth={2.5} />;
  }

  // Default icon
  return <CheckCircle size={24} color={color} strokeWidth={2.5} />;
};

const parseSteps = (text) => {
  if (!text) return [];
  // Split by . ! ? followed by space or end of string
  let steps = text.split(/[.!?]+(?:\s+|$)/).map(s => s.trim()).filter(s => s.length > 3);
  
  // If there's only 1 step, but it contains commas (e.g. "Cut paper, glue it, paint it")
  if (steps.length === 1 && steps[0].includes(',')) {
    steps = steps[0].split(/,\s*(?:then\s+|and\s+)?/i).map(s => s.trim()).filter(s => s.length > 2);
  }
  
  return steps;
};

const InfographicSteps = ({ instructions, color = '#A78BFA' }) => {
  const steps = parseSteps(instructions);

  if (steps.length === 0) return null;

  return (
    <div className="infographic-container" style={{ '--theme-color': color }}>
      <h4 className="infographic-title">Visual Guide</h4>
      <div className="timeline">
        {steps.map((step, index) => {
          const Icon = getIconForSentence(step, color);
          return (
            <div key={index} className="timeline-step">
              <div className="timeline-icon-wrapper" style={{ borderColor: color }}>
                <div className="timeline-icon-bg" style={{ backgroundColor: color }}></div>
                {Icon}
              </div>
              <div className="timeline-content">
                <span className="step-badge" style={{ backgroundColor: color }}>Step {index + 1}</span>
                <p>{step}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InfographicSteps;
