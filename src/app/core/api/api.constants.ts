/**
 * Single source of truth for backend endpoints. Feature services import
 * from here instead of building URL strings inline, so the API surface
 * can move (or be renamed by the backend team) in one place.
 */
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/loginUser',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  dashboard: {
    root: '/auth/digital-users',
  },
  tenants: {
    root: '/auth/digital-users',
    byId: (id: string) => `/admin/tenants/${id}`,
    suspend: (id: string) => `/admin/tenants/${id}/suspend`,
    activate: (id: string) => `/admin/tenants/${id}/activate`,
    impersonationRequest: (id: string) => `/admin/tenants/${id}/impersonation-request`,
  },
  incidents: {
    root: '/admin/incidents',
    byId: (id: string) => `/admin/incidents/${id}`,
    dismiss: (id: string) => `/admin/incidents/${id}/dismiss`,
  },
  jobs: {
    root: '/admin/jobs',
    retry: (id: string) => `/admin/jobs/${id}/retry`,
    retryFailed: '/admin/jobs/retry-failed',
  },
  quota: {
    root: '/admin/quota',
    getAnthropicUsage: '/create-content/getAnthropicUsage',
    getAllUsersAiTokenUsage: '/create-content/getAllUsersAiTokenUsage',
  },
  usage: {
    root: '/admin/usage',
    export: '/admin/usage/export',
  },
  featureFlags: {
    root: '/admin/feature-flags',
    byId: (id: string) => `/admin/feature-flags/${id}`,
  },
  audit: {
    root: '/admin/audit',
    export: '/admin/audit/export',
  },
  platform: {
    halt: '/admin/platform/halt',
  },
  // ==============================
  // EDITOR
  // ==============================
  editor: {
    getAllContent: '/create-content/getEditorContent',

    updateContentStatus: (contentId: string) =>
      `/create-content/updateContentStatus/${contentId}`,

    getMyEditedContent: (editorId: string) =>
      `/create-content/getMyEditedContent/${editorId}`,
  },
} as const;
