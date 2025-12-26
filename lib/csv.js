export function arrayToCSV(data, columns) {
  if (!data || data.length === 0) {
    return '';
  }

  const headers = columns.map(col => col.header).join(',');
  
  const rows = data.map(row => {
    return columns.map(col => {
      const value = row[col.key];
      
      if (value === null || value === undefined) {
        return '';
      }
      
      const stringValue = String(value);
      
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    }).join(',');
  });

  return [headers, ...rows].join('\n');
}

export function csvToArray(csvString, columns) {
  const lines = csvString.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV file must contain headers and at least one data row');
  }

  const headers = parseCSVLine(lines[0]);
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};

    columns.forEach((col, index) => {
      const value = values[index];
      
      if (col.type === 'number') {
        row[col.key] = value ? parseFloat(value) : null;
      } else if (col.type === 'integer') {
        row[col.key] = value ? parseInt(value, 10) : null;
      } else if (col.type === 'boolean') {
        row[col.key] = value === 'true' || value === '1' || value === 'yes';
      } else if (col.type === 'date') {
        row[col.key] = value ? value : null;
      } else {
        row[col.key] = value || '';
      }
    });

    data.push(row);
  }

  return data;
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

export function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const SEO_CSV_COLUMNS = [
  { key: 'seo_campaign_id', header: 'Campaign ID', type: 'string' },
  { key: 'keyword_targeted', header: 'Keyword', type: 'string' },
  { key: 'search_volume', header: 'Search Volume', type: 'integer' },
  { key: 'keyword_ranking', header: 'Ranking', type: 'integer' },
  { key: 'page_url', header: 'Page URL', type: 'string' },
  { key: 'backlink_count', header: 'Backlinks', type: 'integer' },
  { key: 'domain_authority', header: 'Domain Authority', type: 'integer' },
  { key: 'content_updated_date', header: 'Content Updated', type: 'date' },
  { key: 'crawl_status', header: 'Crawl Status', type: 'string' },
  { key: 'meta_title', header: 'Meta Title', type: 'string' },
  { key: 'meta_description', header: 'Meta Description', type: 'string' },
  { key: 'technical_issues', header: 'Technical Issues', type: 'string' },
  { key: 'remarks', header: 'Remarks', type: 'string' }
];

export const WEBSITE_CSV_COLUMNS = [
  { key: 'website_id', header: 'Website ID', type: 'string' },
  { key: 'domain_name', header: 'Domain', type: 'string' },
  { key: 'page_count', header: 'Page Count', type: 'integer' },
  { key: 'cms_used', header: 'CMS', type: 'string' },
  { key: 'launch_date', header: 'Launch Date', type: 'date' },
  { key: 'last_updated_date', header: 'Last Updated', type: 'date' },
  { key: 'ssl_status', header: 'SSL Status', type: 'string' },
  { key: 'page_load_time', header: 'Load Time (s)', type: 'number' },
  { key: 'uptime_percentage', header: 'Uptime %', type: 'number' },
  { key: 'mobile_responsive', header: 'Mobile Responsive', type: 'boolean' },
  { key: 'analytics_tool_used', header: 'Analytics Tool', type: 'string' },
  { key: 'maintenance_schedule', header: 'Maintenance Schedule', type: 'string' },
  { key: 'remarks', header: 'Remarks', type: 'string' }
];

export const COUPON_CSV_COLUMNS = [
  { key: 'coupon_id', header: 'Coupon ID', type: 'string' },
  { key: 'coupon_code', header: 'Code', type: 'string' },
  { key: 'issued_date', header: 'Issued Date', type: 'date' },
  { key: 'expiry_date', header: 'Expiry Date', type: 'date' },
  { key: 'discount_amount', header: 'Discount Amount', type: 'number' },
  { key: 'usage_limit', header: 'Usage Limit', type: 'integer' },
  { key: 'redemption_count', header: 'Redemptions', type: 'integer' },
  { key: 'applicable_items', header: 'Applicable Items', type: 'string' },
  { key: 'is_stackable', header: 'Stackable', type: 'boolean' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'campaign_source', header: 'Campaign Source', type: 'string' },
  { key: 'remarks', header: 'Remarks', type: 'string' }
];