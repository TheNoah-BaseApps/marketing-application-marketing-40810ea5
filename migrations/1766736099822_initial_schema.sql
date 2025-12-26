CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  password text NOT NULL,
  role text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

CREATE TABLE IF NOT EXISTS seo_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  seo_campaign_id text NOT NULL UNIQUE,
  keyword_targeted text NOT NULL,
  search_volume integer NOT NULL,
  keyword_ranking integer NOT NULL,
  page_url text NOT NULL,
  backlink_count integer DEFAULT 0 NOT NULL,
  domain_authority integer NOT NULL,
  content_updated_date date,
  crawl_status text NOT NULL,
  meta_title text,
  meta_description text,
  technical_issues text,
  remarks text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_seo_campaigns_campaign_id ON seo_campaigns (seo_campaign_id);
CREATE INDEX IF NOT EXISTS idx_seo_campaigns_created_by ON seo_campaigns (created_by);
CREATE INDEX IF NOT EXISTS idx_seo_campaigns_crawl_status ON seo_campaigns (crawl_status);
CREATE INDEX IF NOT EXISTS idx_seo_campaigns_keyword_ranking ON seo_campaigns (keyword_ranking);

CREATE TABLE IF NOT EXISTS websites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  website_id text NOT NULL UNIQUE,
  domain_name text NOT NULL,
  page_count integer NOT NULL,
  cms_used text,
  launch_date date,
  last_updated_date date,
  ssl_status text NOT NULL,
  page_load_time decimal(10,2) NOT NULL,
  uptime_percentage decimal(5,2) NOT NULL,
  mobile_responsive boolean DEFAULT true NOT NULL,
  analytics_tool_used text,
  maintenance_schedule text,
  remarks text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_websites_website_id ON websites (website_id);
CREATE INDEX IF NOT EXISTS idx_websites_created_by ON websites (created_by);
CREATE INDEX IF NOT EXISTS idx_websites_ssl_status ON websites (ssl_status);
CREATE INDEX IF NOT EXISTS idx_websites_domain_name ON websites (domain_name);

CREATE TABLE IF NOT EXISTS coupons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  coupon_id text NOT NULL UNIQUE,
  coupon_code text NOT NULL UNIQUE,
  issued_date date NOT NULL,
  expiry_date date NOT NULL,
  discount_amount decimal(10,2) NOT NULL,
  usage_limit integer NOT NULL,
  redemption_count integer DEFAULT 0 NOT NULL,
  applicable_items text,
  is_stackable boolean DEFAULT false NOT NULL,
  status text NOT NULL,
  campaign_source text,
  created_by uuid NOT NULL,
  remarks text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_coupons_coupon_id ON coupons (coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupons_coupon_code ON coupons (coupon_code);
CREATE INDEX IF NOT EXISTS idx_coupons_created_by ON coupons (created_by);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons (status);
CREATE INDEX IF NOT EXISTS idx_coupons_expiry_date ON coupons (expiry_date);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  user_id uuid NOT NULL,
  workflow_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL,
  changes jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_workflow_name ON audit_logs (workflow_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON audit_logs (record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at);