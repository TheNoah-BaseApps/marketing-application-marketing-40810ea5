export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  MARKETER: 'marketer',
  ANALYST: 'analyst'
};

export const PERMISSIONS = {
  // SEO Campaigns
  SEO_CREATE: 'seo:create',
  SEO_READ: 'seo:read',
  SEO_UPDATE: 'seo:update',
  SEO_DELETE: 'seo:delete',
  
  // Websites
  WEBSITE_CREATE: 'website:create',
  WEBSITE_READ: 'website:read',
  WEBSITE_UPDATE: 'website:update',
  WEBSITE_DELETE: 'website:delete',
  
  // Coupons
  COUPON_CREATE: 'coupon:create',
  COUPON_READ: 'coupon:read',
  COUPON_UPDATE: 'coupon:update',
  COUPON_DELETE: 'coupon:delete',
  COUPON_REDEEM: 'coupon:redeem',
  
  // Analytics
  ANALYTICS_VIEW: 'analytics:view',
  
  // Audit Logs
  AUDIT_VIEW: 'audit:view',
  
  // Export/Import
  DATA_EXPORT: 'data:export',
  DATA_IMPORT: 'data:import'
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.SEO_CREATE,
    PERMISSIONS.SEO_READ,
    PERMISSIONS.SEO_UPDATE,
    PERMISSIONS.SEO_DELETE,
    PERMISSIONS.WEBSITE_CREATE,
    PERMISSIONS.WEBSITE_READ,
    PERMISSIONS.WEBSITE_UPDATE,
    PERMISSIONS.WEBSITE_DELETE,
    PERMISSIONS.COUPON_CREATE,
    PERMISSIONS.COUPON_READ,
    PERMISSIONS.COUPON_UPDATE,
    PERMISSIONS.COUPON_DELETE,
    PERMISSIONS.COUPON_REDEEM,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.DATA_EXPORT,
    PERMISSIONS.DATA_IMPORT
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.SEO_CREATE,
    PERMISSIONS.SEO_READ,
    PERMISSIONS.SEO_UPDATE,
    PERMISSIONS.SEO_DELETE,
    PERMISSIONS.WEBSITE_CREATE,
    PERMISSIONS.WEBSITE_READ,
    PERMISSIONS.WEBSITE_UPDATE,
    PERMISSIONS.WEBSITE_DELETE,
    PERMISSIONS.COUPON_CREATE,
    PERMISSIONS.COUPON_READ,
    PERMISSIONS.COUPON_UPDATE,
    PERMISSIONS.COUPON_DELETE,
    PERMISSIONS.COUPON_REDEEM,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.DATA_EXPORT,
    PERMISSIONS.DATA_IMPORT
  ],
  [ROLES.MARKETER]: [
    PERMISSIONS.SEO_CREATE,
    PERMISSIONS.SEO_READ,
    PERMISSIONS.SEO_UPDATE,
    PERMISSIONS.WEBSITE_CREATE,
    PERMISSIONS.WEBSITE_READ,
    PERMISSIONS.WEBSITE_UPDATE,
    PERMISSIONS.COUPON_CREATE,
    PERMISSIONS.COUPON_READ,
    PERMISSIONS.COUPON_UPDATE,
    PERMISSIONS.COUPON_REDEEM,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.DATA_EXPORT
  ],
  [ROLES.ANALYST]: [
    PERMISSIONS.SEO_READ,
    PERMISSIONS.WEBSITE_READ,
    PERMISSIONS.COUPON_READ,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.DATA_EXPORT
  ]
};

export function hasPermission(userRole, permission) {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
}

export function hasAnyPermission(userRole, permissions) {
  return permissions.some(permission => hasPermission(userRole, permission));
}

export function hasAllPermissions(userRole, permissions) {
  return permissions.every(permission => hasPermission(userRole, permission));
}

export function getRoleLabel(role) {
  const labels = {
    [ROLES.ADMIN]: 'Administrator',
    [ROLES.MANAGER]: 'Manager',
    [ROLES.MARKETER]: 'Marketer',
    [ROLES.ANALYST]: 'Analyst'
  };
  return labels[role] || role;
}

export function getRoleOptions() {
  return [
    { value: ROLES.ADMIN, label: 'Administrator' },
    { value: ROLES.MANAGER, label: 'Manager' },
    { value: ROLES.MARKETER, label: 'Marketer' },
    { value: ROLES.ANALYST, label: 'Analyst' }
  ];
}