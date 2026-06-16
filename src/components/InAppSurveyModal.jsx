import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { X, CheckCircle2 } from 'lucide-react';

// Flatten the 15 questions
const ALL_QUESTIONS = [
  // Variation 1
  { id: 'v1_q1', type: 'choice', text: "What is the single biggest challenge you face when trying to plan weekend or after-school activities?", options: ["I run out of fresh ideas", "Everything costs too much money", "I don't have time to research activities", "My kids outgrow activities too fast"] },
  { id: 'v1_q2', type: 'choice', text: "If an app could magically solve this problem for you, what is the #1 feature it absolutely must have?", options: ["A massive library of free/cheap ideas", "A drag-and-drop calendar builder", "Age-specific filtering", "Printable PDF schedules"] },
  { id: 'v1_q3', type: 'choice', text: "How much would you realistically be willing to pay per month for an app that perfectly solves this problem?", options: ["$1 - $3 / month", "$4 - $7 / month", "$8 - $15 / month", "I would only use a free version"] },
  // Variation 2
  { id: 'v2_q1', type: 'choice', text: "How do you feel when Friday afternoon hits and you have absolutely nothing planned?", options: ["Extremely stressed / Anxious", "A little guilty but I manage", "I prefer to wing it", "I usually just rely on screens/TV"] },
  { id: 'v2_q2', type: 'choice', text: "If there was a digital tool that took all that stress away, what would be its best feature?", options: ["Automatically suggesting an itinerary", "Having a database of indoor activities for rainy days", "Providing a printable checklist for the fridge", "Filtering activities by the supplies I already have"] },
  { id: 'v2_q3', type: 'choice', text: "What is a fair monthly price you would pay for a tool that completely eliminates your weekend planning stress?", options: ["$1 - $3 / month", "$4 - $7 / month", "$8 - $15 / month", "I would only use a free version"] },
  // Variation 3
  { id: 'v3_q1', type: 'choice', text: "Roughly how many hours a week do you currently spend scrolling Pinterest or Google searching for screen-free activities?", options: ["0 - 1 hours", "1 - 3 hours", "3 - 5 hours", "5+ hours"] },
  { id: 'v3_q2', type: 'choice', text: "If an app could cut that time down to just 5 minutes, what specific types of activities would you want it to recommend?", options: ["Quick 10-minute sensory crafts", "Outdoor & Nature activities", "Educational & STEM activities", "Low-mess / No-prep activities"] },
  { id: 'v3_q3', type: 'choice', text: "In terms of a monthly subscription, how much is saving those hours each month worth to you?", options: ["$1 - $3 / month", "$4 - $7 / month", "$8 - $15 / month", "I would only use a free version"] },
  // Variation 4
  { id: 'v4_q1', type: 'open', text: "What is your biggest hurdle when trying to find educational, budget-friendly activities for your curriculum or daily routine?" },
  { id: 'v4_q2', type: 'open', text: "If an app existed to organize your week, what specific tools (e.g., printable PDFs, budget filters, age ranges) would you find most useful?" },
  { id: 'v4_q3', type: 'open', text: "What monthly price would you consider a 'no-brainer' for a tool that organizes and provides all your educational activities? (Please type an amount)" },
  // Variation 5
  { id: 'v5_q1', type: 'open', text: "What is the most frustrating part about trying to keep your kids entertained on a budget?" },
  { id: 'v5_q2', type: 'open', text: "If you could design the perfect 'activity planner' app, what is the ONE feature it absolutely must have?" },
  { id: 'v5_q3', type: 'open', text: "How much would you realistically pay per month for an app like that? (Please specify)" }
];

