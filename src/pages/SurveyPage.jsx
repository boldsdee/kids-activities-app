import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { CheckCircle2 } from 'lucide-react';

const surveys = {
  1: {
    title: "Weekend Planning Survey",
    description: "Help us understand how parents handle weekend planning. It takes 30 seconds!",
    questions: [
      {
        id: 'q1',
        type: 'choice',
        text: "What is the single biggest challenge you face when trying to plan weekend or after-school activities?",
        options: [
          "I run out of fresh ideas",
          "Everything costs too much money",
          "I don't have time to research activities",
          "My kids outgrow activities too fast"
        ]
      },
      {
        id: 'q2',
        type: 'choice',
        text: "If an app could magically solve this problem for you, what is the #1 feature it absolutely must have?",
        options: [
          "A massive library of free/cheap ideas",
          "A drag-and-drop calendar builder",
          "Age-specific filtering",
          "Printable PDF schedules"
        ]
      },
      {
        id: 'q3',
        type: 'choice',
        text: "How much would you realistically be willing to pay per month for an app that perfectly solves this problem?",
        options: [
          "$1 - $3 / month",
          "$4 - $7 / month",
          "$8 - $15 / month",
          "I would only use a free version"
        ]
      }
    ]
  },
  2: {
    title: "Parenting Stress Survey",
    description: "We are trying to understand the mental load of organizing kids' activities. We value your input!",
    questions: [
      {
        id: 'q1',
        type: 'choice',
        text: "How do you feel when Friday afternoon hits and you have absolutely nothing planned?",
        options: [
          "Extremely stressed / Anxious",
          "A little guilty but I manage",
          "I prefer to wing it",
          "I usually just rely on screens/TV"
        ]
      },
      {
        id: 'q2',
        type: 'choice',
        text: "If there was a digital tool that took all that stress away, what would be its best feature?",
        options: [
          "Automatically suggesting an itinerary",
          "Having a database of indoor activities for rainy days",
          "Providing a printable checklist for the fridge",
          "Filtering activities by the supplies I already have"
        ]
      },
      {
        id: 'q3',
        type: 'choice',
        text: "What is a fair monthly price you would pay for a tool that completely eliminates your weekend planning stress?",
        options: [
          "$1 - $3 / month",
          "$4 - $7 / month",
          "$8 - $15 / month",
          "I would only use a free version"
        ]
      }
    ]
  },
  3: {
    title: "Time-Saving Activities Survey",
    description: "Tell us how much time you spend researching activities for your kids.",
    questions: [
      {
        id: 'q1',
        type: 'choice',
        text: "Roughly how many hours a week do you currently spend scrolling Pinterest or Google searching for screen-free activities?",
        options: [
          "0 - 1 hours",
          "1 - 3 hours",
          "3 - 5 hours",
          "5+ hours"
        ]
      },
      {
        id: 'q2',
        type: 'choice',
        text: "If an app could cut that time down to just 5 minutes, what specific types of activities would you want it to recommend?",
        options: [
          "Quick 10-minute sensory crafts",
          "Outdoor & Nature activities",
          "Educational & STEM activities",
          "Low-mess / No-prep activities"
        ]
      },
      {
        id: 'q3',
        type: 'choice',
        text: "In terms of a monthly subscription, how much is saving those hours each month worth to you?",
        options: [
          "$1 - $3 / month",
          "$4 - $7 / month",
          "$8 - $15 / month",
          "I would only use a free version"
        ]
      }
    ]
  },
  4: {
    title: "Homeschooling & Education Survey",
    description: "Help us build better tools for educators and homeschooling parents.",
    questions: [
      {
        id: 'q1',
        type: 'open',
        text: "What is your biggest hurdle when trying to find educational, budget-friendly activities for your curriculum or daily routine?"
      },
      {
        id: 'q2',
        type: 'open',
        text: "If an app existed to organize your week, what specific tools (e.g., printable PDFs, budget filters, age ranges) would you find most useful?"
      },
      {
        id: 'q3',
        type: 'open',
        text: "What monthly price would you consider a 'no-brainer' for a tool that organizes and provides all your educational activities? (Please type an amount)"
      }
    ]
  },
  5: {
    title: "Quick Parent Survey",
    description: "3 quick questions to help us build a better app for you.",
    questions: [
      {
        id: 'q1',
        type: 'open',
        text: "What is the most frustrating part about trying to keep your kids entertained on a budget?"
      },
      {
        id: 'q2',
        type: 'open',
        text: "If you could design the perfect 'activity planner' app, what is the ONE feature it absolutely must have?"
      },
      {
        id: 'q3',
        type: 'open',
        text: "How much would you realistically pay per month for an app like that? (Please specify)"
      }
    ]
  }
};

const SurveyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const surveyData = surveys[id];

  // Validate survey exists
  useEffect(() => {
    if (!surveyData) {
      navigate('/');
    }
  }, [id, surveyData, navigate]);

  if (!surveyData) return null;

  const handleChoice = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleTextChange = (questionId, text) => {
    setAnswers(prev => ({ ...prev, [questionId]: text }));
  };

  const isFormValid = surveyData.questions.every(q => {
    const answer = answers[q.id];
    return answer && answer.trim() !== '';
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'survey_responses'), {
        surveyId: id,
        surveyTitle: surveyData.title,
        answers: answers,
        submittedAt: new Date().toISOString()
      });
      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting survey:", error);
      alert("Something went wrong. Please try again later.");
    }
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top right, #3A2E5D, #0F0F14)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'rgba(26, 26, 46, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', padding: '40px', maxWidth: '500px', width: '100%', textAlign: 'center', backdropFilter: 'blur(12px)' }}>
          <CheckCircle2 size={64} color="#34D399" style={{ margin: '0 auto 24px auto' }} />
          <h1 style={{ color: '#F1F0FF', fontSize: '28px', marginBottom: '16px', fontFamily: 'Outfit' }}>Thank you!</h1>
          <p style={{ color: 'var(--text-soft)', fontSize: '16px', lineHeight: '1.5', marginBottom: '32px' }}>Your feedback is incredibly valuable to us. We are using this data to build the ultimate activity planner for parents like you.</p>
          <button onClick={() => navigate('/')} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Outfit' }}>
            Check out the App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top right, #3A2E5D, #0F0F14)', padding: '40px 20px', fontFamily: 'Outfit' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', margin: '0 0 12px 0', background: 'linear-gradient(135deg, #A78BFA, #60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Kids Activities
          </h1>
          <div style={{ background: 'rgba(26, 26, 46, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '24px', marginTop: '24px' }}>
            <h2 style={{ color: '#F1F0FF', fontSize: '24px', margin: '0 0 8px 0' }}>{surveyData.title}</h2>
            <p style={{ color: 'var(--text-soft)', margin: 0 }}>{surveyData.description}</p>
          </div>
        </div>

        {/* Survey Form */}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '32px' }}>
          {surveyData.questions.map((q, index) => (
            <div key={q.id} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '20px', padding: '32px' }}>
              <h3 style={{ color: '#F1F0FF', fontSize: '18px', margin: '0 0 20px 0', lineHeight: '1.4' }}>
                <span style={{ color: 'var(--primary)', marginRight: '8px' }}>{index + 1}.</span> 
                {q.text}
              </h3>
              
              {q.type === 'choice' ? (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {q.options.map(option => (
                    <div 
                      key={option} 
                      onClick={() => handleChoice(q.id, option)}
                      style={{ 
                        padding: '16px', 
                        borderRadius: '12px', 
                        border: answers[q.id] === option ? '2px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.1)', 
                        background: answers[q.id] === option ? 'rgba(167, 139, 250, 0.1)' : 'rgba(0, 0, 0, 0.2)',
                        color: answers[q.id] === option ? '#fff' : 'var(--text-soft)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '15px'
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              ) : (
                <textarea 
                  value={answers[q.id] || ''}
                  onChange={(e) => handleTextChange(q.id, e.target.value)}
                  placeholder="Type your answer here..."
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(0, 0, 0, 0.2)',
                    color: '#F1F0FF',
                    fontFamily: 'Outfit',
                    fontSize: '15px',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              )}
            </div>
          ))}

          <button 
            type="submit" 
            disabled={!isFormValid || isSubmitting}
            style={{ 
              width: '100%', 
              padding: '18px', 
              borderRadius: '16px', 
              background: 'var(--primary)', 
              color: '#fff', 
              border: 'none', 
              cursor: (!isFormValid || isSubmitting) ? 'not-allowed' : 'pointer', 
              fontFamily: 'Outfit', 
              fontWeight: 'bold', 
              fontSize: '18px',
              opacity: (!isFormValid || isSubmitting) ? 0.5 : 1,
              marginTop: '16px',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answers'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default SurveyPage;
