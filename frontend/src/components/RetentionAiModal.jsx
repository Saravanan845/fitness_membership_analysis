import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertTriangle, Send, Copy, Check, TrendingUp, Users, Target } from 'lucide-react';
import { getMemberAiInsights, getClubRetentionStrategy } from '../services/aiService';

const RetentionAiModal = ({ isOpen, onClose, selectedMember, members = [] }) => {
  const [activeTab, setActiveTab] = useState('member'); // 'member' | 'club'
  const [memberId, setMemberId] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [memberInsight, setMemberInsight] = useState(null);
  const [clubStrategy, setClubStrategy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedMember) {
      setMemberId(selectedMember.memberId || selectedMember._id);
      setActiveTab('member');
    } else if (members.length > 0 && !memberId) {
      setMemberId(members[0].memberId);
    }
  }, [selectedMember, members, isOpen]);

  useEffect(() => {
    if (isOpen && activeTab === 'member' && memberId) {
      fetchMemberInsight();
    } else if (isOpen && activeTab === 'club' && !clubStrategy) {
      fetchClubStrategy();
    }
  }, [isOpen, activeTab, memberId]);

  if (!isOpen) return null;

  const fetchMemberInsight = async () => {
    if (!memberId) return;
    setLoading(true);
    setError('');
    try {
      const res = await getMemberAiInsights(memberId, customPrompt);
      setMemberInsight(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  const fetchClubStrategy = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getClubRetentionStrategy();
      setClubStrategy(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate club strategy');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '780px' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #1e293b',
            background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                padding: '0.5rem',
                borderRadius: '0.625rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sparkles size={20} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                FitTrack AI Retention Insights Assistant
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Algorithmic churn risk diagnosis, tailored engagement strategies & re-activation scripts
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', padding: '0 1.5rem', backgroundColor: '#0b1120' }}>
          <button
            onClick={() => setActiveTab('member')}
            style={{
              padding: '0.875rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'member' ? '2px solid #8b5cf6' : '2px solid transparent',
              color: activeTab === 'member' ? '#c084fc' : '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Users size={16} />
            <span>Member Churn Copilot</span>
          </button>

          <button
            onClick={() => setActiveTab('club')}
            style={{
              padding: '0.875rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'club' ? '2px solid #ec4899' : '2px solid transparent',
              color: activeTab === 'club' ? '#f472b6' : '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Target size={16} />
            <span>Club-Wide Retention Playbook</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', maxHeight: '72vh', overflowY: 'auto' }}>
          {error && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.5rem', color: '#f87171', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {activeTab === 'member' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Member Selector Bar */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Select Member to Analyze</label>
                  <select
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="input-field"
                  >
                    {members.map((m) => (
                      <option key={m._id} value={m.memberId}>
                        {m.memberId} - {m.name} ({m.riskLevel} Risk, {m.daysSinceLastVisit}d inactive)
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={fetchMemberInsight}
                  disabled={loading}
                  className="btn-ai"
                  style={{ marginTop: '1.25rem', whiteSpace: 'nowrap' }}
                >
                  <Sparkles size={16} />
                  <span>{loading ? 'Analyzing...' : 'Generate AI Insights'}</span>
                </button>
              </div>

              {loading ? (
                <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid #334155', borderTopColor: '#c084fc', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>Synthesizing Member Engagement Diagnostics...</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Evaluating visit frequency, classes attended, and retention probabilities</div>
                </div>
              ) : memberInsight ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Churn Risk Diagnostic Card */}
                  <div
                    style={{
                      background: 'rgba(30, 41, 59, 0.6)',
                      border: '1px solid #334155',
                      borderRadius: '0.75rem',
                      padding: '1.25rem',
                      display: 'grid',
                      gridTemplateColumns: '1fr 2fr',
                      gap: '1.5rem',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Churn Probability</div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: parseInt(memberInsight.churnProbability) > 50 ? '#f87171' : '#34d399', lineHeight: 1.1 }}>
                        {memberInsight.churnProbability}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                        Member: <strong>{memberInsight.memberName}</strong> ({memberInsight.memberId})
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>Primary Risk Drivers</div>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {memberInsight.keyRiskFactors?.map((factor, i) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#e2e8f0' }}>
                            <AlertTriangle size={14} color="#fbbf24" />
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recommended Interventions */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <TrendingUp size={16} color="#818cf8" />
                      <span>Recommended Retention Interventions</span>
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {memberInsight.recommendedInterventions?.map((item, i) => (
                        <div
                          key={i}
                          style={{
                            background: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '0.625rem',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span
                              style={{
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                background: item.priority === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                                color: item.priority === 'CRITICAL' ? '#f87171' : '#a5b4fc',
                                border: item.priority === 'CRITICAL' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(99, 102, 241, 0.4)'
                              }}
                            >
                              {item.priority}
                            </span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f1f5f9' }}>
                              {item.title}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
                            {item.action}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ready-to-use Outreach Drafts with 1-click copy */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Send size={16} color="#ec4899" />
                      <span>Personalized Re-Engagement Outreach Drafts</span>
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {memberInsight.readyToUseOutreachDrafts?.map((draft, i) => (
                        <div
                          key={i}
                          style={{
                            background: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: '0.625rem',
                            padding: '1rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.7rem', background: '#334155', color: '#f8fafc', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                                {draft.channel}
                              </span>
                              <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#cbd5e1' }}>
                                {draft.subject}
                              </span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(draft.message, i)}
                              className="btn-secondary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                            >
                              {copiedIndex === i ? (
                                <>
                                  <Check size={14} color="#34d399" />
                                  <span style={{ color: '#34d399' }}>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={14} />
                                  <span>Copy Draft</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, background: '#1e293b', padding: '0.75rem', borderRadius: '0.375rem', fontStyle: 'italic' }}>
                            "{draft.message}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            /* Club-Wide Retention Playbook Tab */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {loading ? (
                <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid #334155', borderTopColor: '#ec4899', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>Synthesizing Club-Wide Cohort Campaigns...</div>
                </div>
              ) : clubStrategy ? (
                <>
                  <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.625rem', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a855f7', textTransform: 'uppercase' }}>Executive AI Diagnostic</div>
                    <p style={{ fontSize: '0.875rem', color: '#f1f5f9', marginTop: '0.35rem', lineHeight: 1.5 }}>
                      {clubStrategy.executiveSummary}
                    </p>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>
                      Recommended Strategic Campaigns
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {clubStrategy.recommendedCampaigns?.map((camp, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: '0.625rem',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.35rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                              {camp.campaignName}
                            </span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                              {camp.expectedRetentionLift}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#c7d2fe' }}>
                            Target Cohort: {camp.targetCohort}
                          </div>
                          <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
                            {camp.objective}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
                      Operational Retention Playbook
                    </h4>
                    <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.825rem', color: '#cbd5e1' }}>
                      {clubStrategy.retentionPlaybook?.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RetentionAiModal;
