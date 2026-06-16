import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { CheckCircle } from 'lucide-react';

const variations = {
  1: {
    title: "Variation 1 (Practical)",
    q1: "What is the single biggest challenge you face when trying to plan weekend or after-school activities for your kids?",
    q2: "If an app could magically solve this problem for you, what are the top 2 features it absolutely must have?",
    q3: "How much would you realistically be willing to pay per month for an app that perfectly solves this problem?",
    q3Options: ["£1 - £3 / month", "£4 - £7 / month", "£8 - £15 / month", "I would only use a free version"]
  },
  2: {
    title: "Variation 2 (Emotional)",
    q1: "How do you feel when Friday afternoon hits and you have absolutely nothing planned to keep the kids entertained this weekend?",
    q2: "If there was a digital tool that took all that stress away, what exactly would it look like to you?",
    q3: "What is a fair monthly price you would pay for a tool that completely eliminates your weekend planning stress?",
    q3Options: null
  },
  3: {
    title: "Variation 3 (Time-Saving)",
    q1: "Roughly how many hours a week do you currently spend scrolling Pinterest or Google searching for screen-free activities for your kids?",
    q2: "If an app could cut that time down to just 5 minutes, what specific types of activities would you want it to recommend?",
    q3: "In terms of a monthly subscription, how much is saving those hours each month worth to you?",
    q3Options: null
  },
  4: {
    title: "Variation 4 (Educator)",
    q1: "What is your biggest hurdle when trying to find educational, budget-friendly activities for your curriculum or daily routine?",
    q2: "If an app existed to organize your week, what specific tools (e.g., printable PDFs, budget filters, age ranges) would you find most useful?",
    q3: "What monthly price would you consider a \"no-brainer\" for a tool that organizes and provides all your educational activities?",
    q3Options: null
  },
  5: {
    title: "Variation 5 (Punchy)",
    q1: "What is the most frustrating part about trying to keep your kids entertained on a budget?",
    q2: "If you could design the perfect \"activity planner\" app, what is the one feature it absolutely must have?",
    q3: "How much would you realistically pay per month for an app like that?",
    q3Options: null
  }
};

const PublicSurvey = () => {
  const [searchParams] = useSearchParams();
  const vParam = searchParams.get('v');
  const v = variations[vParam] ? vParam : '1';
  const survey = variations[v];

  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedAnswer = `Q1: ${answers.q1}\n\nQ2: ${answers.q2}\n\nQ3: ${answers.q3}`;
      
      await addDoc(collection(db, 'survey_responses'), {
        source: 'public_survey',
        variation: v,
        surveyTitle: `Market Research (${survey.title})`,
        answer: formattedAnswer,
        rawAnswers: answers,
        submittedAt: serverTimestamp()
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting survey:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#0F0F14', color: '#fff', fontFamily: 'Outfit', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <CheckCircle size={64} color="#34D399" style={{ margin: '0 auto 24px auto' }} />
          <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>Thank you!</h1>
          <p style={{ color: 'var(--text-soft)', fontSize: '18px', lineHeight: 1.6 }}>
            Your feedback is incredibly helpful. Thank you for taking the time to share your thoughts with us!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F14', color: '#fff', fontFamily: 'Outfit', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>
      
      <div style={{ maxWidth: '700px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '12px' }}>Quick Parent Survey</h1>
          <p style={{ color: 'var(--text-soft)', fontSize: '18px' }}>It only takes 30 seconds, but your feedback means the world to us.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
          
          {/* Question 1 */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', lineHeight: 1.4 }}>
              1. {survey.q1}
            </label>
            <textarea 
              required
              value={answers.q1}
              onChange={(e) => setAnswers({...answers, q1: e.target.value})}
              placeholder="Type your answer here..."
              style={{ width: '100%', minHeight: '100px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'Outfit', fontSize: '16px', outline: 'none', resize: 'vertical' }}
            />
          </div>

          {/* Question 2 */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', lineHeight: 1.4 }}>
              2. {survey.q2}
            </label>
            <textarea 
              required
              value={answers.q2}
              onChange={(e) => setAnswers({...answers, q2: e.target.value})}
              placeholder="Type your answer here..."
              style={{ width: '100%', minHeight: '100px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'Outfit', fontSize: '16px', outline: 'none', resize: 'vertical' }}
            />
          </div>

          {/* Question 3 */}
          <div style={{ marginBottom: '40px' }}>
            <label style={{ display: 'block', fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', lineHeight: 1.4 }}>
              3. {survey.q3}
            </label>
            
            {survey.q3Options ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {survey.q3Options.map((opt, idx) => (
                  <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', cursor: 'pointer', border: answers.q3 === opt ? '1px solid var(--p-mint)' : '1px solid rgba(255,255,255,0.1)' }}>
                    <input 
                      type="radio" 
                      name="q3" 
                      value={opt}
                      checked={answers.q3 === opt}
                      onChange={(e) => setAnswers({...answers, q3: e.target.value})}
                      required
                      style={{ width: '20px', height: '20px', accentColor: 'var(--p-mint)' }}
                    />
                    <span style={{ fontSize: '16px' }}>{opt}</span>
                  </label>
                ))}
              </div>
            ) : (
              <input 
                type="text"
                required
                value={answers.q3}
                onChange={(e) => setAnswers({...answers, q3: e.target.value})}
                placeholder="e.g., £5 / month"
                style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'Outfit', fontSize: '16px', outline: 'none' }}
              />
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', background: 'var(--p-mint)', color: '#0F0F14', padding: '18px', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Outfit' }}
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default PublicSurvey;
