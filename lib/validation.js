export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  return password && password.length >= 8;
}

export function validateURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validatePositiveInteger(value) {
  const num = parseInt(value, 10);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
}

export function validateNonNegativeInteger(value) {
  const num = parseInt(value, 10);
  return !isNaN(num) && num >= 0 && Number.isInteger(num);
}

export function validateDecimal(value) {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
}

export function validatePercentage(value) {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0 && num <= 100;
}

export function validateRanking(value) {
  const num = parseInt(value, 10);
  return !isNaN(num) && num >= 1 && num <= 100 && Number.isInteger(num);
}

export function validateDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

export function validateDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
}

export function validateCouponCode(code) {
  const alphanumericRegex = /^[A-Z0-9]+$/;
  return code && code.length >= 4 && code.length <= 20 && alphanumericRegex.test(code);
}

export function validateMetaTitle(title) {
  return title && title.length <= 60;
}

export function validateMetaDescription(description) {
  return description && description.length <= 160;
}

export function validateSSLStatus(status) {
  const validStatuses = ['active', 'expired', 'invalid', 'none'];
  return validStatuses.includes(status);
}

export function validateCrawlStatus(status) {
  const validStatuses = ['success', 'failed', 'pending', 'blocked'];
  return validStatuses.includes(status);
}

export function validateRole(role) {
  const validRoles = ['admin', 'manager', 'marketer', 'analyst'];
  return validRoles.includes(role);
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
}

export function validateSEOCampaign(data) {
  const errors = {};

  if (!data.keyword_targeted || data.keyword_targeted.trim() === '') {
    errors.keyword_targeted = 'Keyword is required';
  }

  if (!validateNonNegativeInteger(data.search_volume)) {
    errors.search_volume = 'Search volume must be a non-negative integer';
  }

  if (!validateRanking(data.keyword_ranking)) {
    errors.keyword_ranking = 'Keyword ranking must be between 1 and 100';
  }

  if (data.page_url && !validateURL(data.page_url)) {
    errors.page_url = 'Invalid URL format';
  }

  if (!validateNonNegativeInteger(data.backlink_count)) {
    errors.backlink_count = 'Backlink count must be a non-negative integer';
  }

  if (!validatePercentage(data.domain_authority)) {
    errors.domain_authority = 'Domain authority must be between 0 and 100';
  }

  if (data.crawl_status && !validateCrawlStatus(data.crawl_status)) {
    errors.crawl_status = 'Invalid crawl status';
  }

  if (data.meta_title && !validateMetaTitle(data.meta_title)) {
    errors.meta_title = 'Meta title must be 60 characters or less';
  }

  if (data.meta_description && !validateMetaDescription(data.meta_description)) {
    errors.meta_description = 'Meta description must be 160 characters or less';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateWebsite(data) {
  const errors = {};

  if (!data.domain_name || data.domain_name.trim() === '') {
    errors.domain_name = 'Domain name is required';
  }

  if (!validatePositiveInteger(data.page_count)) {
    errors.page_count = 'Page count must be a positive integer';
  }

  if (data.ssl_status && !validateSSLStatus(data.ssl_status)) {
    errors.ssl_status = 'Invalid SSL status';
  }

  if (data.page_load_time && !validateDecimal(data.page_load_time)) {
    errors.page_load_time = 'Page load time must be a positive number';
  }

  if (data.uptime_percentage && !validatePercentage(data.uptime_percentage)) {
    errors.uptime_percentage = 'Uptime percentage must be between 0 and 100';
  }

  if (data.launch_date && data.last_updated_date) {
    if (!validateDateRange(data.launch_date, data.last_updated_date)) {
      errors.last_updated_date = 'Last updated date must be after launch date';
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateCoupon(data) {
  const errors = {};

  if (!data.coupon_code || !validateCouponCode(data.coupon_code)) {
    errors.coupon_code = 'Coupon code must be 4-20 alphanumeric characters';
  }

  if (!validateDecimal(data.discount_amount)) {
    errors.discount_amount = 'Discount amount must be a positive number';
  }

  if (data.usage_limit !== -1 && !validatePositiveInteger(data.usage_limit)) {
    errors.usage_limit = 'Usage limit must be a positive integer or -1 for unlimited';
  }

  if (data.issued_date && data.expiry_date) {
    if (!validateDateRange(data.issued_date, data.expiry_date)) {
      errors.expiry_date = 'Expiry date must be after issued date';
    }
  }

  if (data.redemption_count > data.usage_limit && data.usage_limit !== -1) {
    errors.redemption_count = 'Redemption count cannot exceed usage limit';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}