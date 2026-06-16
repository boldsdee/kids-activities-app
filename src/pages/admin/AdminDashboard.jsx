import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Settings, Users, Activity, ChevronRight, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { activities } from '../../data/activities';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [surveyResponses, setSurveyResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = [];
        querySnapshot.forEach((doc) => {
          usersList.push({ id: doc.id, ...doc.data() });
        });
        setUsers(usersList);

        const surveySnapshot = await getDocs(collection(db, 'survey_responses'));
        const surveyList = [];
        surveySnapshot.forEach((doc) => {
          surveyList.push({ id: doc.id, ...doc.data() });
        });
        setSurveyResponses(surveyList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const proUsers = users.filter(u => u.isPro).length;
  const freeUsers = totalUsers - proUsers;
  const adminUsers = users.filter(u => u.isAdmin).length;

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F14', color: '#fff', fontFamily: 'Outfit', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <h1 style={{ fontSize: '32px', margin: '0 0 8px 0', background: 'linear-gradient(135deg, #A78BFA, #60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Admin Portal</h1>
            <p style={{ color: 'var(--text-soft)', margin: 0 }}>Welcome back, {currentUser?.displayName || 'Admin'}!</p>
          </div>
          <button onClick={() => window.location.href = '/app'} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontFamily: 'Outfit' }}>
            Back to App
          </button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '40px' }}>
          
          {/* Sidebar */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              onClick={() => setActiveTab('users')}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', background: activeTab === 'users' ? 'var(--primary)' : 'transparent', color: activeTab === 'users' ? '#fff' : 'var(--text-soft)', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'Outfit', fontSize: '16px', fontWeight: 'bold' }}
            >
              <Users size={20} /> Users Overview
            </button>
            <button 
              onClick={() => setActiveTab('activities')}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', background: activeTab === 'activities' ? 'var(--primary)' : 'transparent', color: activeTab === 'activities' ? '#fff' : 'var(--text-soft)', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'Outfit', fontSize: '16px', fontWeight: 'bold' }}
            >
              <Activity size={20} /> Activity Manager
            </button>
            <button 
              onClick={() => setActiveTab('surveys')}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', background: activeTab === 'surveys' ? 'var(--primary)' : 'transparent', color: activeTab === 'surveys' ? '#fff' : 'var(--text-soft)', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'Outfit', fontSize: '16px', fontWeight: 'bold' }}
            >
              <MessageSquare size={20} /> Survey Results
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', background: activeTab === 'settings' ? 'var(--primary)' : 'transparent', color: activeTab === 'settings' ? '#fff' : 'var(--text-soft)', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'Outfit', fontSize: '16px', fontWeight: 'bold' }}
            >
              <Settings size={20} /> System Settings
            </button>
          </nav>

          {/* Main Content */}
          <main>
            {activeTab === 'users' && (
              <div>
                <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>User Statistics</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                  <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--text-soft)', marginBottom: '8px' }}>Total Users</div>
                    <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{totalUsers}</div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
                    <div style={{ color: '#A78BFA', marginBottom: '8px' }}>Premium Users</div>
                    <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{proUsers}</div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--text-soft)', marginBottom: '8px' }}>Free Users</div>
                    <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{freeUsers}</div>
                  </div>
                </div>

                <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>All Users</h3>
                <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '16px', color: 'var(--text-soft)', fontWeight: 'normal' }}>Email</th>
                        <th style={{ padding: '16px', color: 'var(--text-soft)', fontWeight: 'normal' }}>Name</th>
                        <th style={{ padding: '16px', color: 'var(--text-soft)', fontWeight: 'normal' }}>Status</th>
                        <th style={{ padding: '16px', color: 'var(--text-soft)', fontWeight: 'normal' }}>Admin</th>
                        <th style={{ padding: '16px', color: 'var(--text-soft)', fontWeight: 'normal' }}>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '16px' }}>{u.email}</td>
                          <td style={{ padding: '16px' }}>{u.displayName || 'N/A'}</td>
                          <td style={{ padding: '16px' }}>
                            {u.isPro ? <span style={{ color: '#A78BFA', background: 'rgba(167, 139, 250, 0.1)', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>PRO</span> : <span style={{ color: 'var(--text-soft)' }}>Free</span>}
                          </td>
                          <td style={{ padding: '16px' }}>
                            {u.isAdmin ? <CheckCircle size={16} color="#34D399" /> : <XCircle size={16} color="var(--text-soft)" />}
                          </td>
                          <td style={{ padding: '16px', color: 'var(--text-soft)' }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {loading && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-soft)' }}>Loading users...</div>}
                </div>
              </div>
            )}

            {activeTab === 'activities' && (
              <div>
                <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Activity Manager</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                  <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--text-soft)', marginBottom: '8px', fontSize: '14px' }}>Total Master Activities</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{activities.length}</div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--text-soft)', marginBottom: '8px', fontSize: '14px' }}>Free Tier Available</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>30</div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
                    <div style={{ color: '#A78BFA', marginBottom: '8px', fontSize: '14px' }}>Premium Locked</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{activities.length - 30}</div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '16px', color: 'var(--text-soft)', fontWeight: 'normal', width: '50px' }}>#</th>
                        <th style={{ padding: '16px', color: 'var(--text-soft)', fontWeight: 'normal' }}>Activity Title</th>
                        <th style={{ padding: '16px', color: 'var(--text-soft)', fontWeight: 'normal' }}>Category</th>
                        <th style={{ padding: '16px', color: 'var(--text-soft)', fontWeight: 'normal' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activities.slice(0, 100).map((a, index) => (
                        <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '16px', color: 'var(--text-soft)' }}>{index + 1}</td>
                          <td style={{ padding: '16px', fontWeight: 'bold' }}>{a.title}</td>
                          <td style={{ padding: '16px', color: 'var(--text-soft)' }}>{a.category}</td>
                          <td style={{ padding: '16px' }}>
                            {index < 30 ? (
                              <span style={{ color: '#34D399', background: 'rgba(52, 211, 153, 0.1)', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>Free Tier</span>
                            ) : (
                              <span style={{ color: '#A78BFA', background: 'rgba(167, 139, 250, 0.1)', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>Premium</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {activities.length > 100 && (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-soft)', borderTop: '1px solid var(--border)' }}>
                      Showing first 100 activities...
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'surveys' && (
              <div>
                <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Survey Responses</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                  <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--text-soft)', marginBottom: '8px' }}>Total Responses</div>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#34D399' }}>{surveyResponses.length}</div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '16px', color: 'var(--text-soft)', fontWeight: 'normal', width: '20%' }}>Date</th>
                        <th style={{ padding: '16px', color: 'var(--text-soft)', fontWeight: 'normal', width: '40%' }}>Question / Topic</th>
                        <th style={{ padding: '16px', color: 'var(--text-soft)', fontWeight: 'normal', width: '40%' }}>Answer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {surveyResponses.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0)).map(response => (
                        <tr key={response.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '16px', color: 'var(--text-soft)', verticalAlign: 'top' }}>
                            {response.submittedAt ? new Date(response.submittedAt).toLocaleDateString() : 'Unknown'}
                            <br/>
                            <span style={{ fontSize: '12px', opacity: 0.7 }}>
                              {response.submittedAt ? new Date(response.submittedAt).toLocaleTimeString() : ''}
                            </span>
                          </td>
                          <td style={{ padding: '16px', fontWeight: 'bold', verticalAlign: 'top', lineHeight: 1.5 }}>
                            {response.questionText || response.surveyTitle || 'Unknown Question'}
                          </td>
                          <td style={{ padding: '16px', verticalAlign: 'top', lineHeight: 1.5 }}>
                            {typeof response.answer === 'string' 
                              ? response.answer 
                              : JSON.stringify(response.answers || response.answer)}
                          </td>
                        </tr>
                      ))}
                      {surveyResponses.length === 0 && !loading && (
                        <tr>
                          <td colSpan="3" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-soft)' }}>
                            No survey responses recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {loading && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-soft)' }}>Loading responses...</div>}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>System Settings</h2>
                <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <Settings size={48} color="var(--text-soft)" style={{ marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Global Settings</h3>
                  <p style={{ color: 'var(--text-soft)', maxWidth: '400px', margin: '0 auto' }}>
                    Global application settings will appear here.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
