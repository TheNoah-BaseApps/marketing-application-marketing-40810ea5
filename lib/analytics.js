import { query } from './database/aurora';

export async function getDashboardMetrics() {
  try {
    const [seoCount, websiteCount, couponCount, activeCoups] = await Promise.all([
      query('SELECT COUNT(*) as count FROM seo_campaigns'),
      query('SELECT COUNT(*) as count FROM websites'),
      query('SELECT COUNT(*) as count FROM coupons'),
      query("SELECT COUNT(*) as count FROM coupons WHERE status = 'active'")
    ]);

    return {
      seoCount: parseInt(seoCount.rows[0]?.count || 0),
      websiteCount: parseInt(websiteCount.rows[0]?.count || 0),
      couponCount: parseInt(couponCount.rows[0]?.count || 0),
      activeCoupons: parseInt(activeCoups.rows[0]?.count || 0)
    };
  } catch (error) {
    console.error('Error getting dashboard metrics:', error);
    throw error;
  }
}

export async function getSEOAnalytics(startDate, endDate) {
  try {
    const avgRankingQuery = await query(
      `SELECT AVG(keyword_ranking) as avg_ranking 
       FROM seo_campaigns 
       WHERE created_at BETWEEN $1 AND $2`,
      [startDate, endDate]
    );

    const avgDAQuery = await query(
      `SELECT AVG(domain_authority) as avg_da 
       FROM seo_campaigns 
       WHERE created_at BETWEEN $1 AND $2`,
      [startDate, endDate]
    );

    const totalBacklinksQuery = await query(
      `SELECT SUM(backlink_count) as total_backlinks 
       FROM seo_campaigns 
       WHERE created_at BETWEEN $1 AND $2`,
      [startDate, endDate]
    );

    const crawlStatusQuery = await query(
      `SELECT crawl_status, COUNT(*) as count 
       FROM seo_campaigns 
       WHERE created_at BETWEEN $1 AND $2 
       GROUP BY crawl_status`,
      [startDate, endDate]
    );

    const rankingDistributionQuery = await query(
      `SELECT 
         CASE 
           WHEN keyword_ranking <= 10 THEN '1-10'
           WHEN keyword_ranking <= 20 THEN '11-20'
           WHEN keyword_ranking <= 50 THEN '21-50'
           ELSE '51-100'
         END as ranking_range,
         COUNT(*) as count
       FROM seo_campaigns 
       WHERE created_at BETWEEN $1 AND $2
       GROUP BY ranking_range
       ORDER BY ranking_range`,
      [startDate, endDate]
    );

    return {
      avgRanking: parseFloat(avgRankingQuery.rows[0]?.avg_ranking || 0).toFixed(2),
      avgDomainAuthority: parseFloat(avgDAQuery.rows[0]?.avg_da || 0).toFixed(2),
      totalBacklinks: parseInt(totalBacklinksQuery.rows[0]?.total_backlinks || 0),
      crawlStatus: crawlStatusQuery.rows,
      rankingDistribution: rankingDistributionQuery.rows
    };
  } catch (error) {
    console.error('Error getting SEO analytics:', error);
    throw error;
  }
}

export async function getCouponAnalytics(startDate, endDate) {
  try {
    const totalRedemptionsQuery = await query(
      `SELECT SUM(redemption_count) as total_redemptions 
       FROM coupons 
       WHERE created_at BETWEEN $1 AND $2`,
      [startDate, endDate]
    );

    const avgDiscountQuery = await query(
      `SELECT AVG(discount_amount) as avg_discount 
       FROM coupons 
       WHERE created_at BETWEEN $1 AND $2`,
      [startDate, endDate]
    );

    const statusDistributionQuery = await query(
      `SELECT status, COUNT(*) as count 
       FROM coupons 
       WHERE created_at BETWEEN $1 AND $2 
       GROUP BY status`,
      [startDate, endDate]
    );

    const topCouponsQuery = await query(
      `SELECT coupon_code, redemption_count, discount_amount 
       FROM coupons 
       WHERE created_at BETWEEN $1 AND $2 
       ORDER BY redemption_count DESC 
       LIMIT 10`,
      [startDate, endDate]
    );

    const redemptionRateQuery = await query(
      `SELECT 
         COUNT(*) as total_coupons,
         COUNT(CASE WHEN redemption_count > 0 THEN 1 END) as redeemed_coupons
       FROM coupons 
       WHERE created_at BETWEEN $1 AND $2`,
      [startDate, endDate]
    );

    const totalCoupons = parseInt(redemptionRateQuery.rows[0]?.total_coupons || 0);
    const redeemedCoupons = parseInt(redemptionRateQuery.rows[0]?.redeemed_coupons || 0);
    const redemptionRate = totalCoupons > 0 ? ((redeemedCoupons / totalCoupons) * 100).toFixed(2) : 0;

    return {
      totalRedemptions: parseInt(totalRedemptionsQuery.rows[0]?.total_redemptions || 0),
      avgDiscount: parseFloat(avgDiscountQuery.rows[0]?.avg_discount || 0).toFixed(2),
      redemptionRate,
      statusDistribution: statusDistributionQuery.rows,
      topCoupons: topCouponsQuery.rows
    };
  } catch (error) {
    console.error('Error getting coupon analytics:', error);
    throw error;
  }
}

export async function getWebsiteAnalytics(startDate, endDate) {
  try {
    const avgLoadTimeQuery = await query(
      `SELECT AVG(page_load_time) as avg_load_time 
       FROM websites 
       WHERE created_at BETWEEN $1 AND $2`,
      [startDate, endDate]
    );

    const avgUptimeQuery = await query(
      `SELECT AVG(uptime_percentage) as avg_uptime 
       FROM websites 
       WHERE created_at BETWEEN $1 AND $2`,
      [startDate, endDate]
    );

    const sslStatusQuery = await query(
      `SELECT ssl_status, COUNT(*) as count 
       FROM websites 
       WHERE created_at BETWEEN $1 AND $2 
       GROUP BY ssl_status`,
      [startDate, endDate]
    );

    const mobileResponsiveQuery = await query(
      `SELECT 
         COUNT(CASE WHEN mobile_responsive = true THEN 1 END) as responsive,
         COUNT(CASE WHEN mobile_responsive = false THEN 1 END) as not_responsive
       FROM websites 
       WHERE created_at BETWEEN $1 AND $2`,
      [startDate, endDate]
    );

    const cmsDistributionQuery = await query(
      `SELECT cms_used, COUNT(*) as count 
       FROM websites 
       WHERE created_at BETWEEN $1 AND $2 
       GROUP BY cms_used 
       ORDER BY count DESC`,
      [startDate, endDate]
    );

    return {
      avgLoadTime: parseFloat(avgLoadTimeQuery.rows[0]?.avg_load_time || 0).toFixed(2),
      avgUptime: parseFloat(avgUptimeQuery.rows[0]?.avg_uptime || 0).toFixed(2),
      sslStatus: sslStatusQuery.rows,
      mobileResponsive: mobileResponsiveQuery.rows[0],
      cmsDistribution: cmsDistributionQuery.rows
    };
  } catch (error) {
    console.error('Error getting website analytics:', error);
    throw error;
  }
}