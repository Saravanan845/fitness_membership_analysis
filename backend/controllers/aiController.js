const Member = require('../models/Member');
let GoogleGenerativeAI;
try {
  GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
} catch (e) {
  // Graceful fallback if module not loaded
}

// Built-in intelligent heuristic retention engine (fallback & zero-API-key mode)
const generateHeuristicInsight = (member, gymStats) => {
  const isHighRisk = member.riskLevel === 'High' || member.daysSinceLastVisit > 20;
  const churnProbability = isHighRisk
    ? Math.min(95, 60 + member.daysSinceLastVisit * 1.2)
    : member.riskLevel === 'Moderate'
    ? 45
    : 15;

  const strategies = [];
  const reEngagementMessages = [];

  if (member.daysSinceLastVisit > 20) {
    strategies.push({
      priority: 'CRITICAL',
      title: 'Immediate High-Touch Outreach',
      action: `Member ${member.name} has been away for ${member.daysSinceLastVisit} days. Schedule a personalized check-in call from the fitness director.`
    });
    reEngagementMessages.push({
      channel: 'SMS / WhatsApp',
      subject: 'We miss seeing you at FitTrack!',
      message: `Hi ${member.name.split(' ')[0]}, we noticed you haven't been in for a few weeks! Your fitness journey matters to us. We’ve loaded a complimentary 1-on-1 trainer consultation or smoothie into your account. Drop by this week—we'd love to see you!`
    });
  }

  if (member.classesAttended === 0) {
    strategies.push({
      priority: 'HIGH',
      title: 'Community & Group Class Onboarding',
      action: 'Members with 0 class attendance are 3.5x more prone to churn. Invite to beginner-friendly Spin or Yoga classes.'
    });
    reEngagementMessages.push({
      channel: 'Email',
      subject: 'Find your rhythm: Try a group class on us!',
      message: `Hey ${member.name.split(' ')[0]}, working out with a community keeps motivation high! Have you tried our introductory HIIT or Yoga classes? As a valued member, your first 3 group passes are on the house this month.`
    });
  }

  if (!member.renewed) {
    strategies.push({
      priority: 'URGENT',
      title: 'Renewal Incentive & Loyalty Discount',
      action: 'Member subscription has lapsed. Present a limited-time 15% discount for a 3-month or annual renewal.'
    });
    reEngagementMessages.push({
      channel: 'Email / Push',
      subject: 'Exclusive Loyalty Offer: Save 15% on your renewal',
      message: `Hi ${member.name.split(' ')[0]}, continue your momentum! Renew your membership today and unlock 15% off standard rates plus free guest passes for your workout buddies.`
    });
  }

  if (strategies.length === 0) {
    strategies.push({
      priority: 'MAINTENANCE',
      title: 'Positive Reinforcement & Milestone Celebration',
      action: `${member.name} is highly engaged with ${member.visitsLast30Days} visits this month. Acknowledge consistency with loyalty points.`
    });
    reEngagementMessages.push({
      channel: 'App Notification',
      subject: 'Crushing your fitness goals! 🔥',
      message: `Way to go, ${member.name.split(' ')[0]}! You logged ${member.visitsLast30Days} visits this month! Keep up the incredible work.`
    });
  }

  return {
    engine: 'FitTrack Local Retention Intelligence Engine',
    memberId: member.memberId,
    memberName: member.name,
    churnProbability: `${Math.round(churnProbability)}%`,
    riskLevel: member.riskLevel,
    engagementLevel: member.engagementLevel,
    retentionHealthScore: Math.round(100 - churnProbability),
    keyRiskFactors: [
      `${member.daysSinceLastVisit} days since last gym attendance`,
      `${member.visitsLast30Days} visits recorded in the past 30 days`,
      `${member.classesAttended} group fitness classes attended`,
      member.renewed ? 'Membership currently renewed' : 'Membership not renewed / lapsed'
    ],
    recommendedInterventions: strategies,
    readyToUseOutreachDrafts: reEngagementMessages
  };
};

