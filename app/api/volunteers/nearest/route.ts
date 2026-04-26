import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/server/models/User";
import { getNearestVolunteers, estimateDeliveryTime, formatDistance } from "@/lib/distance";
import { getAreaCoordinates, calculateDistanceFromCoords } from "@/lib/areaCoordinates";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { latitude, longitude, maxDistance = 10, limit = 50 } = await request.json();

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    // Get all approved volunteers
    // Get all approved AND available volunteers only
    const allVolunteers = await User.find({
  role: "volunteer",
  volunteerStatus: "approved",
  isAvailable: { $ne: false },
})
  .select("name email phone qualifications serviceArea latitude longitude address isAvailable activeTaskCount")
  .lean();

    if (allVolunteers.length === 0) {
      return NextResponse.json({
        message: "No approved volunteers found",
        volunteers: [],
      });
    }

    // Priority 1: Volunteers with GPS location data
    const volunteersWithGps = allVolunteers.filter(
      (v) => v.latitude != null && v.longitude != null
    );

    let result: any[] = [];

    if (volunteersWithGps.length > 0) {
      // Format volunteers with GPS for distance calculation
      const volunteerCoords = volunteersWithGps.map((v) => ({
        id: v._id.toString(),
        name: v.name,
        latitude: v.latitude!,
        longitude: v.longitude!,
      }));

      // Get nearest volunteers with GPS
      const nearest = getNearestVolunteers(
        volunteerCoords,
        { latitude, longitude },
        maxDistance,
        limit
      );

      result = nearest.map((n) => {
        const volunteer = volunteersWithGps.find((v) => v._id.toString() === n.id);
        return {
          id: n.id,
          name: volunteer?.name || "Unknown",
          email: volunteer?.email || "",
          phone: volunteer?.phone || "",
          qualifications: volunteer?.qualifications || "",
          serviceArea: volunteer?.serviceArea || volunteer?.address || "",
          latitude: n.latitude,
          longitude: n.longitude,
          distance: n.distance,
          distanceFormatted: formatDistance(n.distance),
          estimatedTime: estimateDeliveryTime(n.distance),
          hasLocationData: true,
        };
      });
    } else {
      // Priority 2: Fallback to area coordinates when no GPS data available
      // Get all volunteers with address/serviceArea that can be mapped to coordinates
      const volunteersWithArea = allVolunteers.filter(
        (v) => v.serviceArea || v.address
      );

      if (volunteersWithArea.length > 0) {
        // Calculate distance using area coordinates
        const volunteersWithDistance = volunteersWithArea
          .map((v) => {
            const areaKey = v.serviceArea || v.address || "";
            const areaCoords = getAreaCoordinates(areaKey);
            
            if (areaCoords) {
              const distance = calculateDistanceFromCoords(
                latitude,
                longitude,
                areaCoords.latitude,
                areaCoords.longitude
              );
              return {
                volunteer: v,
                distance,
                areaCoords,
              };
            }
            return null;
          })
          .filter((item): item is { volunteer: typeof allVolunteers[0]; distance: number; areaCoords: { latitude: number; longitude: number } } => 
            item !== null
          )
          .sort((a, b) => a.distance - b.distance)
          .slice(0, limit);

        result = volunteersWithDistance.map(({ volunteer, distance, areaCoords }) => ({
          id: volunteer._id.toString(),
          name: volunteer.name,
          email: volunteer.email,
          phone: volunteer.phone,
          qualifications: volunteer.qualifications || "",
          serviceArea: volunteer.serviceArea || volunteer.address || "",
          latitude: areaCoords.latitude,
          longitude: areaCoords.longitude,
          distance: distance,
          distanceFormatted: formatDistance(distance),
          estimatedTime: estimateDeliveryTime(distance),
          hasLocationData: false,
        }));
      }
    }

    // If still no results, return all approved volunteers sorted alphabetically (last resort)
    if (result.length === 0) {
      result = allVolunteers.slice(0, limit).map((v) => ({
        id: v._id.toString(),
        name: v.name,
        email: v.email,
        phone: v.phone,
        qualifications: v.qualifications || "",
        serviceArea: v.serviceArea || v.address || "",
        latitude: null,
        longitude: null,
        distance: null,
        distanceFormatted: "Unknown",
        estimatedTime: "Unknown",
        hasLocationData: false,
      }));
    }

    return NextResponse.json({
      success: true,
      location: { latitude, longitude },
      volunteers: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

