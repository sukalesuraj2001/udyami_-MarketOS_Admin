import {
  Tenant, Incident, Job, QuotaSummary, UsageSummary, FeatureFlag, AuditEntry, DashboardSummary,
} from '../models/domain.model';
import { AppRole } from '../auth/models/user.model';

/**
 * In-memory data seeded from the original prototype. This stands in for
 * the NestJS API during development — see MockApiInterceptor. Mutating
 * functions below simulate what a real backend would persist.
 */
export const mockDb = {
  tenants: [
    { id: 't1', name: 'Sri Lakshmi Industries', segment: 'Precision engineering', plan: 'Growth', healthScore: 92, aiCost: '₹18,400', margin: '71%', approvalSla: '4h', status: 'active', healthTier: 'ok' },
    { id: 't2', name: 'Nandi Foods', segment: 'FMCG · Mysuru', plan: 'Scale', healthScore: 61, aiCost: '₹34,900', margin: '38%', approvalSla: '26h', status: 'active', healthTier: 'risk' },
    { id: 't3', name: 'Malnad Estates', segment: 'Real estate', plan: 'Growth', healthScore: 88, aiCost: '₹14,200', margin: '74%', approvalSla: '6h', status: 'active', healthTier: 'ok' },
    { id: 't4', name: 'Vidya Coaching', segment: 'Education · Hubballi', plan: 'Starter', healthScore: 79, aiCost: '₹8,900', margin: '68%', approvalSla: '11h', status: 'active', healthTier: 'ok' },
    { id: 't5', name: 'Kaveri Textiles', segment: 'Manufacturing', plan: 'Growth', healthScore: 44, aiCost: '₹21,100', margin: '52%', approvalSla: '48h', status: 'active', healthTier: 'risk' },
    { id: 't6', name: 'Bhoomi Organics', segment: 'Agri retail', plan: 'Starter', healthScore: null, aiCost: '₹0', margin: '—', approvalSla: '—', status: 'onboarding', healthTier: 'onboarding' },
    { id: 't7', name: 'Sagar Motors', segment: 'Auto dealer', plan: 'Growth', healthScore: null, aiCost: '₹0', margin: '—', approvalSla: '—', status: 'onboarding', healthTier: 'onboarding' },
    { id: 't8', name: 'Coorg Coffee Co', segment: 'D2C', plan: 'Scale', healthScore: 85, aiCost: '₹28,600', margin: '66%', approvalSla: '3h', status: 'active', healthTier: 'ok' },
  ] as Tenant[],

  incidents: [
    { id: 'i1', severity: 'action_needed', title: 'Nandi Foods — AI credit ceiling at 94%', description: 'Generation blocks Saturday unless topped up. Their September calendar has 22 video items queued.', tenantName: 'Nandi Foods', actionLabel: 'Contact tenant', createdAt: new Date().toISOString() },
    { id: 'i2', severity: 'watch', title: 'Kaveri Textiles — approval SLA breached', description: '48h median approval turnaround, up from 9h. 14 items pending, campaigns idle. Health score fell 44.', tenantName: 'Kaveri Textiles', actionLabel: 'Flag for CSM', createdAt: new Date().toISOString() },
    { id: 'i3', severity: 'informational', title: 'Google Ads Standard Access — day 6 pending', description: 'RMF audit submitted 21 Aug. Explorer tier limits apply meanwhile: 2,880 ops/day across all tenants.', actionLabel: 'Check status', createdAt: new Date().toISOString() },
  ] as Incident[],

  jobs: [
    { id: 'job_8841f2', tenantName: 'Nandi Foods', type: 'publish · instagram_reel', attempts: 3, error: 'Media container expired before publish', status: 'failed' },
    { id: 'job_8840ac', tenantName: 'Kaveri Textiles', type: 'render · ffmpeg_assembly', attempts: 2, error: 'Worker OOM on 4K source', status: 'failed' },
    { id: 'job_883fe1', tenantName: 'Sri Lakshmi Industries', type: 'capi · lead_stage_event', attempts: 4, error: 'Meta 613 — rate limit', status: 'failed' },
    { id: 'job_8842b0', tenantName: 'Coorg Coffee Co', type: 'generate · video_draft', attempts: 1, error: '—', status: 'running' },
    { id: 'job_8842b1', tenantName: 'Malnad Estates', type: 'publish · facebook_image', attempts: 1, error: '—', status: 'running' },
    { id: 'job_8842c4', tenantName: 'Vidya Coaching', type: 'score · lead_batch', attempts: 1, error: '—', status: 'queued' },
  ] as Job[],

  quota: {
    metaAppQuotaPct: 71,
    googleAdsOpsUsed: 1880,
    googleAdsOpsLimit: 2880,
    throttleEvents24h: 2,
    shareOfQuota: [
      { tenantName: 'Sri Lakshmi Industries', percentage: 38 },
      { tenantName: 'Nandi Foods', percentage: 22 },
      { tenantName: 'Coorg Coffee Co', percentage: 14 },
      { tenantName: 'Malnad Estates', percentage: 9 },
      { tenantName: 'Kaveri Textiles', percentage: 6 },
      { tenantName: 'Others (4)', percentage: 11 },
    ],
  } as QuotaSummary,

  usage: {
    revenueMtdLabel: '₹5.4L',
    variableCostLabel: '₹1.42L',
    infrastructureLabel: '₹58.5k',
    grossMarginPct: 64,
    grossMarginLabel: '₹3.46L',
    costBreakdown: [
      { label: 'Video generation', percentage: 68, amountLabel: '₹96,600' },
      { label: 'Claude — all tasks', percentage: 17, amountLabel: '₹24,100' },
      { label: 'Image generation', percentage: 6, amountLabel: '₹8,500' },
      { label: 'Rendering compute', percentage: 5, amountLabel: '₹7,100' },
      { label: 'Voice / TTS', percentage: 4, amountLabel: '₹5,700' },
    ],
    creditBalances: [
      { tenantName: 'Nandi Foods', percentageUsed: 94, remainingLabel: '₹1,900 left' },
      { tenantName: 'Kaveri Textiles', percentageUsed: 77, remainingLabel: '₹6,200 left' },
      { tenantName: 'Sri Lakshmi Industries', percentageUsed: 41, remainingLabel: '₹12,400 left' },
      { tenantName: 'Coorg Coffee Co', percentageUsed: 36, remainingLabel: '₹19,800 left' },
      { tenantName: 'Malnad Estates', percentageUsed: 22, remainingLabel: '₹23,100 left' },
    ],
  } as UsageSummary,

  marginByTenant: [
    { tenantName: 'Malnad Estates', marginPct: 74 },
    { tenantName: 'Sri Lakshmi Industries', marginPct: 71 },
    { tenantName: 'Vidya Coaching', marginPct: 68 },
    { tenantName: 'Coorg Coffee Co', marginPct: 66 },
    { tenantName: 'Kaveri Textiles', marginPct: 52 },
    { tenantName: 'Nandi Foods', marginPct: 38 },
  ],

  featureFlagsByTenant: {
    'Sri Lakshmi Industries': [
      { id: 'f1', name: 'Content generation', enabled: true, locked: false },
      { id: 'f2', name: 'Publishing — Meta', enabled: true, locked: false },
      { id: 'f3', name: 'Publishing — YouTube', enabled: true, locked: false },
      { id: 'f4', name: 'Paid media — Meta', enabled: true, locked: false },
      { id: 'f5', name: 'Paid media — Google', enabled: true, locked: false },
      { id: 'f6', name: 'Lead scoring', enabled: true, locked: false },
      { id: 'f7', name: 'AI voice calling', enabled: false, locked: true, lockReason: 'Kannada dialect test not passed, DLT registration missing' },
      { id: 'f8', name: 'Agency sub-tenants', enabled: false, locked: false },
    ],
    'Nandi Foods': [
      { id: 'f1', name: 'Content generation', enabled: true, locked: false },
      { id: 'f2', name: 'Publishing — Meta', enabled: true, locked: false },
      { id: 'f3', name: 'Publishing — YouTube', enabled: false, locked: false },
      { id: 'f4', name: 'Paid media — Meta', enabled: true, locked: false },
      { id: 'f5', name: 'Paid media — Google', enabled: false, locked: false },
      { id: 'f6', name: 'Lead scoring', enabled: true, locked: false },
      { id: 'f7', name: 'AI voice calling', enabled: false, locked: true, lockReason: 'Kannada dialect test not passed, DLT registration missing' },
      { id: 'f8', name: 'Agency sub-tenants', enabled: false, locked: false },
    ],
    'Malnad Estates': [
      { id: 'f1', name: 'Content generation', enabled: true, locked: false },
      { id: 'f2', name: 'Publishing — Meta', enabled: true, locked: false },
      { id: 'f3', name: 'Publishing — YouTube', enabled: true, locked: false },
      { id: 'f4', name: 'Paid media — Meta', enabled: true, locked: false },
      { id: 'f5', name: 'Paid media — Google', enabled: true, locked: false },
      { id: 'f6', name: 'Lead scoring', enabled: true, locked: false },
      { id: 'f7', name: 'AI voice calling', enabled: false, locked: true, lockReason: 'Kannada dialect test not passed, DLT registration missing' },
      { id: 'f8', name: 'Agency sub-tenants', enabled: true, locked: false },
    ],
  } as Record<string, FeatureFlag[]>,

  audit: [
    { id: 'a1', timestamp: '09:12:04', actor: 'suresh@srilakshmi.in', kind: 'spend', descriptionHtml: 'approved budget increase ₹1,200 → ₹1,800/day on campaign <b>Peenya — Qualified Lead</b>' },
    { id: 'a2', timestamp: '09:11:47', actor: 'system', kind: 'other', descriptionHtml: 'published instagram_reel <b>Shop-floor tolerance check</b> for Sri Lakshmi Industries' },
    { id: 'a3', timestamp: '08:52:19', actor: 'yogesh@jyovix.in', kind: 'access', descriptionHtml: 'started <b>consented impersonation</b> of Kaveri Textiles · 30 min limit · consent ref CN-4471' },
    { id: 'a4', timestamp: '08:31:02', actor: 'system', kind: 'other', descriptionHtml: 'sent qualified_lead event to Meta CAPI · lead <b>L-88213</b>' },
    { id: 'a5', timestamp: '07:44:55', actor: 'priya@nandifoods.com', kind: 'spend', descriptionHtml: 'rejected budget increase on <b>Mysuru — Retarget</b> · reason recorded' },
    { id: 'a6', timestamp: '06:00:00', actor: 'system', kind: 'other', descriptionHtml: 'generated nightly brief for 10 active tenants' },
    { id: 'a7', timestamp: 'Yest 22:14', actor: 'yogesh@jyovix.in', kind: 'access', descriptionHtml: 'enabled feature flag <b>Publishing — YouTube</b> for Malnad Estates' },
    { id: 'a8', timestamp: 'Yest 19:33', actor: 'system', kind: 'spend', descriptionHtml: '<b>circuit breaker</b> paused campaign <b>Boost — Creative 07</b> · CPL 2.7× trailing average' },
  ] as AuditEntry[],

  users: [
    { id: 'u1', name: 'Yogesh', email: 'yogesh@jyovix.in', password: 'admin123', initials: 'YO', role: AppRole.SuperAdmin },
    { id: 'u2', name: 'Asha', email: 'asha@jyovix.in', password: 'editor123', initials: 'AS', role: AppRole.Editor },
  ],
};