// @desc    Generate AI retention insights for a specific member
// @route   POST /api/ai/member-insights
// @access  Private
const getMemberAiInsights = async (req, res) => {
  try {
    const { memberId, customPrompt } = req.body;

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: 'Member ID is required.'
      });
    }

    const member = await Member.findOne(
      memberId.match(/^[0-9a-fA-F]{24}$/) ? { _id: memberId } : { memberId: memberId.toUpperCase() }
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: `Member not found: ${memberId}`
      });
    }

    // Try Google Gemini API if API key configured and library is loaded
    if (process.env.GEMINI_API_KEY && GoogleGenerativeAI) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const promptText = `
You are an expert Fitness Center Member Retention and Engagement Analyst AI.
Analyze the following fitness club member's profile and generate actionable retention recommendations.

Member Details:
- Name: ${member.name}
- Member ID: ${member.memberId}
- Age: ${member.age}
- Monthly Spend: $${member.monthlySpend}
- Visits in Last 30 Days: ${member.visitsLast30Days}
- Group Classes Attended: ${member.classesAttended}
- Days Since Last Visit: ${member.daysSinceLastVisit}
- Renewed: ${member.renewed ? 'Yes' : 'No'}
- Current Risk Level: ${member.riskLevel}
- Current Engagement Level: ${member.engagementLevel}

${customPrompt ? `Specific Administrator Question: ${customPrompt}` : ''}

Please return structured JSON with the following keys:
{
  "churnProbability": "percentage string",
  "summaryAnalysis": "concise diagnosis of risk",
  "keyRiskFactors": ["list of primary factors driving attrition"],
  "recommendedInterventions": [
    { "priority": "CRITICAL/HIGH/MEDIUM", "title": "intervention title", "action": "actionable instruction" }
  ],
  "readyToUseOutreachDrafts": [
    { "channel": "SMS/Email", "subject": "subject line", "message": "friendly message draft" }
  ]
}
Return valid JSON only.
`;

        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: { responseMimeType: 'application/json' }
        });
        const result = await model.generateContent(promptText);
        const jsonText = result.response.text();
        const parsed = JSON.parse(jsonText);

        return res.status(200).json({
          success: true,
          engine: 'Google Gemini 1.5 Flash',
          data: {
            memberId: member.memberId,
            memberName: member.name,
            ...parsed
          }
        });
      } catch (geminiError) {
        console.warn('[Gemini AI Notice] Falling back to built-in retention engine:', geminiError.message);
      }
    }

    // Built-in intelligent heuristic engine
    const heuristicInsights = generateHeuristicInsight(member);
    return res.status(200).json({
      success: true,
      engine: 'FitTrack Local Retention Intelligence Engine',
      data: heuristicInsights
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI retention insights',
      error: error.message
    });
  }
};

// @desc    Generate club-wide strategic retention insights & automated campaign suggestions
// @route   GET /api/ai/club-strategy
// @access  Private
const getClubRetentionStrategy = async (req, res) => {
  try {
    const totalMembers = await Member.countDocuments();
    const highRiskCount = await Member.countDocuments({ riskLevel: 'High' });
    const unrenewedCount = await Member.countDocuments({ renewed: false });
    const lowAttendanceCount = await Member.countDocuments({ visitsLast30Days: { $lt: 5 } });

    const strategy = {
      executiveSummary: `Club retention analysis identified ${highRiskCount} critical at-risk members and ${unrenewedCount} unrenewed memberships out of ${totalMembers} total members.`,
      recommendedCampaigns: [
        {
          campaignName: '30-Day Comeback Challenge',
          targetCohort: `${highRiskCount} members inactive for >20 days`,
          objective: 'Re-activate lapsed members by offering bonus points for 8 visits within 30 days.',
          expectedRetentionLift: '+14% retention rate'
        },
        {
          campaignName: 'Class Passport Program',
          targetCohort: `${lowAttendanceCount} members with 0-1 class participations`,
          objective: 'Encourage cross-discipline exploration (Spin, Yoga, HIIT) to foster social bonding.',
          expectedRetentionLift: '+22% retention rate'
        },
        {
          campaignName: 'Early Bird Renewal Guarantee',
          targetCohort: 'Members expiring within the next 15 days',
          objective: 'Provide a 10% rate lock guarantee if renewed before the current cycle ends.',
          expectedRetentionLift: '+18% renewal rate'
        }
      ],
      retentionPlaybook: [
        'Automate SMS triggers on Day 7 and Day 14 of zero check-ins.',
        'Pair every new member with a fitness buddy or trainer consultation during Week 1.',
        'Conduct monthly satisfaction surveys for members logging below 4 visits.'
      ]
    };

    res.status(200).json({
      success: true,
      data: strategy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate club retention strategy',
      error: error.message
    });
  }
};

module.exports = {
  getMemberAiInsights,
  getClubRetentionStrategy
};
