interface LocationData {
  country: string;
  countryCode: string;
  city?: string;
  region?: string;
}

interface CountryMapping {
  [key: string]: string; // country code to destination name
}

// Map country codes to our destination names
const COUNTRY_TO_DESTINATION: CountryMapping = {
  ug: "Uganda",
  rw: "Rwanda",
  tz: "Tanzania",
  ke: "Kenya",
  bw: "Botswana",
  za: "South Africa",
};

export class LocationService {
  private static instance: LocationService;
  private cachedLocation: LocationData | null = null;
  private isDetecting = false;

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async detectLocation(): Promise<LocationData | null> {
    // Return cached result if available
    if (this.cachedLocation) {
      return this.cachedLocation;
    }

    // Prevent multiple simultaneous detection attempts
    if (this.isDetecting) {
      return null;
    }

    this.isDetecting = true;

    try {
      // Use our API route to avoid CORS issues
      const location = await this.detectByAPI();
      if (location) {
        this.cachedLocation = location;
        return location;
      }

      return null;
    } catch (error) {
      console.warn("Location detection failed:", error);
      return null;
    } finally {
      this.isDetecting = false;
    }
  }

  private async detectByAPI(): Promise<LocationData | null> {
    try {
      const response = await fetch("/api/location/detect", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Location API failed");
      }

      const data = await response.json();

      return {
        country: data.country,
        countryCode: data.countryCode,
        city: data.city,
        region: data.region,
      };
    } catch (error) {
      console.warn("API-based location detection failed:", error);
      return null;
    }
  }

  getDestinationFromCountry(countryCode: string): string | null {
    return COUNTRY_TO_DESTINATION[countryCode.toLowerCase()] || null;
  }

  // Get all available destinations
  getAvailableDestinations(): string[] {
    return Object.values(COUNTRY_TO_DESTINATION);
  }

  // Clear cached location (useful for testing)
  clearCache(): void {
    this.cachedLocation = null;
  }
}

export const locationService = LocationService.getInstance();
