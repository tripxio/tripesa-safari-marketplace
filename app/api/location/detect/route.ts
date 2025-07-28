import { NextRequest, NextResponse } from "next/server";

interface LocationData {
  country: string;
  countryCode: string;
  city?: string;
  region?: string;
}

// Map country codes to our destination names
const COUNTRY_TO_DESTINATION: Record<string, string> = {
  ug: "Uganda",
  rw: "Rwanda",
  tz: "Tanzania",
  ke: "Kenya",
  bw: "Botswana",
  za: "South Africa",
};

export async function GET(request: NextRequest) {
  try {
    // Get client IP from headers
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwarded ? forwarded.split(",")[0] : realIp || "127.0.0.1";

    // For development, return mock data
    if (process.env.NODE_ENV === "development" || ip === "127.0.0.1") {
      return NextResponse.json({
        country: "Uganda",
        countryCode: "ug",
        city: "Kampala",
        region: "Central",
        destination: "Uganda",
        isDevelopment: true,
      });
    }

    // Use ipapi.co for IP geolocation
    const response = await fetch(`https://ipapi.co/${ip}/json/`);

    if (!response.ok) {
      throw new Error("IP geolocation failed");
    }

    const data = await response.json();

    const locationData: LocationData = {
      country: data.country_name,
      countryCode: data.country_code.toLowerCase(),
      city: data.city,
      region: data.region,
    };

    const destination =
      COUNTRY_TO_DESTINATION[locationData.countryCode] || null;

    return NextResponse.json({
      ...locationData,
      destination,
      isDevelopment: false,
    });
  } catch (error) {
    console.error("Location detection error:", error);

    // Return mock data as fallback
    return NextResponse.json({
      country: "Uganda",
      countryCode: "ug",
      city: "Kampala",
      region: "Central",
      destination: "Uganda",
      isDevelopment: true,
      error: "Location detection failed, using fallback",
    });
  }
}