export function computeDashboardSummary(): DashboardSummary {
  const active = mockDb.tenants.filter((t) => t.status === 'active').length;
  const onboarding = mockDb.tenants.filter((t) => t.status === 'onboarding').length;
  return {
    tenantsTotal: mockDb.tenants.length,
    tenantsActive: active,
    tenantsOnboarding: onboarding,
    mrrLabel: '₹5.4L',
    mrrDeltaLabel: '▲ ₹75k this month',
    grossMarginPct: 64,
    aiSpendMtdLabel: '₹1.42L',
    aiSpendNote: '68% is video generation',
    publishSuccessPct: 99.1,
    publishSuccessNote: '1,204 of 1,215',
    attentionAlerts: [
      { level: 'danger', title: 'Nandi Foods is at 94% of its AI credit ceiling', detail: "Four days left in the cycle. Either they top up or generation blocks on Saturday." },
      { level: 'warn', title: 'Meta app quota at 71%, driven by one tenant', detail: "Sri Lakshmi accounts for 38% of today's calls. Fair-share throttle is holding, but headroom is thinning." },
      { level: 'info', title: 'Google Ads Standard Access review is pending', detail: 'Day 6. RMF audit submitted 21 Aug. Explorer limits still apply — 2,880 ops/day.' },
    ],
    marginByTenant: mockDb.marginByTenant,
  };
}
