import { BetaAnalyticsDataClient } from "@google-analytics/data";

// Google Analytics Data API service
// This fetches real analytics data from Firebase Analytics/Google Analytics

export interface GoogleAnalyticsData {
  activeUsers: number;
  totalUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: Array<{ pagePath: string; pageViews: number }>;
  topCountries: Array<{ country: string; users: number }>;
  deviceCategories: Array<{ deviceCategory: string; users: number }>;
  trafficSources: Array<{ source: string; users: number }>;
  userEngagement: {
    averageSessionDuration: number;
    bounceRate: number;
    pagesPerSession: number;
  };
  lastUpdated: string;
}

class GoogleAnalyticsService {
  private client: BetaAnalyticsDataClient | null = null;
  private propertyId: string | null = null;

  constructor() {
    // Initialize with service account credentials
    this.initializeClient();
  }

  private initializeClient() {
    try {
      // Get service account credentials from environment variables
      const serviceAccountKey =
        process.env.GOOGLE_ANALYTICS_SERVICE_ACCOUNT_KEY;
      const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;

      if (!serviceAccountKey || !propertyId) {
        console.warn("Google Analytics credentials not configured");
        return;
      }

      this.propertyId = propertyId;

      // Parse service account key from environment variable
      const serviceAccount = JSON.parse(serviceAccountKey);

      this.client = new BetaAnalyticsDataClient({
        credentials: serviceAccount,
      });

      console.log("Google Analytics Data API client initialized");
    } catch (error) {
      console.error("Failed to initialize Google Analytics client:", error);
    }
  }

  // Get real-time active users (last 30 minutes)
  async getActiveUsers(): Promise<number> {
    if (!this.client || !this.propertyId) {
      return 0;
    }

    try {
      const [response] = await this.client.runRealtimeReport({
        property: `properties/${this.propertyId}`,
        metrics: [{ name: "activeUsers" }],
      });

      return parseInt(response.rows?.[0]?.metricValues?.[0]?.value || "0");
    } catch (error) {
      console.error("Error fetching active users:", error);
      return 0;
    }
  }

  // Get analytics data for a specific date range
  async getAnalyticsData(
    startDate: string,
    endDate: string
  ): Promise<GoogleAnalyticsData> {
    if (!this.client || !this.propertyId) {
      return this.getFallbackData();
    }

    try {
      // Fetch multiple reports in parallel
      const [
        userMetrics,
        sessionMetrics,
        pageViews,
        topPages,
        topCountries,
        deviceCategories,
        trafficSources,
        engagementMetrics,
      ] = await Promise.all([
        this.getUserMetrics(startDate, endDate),
        this.getSessionMetrics(startDate, endDate),
        this.getPageViews(startDate, endDate),
        this.getTopPages(startDate, endDate),
        this.getTopCountries(startDate, endDate),
        this.getDeviceCategories(startDate, endDate),
        this.getTrafficSources(startDate, endDate),
        this.getEngagementMetrics(startDate, endDate),
      ]);

      return {
        activeUsers: await this.getActiveUsers(),
        totalUsers: userMetrics.totalUsers,
        newUsers: userMetrics.newUsers,
        sessions: sessionMetrics.sessions,
        pageViews: pageViews,
        averageSessionDuration: engagementMetrics.averageSessionDuration,
        bounceRate: engagementMetrics.bounceRate,
        topPages,
        topCountries,
        deviceCategories,
        trafficSources,
        userEngagement: {
          averageSessionDuration: engagementMetrics.averageSessionDuration,
          bounceRate: engagementMetrics.bounceRate,
          pagesPerSession: engagementMetrics.pagesPerSession,
        },
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error fetching Google Analytics data:", error);
      return this.getFallbackData();
    }
  }

  // Get user metrics (total users, new users)
  private async getUserMetrics(startDate: string, endDate: string) {
    const [response] = await this.client!.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: "totalUsers" }, { name: "newUsers" }],
    });

    return {
      totalUsers: parseInt(response.rows?.[0]?.metricValues?.[0]?.value || "0"),
      newUsers: parseInt(response.rows?.[0]?.metricValues?.[1]?.value || "0"),
    };
  }

  // Get session metrics
  private async getSessionMetrics(startDate: string, endDate: string) {
    const [response] = await this.client!.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: "sessions" }],
    });

    return {
      sessions: parseInt(response.rows?.[0]?.metricValues?.[0]?.value || "0"),
    };
  }

  // Get page views
  private async getPageViews(
    startDate: string,
    endDate: string
  ): Promise<number> {
    const [response] = await this.client!.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: "screenPageViews" }],
    });

    return parseInt(response.rows?.[0]?.metricValues?.[0]?.value || "0");
  }

  // Get top pages
  private async getTopPages(startDate: string, endDate: string) {
    const [response] = await this.client!.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    });

    return (
      response.rows?.map((row) => ({
        pagePath: row.dimensionValues?.[0]?.value || "Unknown",
        pageViews: parseInt(row.metricValues?.[0]?.value || "0"),
      })) || []
    );
  }

  // Get top countries
  private async getTopCountries(startDate: string, endDate: string) {
    const [response] = await this.client!.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 10,
    });

    return (
      response.rows?.map((row) => ({
        country: row.dimensionValues?.[0]?.value || "Unknown",
        users: parseInt(row.metricValues?.[0]?.value || "0"),
      })) || []
    );
  }

  // Get device categories
  private async getDeviceCategories(startDate: string, endDate: string) {
    const [response] = await this.client!.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
    });

    return (
      response.rows?.map((row) => ({
        deviceCategory: row.dimensionValues?.[0]?.value || "Unknown",
        users: parseInt(row.metricValues?.[0]?.value || "0"),
      })) || []
    );
  }

  // Get traffic sources
  private async getTrafficSources(startDate: string, endDate: string) {
    const [response] = await this.client!.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "source" }],
      metrics: [{ name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 10,
    });

    return (
      response.rows?.map((row) => ({
        source: row.dimensionValues?.[0]?.value || "Unknown",
        users: parseInt(row.metricValues?.[0]?.value || "0"),
      })) || []
    );
  }

  // Get engagement metrics
  private async getEngagementMetrics(startDate: string, endDate: string) {
    const [response] = await this.client!.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
        { name: "sessionsPerUser" },
      ],
    });

    const row = response.rows?.[0];
    return {
      averageSessionDuration: parseFloat(row?.metricValues?.[0]?.value || "0"),
      bounceRate: parseFloat(row?.metricValues?.[1]?.value || "0"),
      pagesPerSession: parseFloat(row?.metricValues?.[2]?.value || "0"),
    };
  }

  // Fallback data when API is not available
  private getFallbackData(): GoogleAnalyticsData {
    return {
      activeUsers: 0,
      totalUsers: 0,
      newUsers: 0,
      sessions: 0,
      pageViews: 0,
      averageSessionDuration: 0,
      bounceRate: 0,
      topPages: [],
      topCountries: [],
      deviceCategories: [],
      trafficSources: [],
      userEngagement: {
        averageSessionDuration: 0,
        bounceRate: 0,
        pagesPerSession: 0,
      },
      lastUpdated: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const googleAnalyticsService = new GoogleAnalyticsService();
