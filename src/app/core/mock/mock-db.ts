import {
  Tenant, Incident, Job, QuotaSummary, UsageSummary, FeatureFlag, AuditEntry, DashboardSummary, EditorTask,
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

  editorTasks: [
    {
      id: 'et1', tenant: 'Sri Lakshmi Industries', title: 'Shop-floor tolerance check — Instagram Reel', type: 'reel',
      scheduledDate: '2026-09-06',
      aiPrompt: 'Vertical 9:16, 20-25s. Open on a wide shot of the shop floor at golden hour, CNC machines idle for the day. Cut to close-ups of precision-tolerance gauges and a technician\'s satisfied nod. Overlay text: "Precision you can measure." End on the brand logo sting. Music: minimal, confident, building slightly. Avoid showing any unfinished/WIP components in frame.',
      assets: [{ name: 'shopfloor-wide.jpg', url: 'https://placehold.co/64x64/1a1a1a/e0a030?text=SL' }],
      status: 'published', assignedEditor: 'Ravi Kumar', notes: 'Used the 6pm golden-hour take, client approved on first pass.',
      completedAt: '2026-09-02T14:20:00.000Z',
    },
    {
      id: 'et2', tenant: 'Nandi Foods', title: 'Nandi Foods — Diwali Reel', type: 'reel',
      scheduledDate: '2026-09-10',
      aiPrompt: 'Vertical 9:16, 20-25s. Open on packets of Nandi Foods snacks arranged in a rangoli pattern. Cut to diyas being lit near the packaging line. Overlay text: "Precision meets tradition — Happy Diwali from Nandi Foods." End on brand logo sting. Music: warm, traditional instrumental building to an uplifting close.',
      assets: [
        { name: 'diwali-rangoli-ref.jpg', url: 'https://placehold.co/64x64/1a1a1a/9b7bd4?text=NF' },
        { name: 'brand-guide.png', url: 'https://placehold.co/64x64/1a1a1a/5a9bd8?text=BG' },
      ],
      status: 'in_progress', assignedEditor: 'Asha Shetty', notes: 'Color grading pass in progress, waiting on final VO.',
      completedAt: null,
    },
    {
      id: 'et3', tenant: 'Malnad Estates', title: 'Site walkthrough — YouTube Short', type: 'youtube_short',
      scheduledDate: '2026-09-05',
      aiPrompt: 'Vertical 9:16, up to 60s. Drone-style walkthrough of the plotted estate, ending on the sales office. Captions burned in with plot numbers and price ranges. CTA card at the end: "Book a site visit — link in bio." Tone: aspirational, unhurried.',
      assets: [],
      status: 'pending', assignedEditor: 'Ravi Kumar', notes: '',
      completedAt: null,
    },
    {
      id: 'et4', tenant: 'Kaveri Textiles', title: 'New loom line demo — Video', type: 'video',
      scheduledDate: '2026-09-12',
      aiPrompt: 'Horizontal 16:9, 45-60s. Show the new automated loom line in motion from three angles, cut on the beat of the machine rhythm. Include one interview clip (provided separately) of the floor supervisor. Lower-third with tenant name and loom model. End card with contact details.',
      assets: [{ name: 'loom-line-bshots.mp4', url: 'https://placehold.co/64x64/1a1a1a/e5644e?text=KT' }],
      status: 'pending', assignedEditor: 'Asha Shetty', notes: '',
      completedAt: null,
    },
    {
      id: 'et5', tenant: 'Coorg Coffee Co', title: 'Harvest season — YouTube Long', type: 'youtube_long',
      scheduledDate: '2026-09-03',
      aiPrompt: 'Horizontal 16:9, 3-4 min mini-documentary. Follow a coffee picker through the harvest morning — picking, sorting, drying yard. Voiceover (script attached) over ambient estate sound. Grade warm and earthy. End with the Coorg Coffee Co. logo and tasting-notes card.',
      assets: [
        { name: 'harvest-b-roll-1.jpg', url: 'https://placehold.co/64x64/1a1a1a/3fb27f?text=CC' },
        { name: 'harvest-b-roll-2.jpg', url: 'https://placehold.co/64x64/1a1a1a/3fb27f?text=CC' },
      ],
      status: 'done', assignedEditor: 'Ravi Kumar', notes: 'Rough cut approved, just needs final audio mix before publish.',
      completedAt: new Date().toISOString(),
    },
    {
      id: 'et6', tenant: 'Vidya Coaching', title: 'Batch results celebration — Reel', type: 'reel',
      scheduledDate: '2026-09-08',
      aiPrompt: 'Vertical 9:16, 15-20s. Fast-cut celebration montage — students opening result cards, confetti, faculty applauding. Overlay text with the batch\'s top rank/score callouts (numbers to be supplied). Upbeat, high-energy music. End on admissions-open CTA card.',
      assets: [],
      status: 'in_progress', assignedEditor: 'Asha Shetty', notes: 'Have the raw footage, waiting on final score list from the tenant to overlay.',
      completedAt: null,
    },
    {
      id: 'et7', tenant: 'Sagar Motors', title: 'Festive offer — Video', type: 'video',
      scheduledDate: '2026-09-14',
      aiPrompt: 'Horizontal 16:9, 30s. Showroom walkaround of the featured model at night with dealership lighting. Bold on-screen offer callout (finance rate, exchange bonus). End card with showroom address and phone number. Tone: premium, confident.',
      assets: [{ name: 'showroom-night-ref.jpg', url: 'https://placehold.co/64x64/1a1a1a/5a9bd8?text=SM' }],
      status: 'pending', assignedEditor: 'Ravi Kumar', notes: '',
      completedAt: null,
    },
    {
      id: 'et8', tenant: 'Bhoomi Organics', title: 'Farm to table story — YouTube Short', type: 'youtube_short',
      scheduledDate: '2026-08-30',
      aiPrompt: 'Vertical 9:16, up to 60s. Quick story arc: farm harvest → packing → retail shelf → customer. Captions burned in, no VO needed. Close on the Bhoomi Organics logo and "100% traceable" tagline.',
      assets: [],
      status: 'published', assignedEditor: 'Asha Shetty', notes: 'Published to Shorts, performing well — 40k views in first two days.',
      completedAt: '2026-08-31T11:05:00.000Z',
    },
  ] as EditorTask[],
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