const InAppSurveyModal = () => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hasAnsweredThisSession, setHasAnsweredThisSession] = useState(false);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!currentUser || !currentUser.profileData) return;
    if (hasAnsweredThisSession) return;

    const loginCount = currentUser.profileData.loginCount || 0;
    const surveyIndex = currentUser.profileData.surveyIndex || 0;

    // If they have answered all 15 questions, never show again
    if (surveyIndex >= ALL_QUESTIONS.length) return;

    // TESTING OVERRIDE: Show on EVERY login until May 30th, 2026.
    // After that, it reverts to the "every 5 logins" rule.
    const isTestingWindow = new Date() < new Date('2026-05-30T00:00:00Z');
    
    // During testing, loginCount % 1 === 0 is always true. 
    // Normally, loginCount % 5 === 0 ensures it only fires every 5th login.
    const interval = isTestingWindow ? 1 : 5;
    
    if (loginCount > 0 && loginCount % interval === 0) {
      // Small delay so it doesn't jarringly pop up the millisecond they log in
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [currentUser, hasAnsweredThisSession]);

  if (!isOpen || !currentUser) return null;

  const surveyIndex = currentUser.profileData.surveyIndex || 0;
  const currentQuestion = ALL_QUESTIONS[surveyIndex];

  if (!currentQuestion) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setIsSubmitting(true);
    try {
      // 1. Save response
      await addDoc(collection(db, 'survey_responses'), {
        userId: currentUser.uid,
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        answer: answer,
        submittedAt: new Date().toISOString()
      });

      // 2. Increment survey index in user profile
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        surveyIndex: surveyIndex + 1
      });

      // 3. Show success message
      setShowSuccess(true);
      setHasAnsweredThisSession(true);
      
      // Close modal after a delay
      setTimeout(() => {
        setIsOpen(false);
        setShowSuccess(false);
        setAnswer('');
      }, 2000);

    } catch (error) {
      console.error("Failed to submit survey", error);
      alert("Error: Missing database permissions. Did you remember to publish the new Firestore rules in your Firebase Console?");
    }
    setIsSubmitting(false);
  };

  const closeAndSkip = () => {
    setIsOpen(false);
    // Note: We do NOT set hasAnsweredThisSession to true here, because if they refresh the page 
    // on the same login session, we might want to ask them again. Or we can set it to true if we don't want to nag.
    setHasAnsweredThisSession(true); 
  };

  if (showSuccess) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', backdropFilter: 'blur(4px)' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}>
          <CheckCircle2 size={48} color="#34D399" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '24px', margin: '0 0 8px 0', color: 'var(--text-main)', fontFamily: 'Outfit' }}>Thank You!</h2>
          <p style={{ color: 'var(--text-soft)', margin: 0, fontSize: '15px' }}>Your feedback is incredibly valuable.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', maxWidth: '500px', width: '100%', boxShadow: '0 24px 48px rgba(0,0,0,0.5)', position: 'relative' }}>
        
        <button onClick={closeAndSkip} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-soft)', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ marginBottom: '24px' }}>
          <span style={{ display: 'inline-block', background: 'rgba(167, 139, 250, 0.1)', color: '#A78BFA', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
            Quick Question ({surveyIndex + 1}/15)
          </span>
          <h2 style={{ fontSize: '20px', color: 'var(--text-main)', margin: '0', lineHeight: '1.4', fontFamily: 'Outfit' }}>
            {currentQuestion.text}
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          {currentQuestion.type === 'choice' ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {currentQuestion.options.map(option => (
                <div 
                  key={option} 
                  onClick={() => setAnswer(option)}
                  style={{ 
                    padding: '16px', borderRadius: '12px', 
                    border: answer === option ? '2px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.1)', 
                    background: answer === option ? 'rgba(167, 139, 250, 0.1)' : 'rgba(0, 0, 0, 0.2)',
                    color: answer === option ? '#fff' : 'var(--text-soft)',
                    cursor: 'pointer', transition: 'all 0.2s', fontSize: '15px'
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
          ) : (
            <textarea 
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              style={{
                width: '100%', minHeight: '120px', padding: '16px', borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0, 0, 0, 0.2)',
                color: '#F1F0FF', fontFamily: 'Outfit', fontSize: '15px', resize: 'vertical', boxSizing: 'border-box'
              }}
            />
          )}

          <button 
            type="submit" 
            disabled={!answer.trim() || isSubmitting}
            style={{ 
              width: '100%', padding: '16px', borderRadius: '14px', background: 'var(--primary)', color: '#fff', border: 'none', 
              cursor: (!answer.trim() || isSubmitting) ? 'not-allowed' : 'pointer', fontFamily: 'Outfit', fontWeight: 'bold', fontSize: '16px',
              opacity: (!answer.trim() || isSubmitting) ? 0.5 : 1, marginTop: '24px'
            }}
          >
            {isSubmitting ? 'Saving...' : 'Submit Feedback'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default InAppSurveyModal;
