// Shared domain models. Kept in core/ (rather than duplicated per feature)
// because several features reference the same entities — e.g. the
// dashboard's "margin by tenant" panel and the Tenants table both need
// the Tenant shape.

export type TenantStatus = 'active' | 'onboarding' | 'suspended';
export type TenantHealthTier = 'ok' | 'risk' | 'onboarding';

export interface Tenant {
  id: string;
  name: string;
  segment: string;
  plan: 'Starter' | 'Growth' | 'Scale';
  healthScore: number | null;
  aiCost: string;
  margin: string;
  approvalSla: string;
  status: TenantStatus;
  healthTier: TenantHealthTier;
}

export type IncidentSeverity = 'action_needed' | 'watch' | 'informational';

export interface Incident {
  id: string;
  severity: IncidentSeverity;
  title: string;
  description: string;
  tenantName?: string;
  actionLabel: string;
  createdAt: string;
}

export type JobStatus = 'queued' | 'running' | 'failed' | 'completed';

export interface Job {
  id: string;
  tenantName: string;
  type: string;
  attempts: number;
  error: string;
  status: JobStatus;
}

export interface JobSummary {
  queued: number;
  running: number;
  failed24h: number;
  medianDurationSeconds: number;
}

export interface QuotaShare {
  tenantName: string;
  percentage: number;
}

export interface QuotaSummary {
  metaAppQuotaPct: number;
  googleAdsOpsUsed: number;
  googleAdsOpsLimit: number;
  throttleEvents24h: number;
  shareOfQuota: QuotaShare[];
}

export interface CostBreakdownItem {
  label: string;
  percentage: number;
  amountLabel: string;
}

export interface CreditBalance {
  tenantName: string;
  percentageUsed: number;
  remainingLabel: string;
}

export interface MarginEntry {
  tenantName: string;
  marginPct: number;
}

export interface UsageSummary {
  revenueMtdLabel: string;
  variableCostLabel: string;
  infrastructureLabel: string;
  grossMarginPct: number;
  grossMarginLabel: string;
  costBreakdown: CostBreakdownItem[];
  creditBalances: CreditBalance[];
}

export interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  locked: boolean;
  lockReason?: string;
}

export type AuditEventKind = 'spend' | 'access' | 'other';

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  kind: AuditEventKind;
  descriptionHtml: string;
}

export interface DashboardSummary {
  tenantsTotal: number;
  tenantsActive: number;
  tenantsOnboarding: number;
  mrrLabel: string;
  mrrDeltaLabel: string;
  grossMarginPct: number;
  aiSpendMtdLabel: string;
  aiSpendNote: string;
  publishSuccessPct: number;
  publishSuccessNote: string;
  attentionAlerts: Array<{ level: 'danger' | 'warn' | 'info'; title: string; detail: string }>;
  marginByTenant: MarginEntry[];
}


export interface BusinessProduct {
  [key: string]: any;
}

export interface BusinessDetails {
  businessName: string;
  ownerName: string;
  businessType: string;
  sector: string;
  gstNumber: string;
  registrationNumber: string;
  establishedYear: number;
  employees: number;
  annualTurnover: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  businessMobile: string;
  email: string;
  website: string;
  products: BusinessProduct[];
}

export interface DigitalUserProfile {
  profileId: string;
  userId: string;
  alternateMobile: string | null;
  gender: string | null;
  state: string | null;
  district: string | null;
  assembly: string | null;
  ward: string | null;
  pincode: string | null;
  homeAddress: string | null;
  officeAddress: string | null;
  hasBusiness: boolean;
  businessDetails: BusinessDetails | null;
  createdAt: string;
  updatedAt: string;
  profileImage: string | null;
  selectedBusinessVertical: string | null;
  familyInformation: string | null;
  spouse: string | null;
  children: string | null;
  pets: string | null;
  hobbies: string | null;
  activitiesOrInterests: string | null;
  cityOfResidence: string | null;
  yearsInCity: number | null;
}

export interface DigitalUser {
  userId: string;
  name: string;
  email: string;
  mobileNumber: string;
  businessLocation: string | null;
  officeLocation: string | null;
  latitude: string | null;
  longitude: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profile: DigitalUserProfile | null;
  isBasic: boolean;
  isPrime: boolean;
  isPatron: boolean | null;
  hasBusiness: boolean;
  memberId: string | null;
  cpId: string | null;
  isTrial: boolean;
  isDigital: boolean | null;
}

export interface DigitalUserSummary {
  count: number;
  users: DigitalUser[];
}