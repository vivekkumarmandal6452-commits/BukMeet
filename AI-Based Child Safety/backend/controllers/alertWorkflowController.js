const Alert = require('../models/Alert');
const Child = require('../models/Child');
const Adoption = require('../models/Adoption');
const InvestigationReport = require('../models/InvestigationReport');
const { sendMail } = require('../utils/mailer');
const User = require('../models/User');

const buildInvestigationSummary = ({ child, adoption, riskAssessment }) => {
  const summary = [];

  if (riskAssessment) {
    summary.push(`Risk score: ${riskAssessment.aiAnalysis.overallRiskScore}`);
    summary.push(`Risk category: ${riskAssessment.aiAnalysis.riskCategory}`);
    summary.push(`Risk level: ${riskAssessment.aiAnalysis.riskLevel}`);
    if (riskAssessment.aiAnalysis.keyRiskIndicators?.length) {
      summary.push(`Key risk indicators: ${riskAssessment.aiAnalysis.keyRiskIndicators.join(', ')}`);
    }
    if (riskAssessment.aiAnalysis.protectiveFactors?.length) {
      summary.push(`Protective factors: ${riskAssessment.aiAnalysis.protectiveFactors.join(', ')}`);
    }
  }

  if (child?.healthAnalysis?.lastReport) {
    summary.push(`Health score: ${child.healthAnalysis.lastReport.healthScore}`);
    summary.push(`Health risk level: ${child.healthAnalysis.lastReport.healthRiskLevel}`);
  }

  if (child?.questionnaire?.lastReport) {
    summary.push(`Questionnaire emotional score: ${child.questionnaire.lastReport.emotionalAnalysisScore}`);
    summary.push(`Questionnaire risk level: ${child.questionnaire.lastReport.emotionalRiskLevel}`);
  }

  if (adoption) {
    summary.push(`Adoption status: ${adoption.status}`);
  }

  return summary.join('\n');
};

exports.handleHighRisk = async ({ riskAssessment, childId, adoptionId, triggeredBy }) => {
  const child = await Child.findById(childId);
  const adoption = adoptionId ? await Adoption.findById(adoptionId) : null;

  if (child) {
    child.currentStatus = 'high_risk';
    await child.save();
  }

  const alert = await Alert.create({
    title: `High Risk Alert: Child ${child?.firstName || ''} ${child?.lastName || ''}`,
    description: `Risk score ${riskAssessment.aiAnalysis.overallRiskScore} exceeded threshold. Child marked as high risk.`,
    severity: 'emergency',
    category: 'risk_assessment',
    relatedTo: {
      modelType: 'Child',
      modelId: childId
    },
    adoption: adoptionId,
    triggeredBy: triggeredBy || 'ai_analysis',
    status: 'active',
    priority: 5,
    assignedTo: [riskAssessment.assessedBy]
  });

  const report = await InvestigationReport.create({
    child: childId,
    adoption: adoptionId,
    riskAssessment: riskAssessment._id,
    generatedBy: riskAssessment.assessedBy,
    summary: buildInvestigationSummary({ child, adoption, riskAssessment }),
    findings: [
      'Risk score exceeded high-risk threshold',
      ...riskAssessment.aiAnalysis.keyRiskIndicators
    ],
    recommendations: riskAssessment.aiAnalysis.recommendations || [],
    notes: ['Auto-generated investigation report for high-risk case.']
  });

  const recipients = await User.find({ role: { $in: ['admin', 'social_worker'] }, isActive: true }).select('email');
  const emails = recipients.map((user) => user.email).filter(Boolean);

  if (emails.length) {
    const emailResult = await sendMail({
      to: emails.join(','),
      subject: `High Risk Alert for Child ${child?.firstName || ''} ${child?.lastName || ''}`,
      text: `A high risk alert has been generated for child ${child?.firstName || ''} ${child?.lastName || ''}.

Score: ${riskAssessment.aiAnalysis.overallRiskScore}
Category: ${riskAssessment.aiAnalysis.riskCategory}
Level: ${riskAssessment.aiAnalysis.riskLevel}

Please review the investigation report ${report._id} for details.
`,
      html: `<p>A high risk alert has been generated for child <strong>${child?.firstName || ''} ${child?.lastName || ''}</strong>.</p>
<p><strong>Score:</strong> ${riskAssessment.aiAnalysis.overallRiskScore}</p>
<p><strong>Category:</strong> ${riskAssessment.aiAnalysis.riskCategory}</p>
<p><strong>Level:</strong> ${riskAssessment.aiAnalysis.riskLevel}</p>
<p>Please review the investigation report <strong>${report._id}</strong> for details.</p>`
    });

    alert.notifications = alert.notifications || [];
    const timestamp = new Date();
    recipients.forEach((user) => {
      alert.notifications.push({
        sentTo: user._id,
        sentAt: timestamp,
        method: 'email',
        status: emailResult.success ? 'sent' : 'failed'
      });
    });
    await alert.save();
  }

  return { alert, report };
};
