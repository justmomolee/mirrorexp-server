import fetch from "node-fetch";

const isPrivateIp = (ip) => {
  return (
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("172.16.") ||
    ip.startsWith("127.") ||
    ip === "::1"
  );
};

const lookupGeo = async (ip) => {
  if (!ip || isPrivateIp(ip)) return undefined;
  try {
    const resp = await fetch(`https://ipapi.co/${ip}/json/`, { timeout: 2000 });
    if (!resp.ok) return undefined;
    const data = await resp.json();
    return {
      city: data.city || undefined,
      region: data.region || undefined,
      country: data.country_name || data.country || undefined,
      lat: data.latitude ? Number(data.latitude) : undefined,
      lng: data.longitude ? Number(data.longitude) : undefined,
    };
  } catch {
    return undefined;
  }
};

export const getRequestContext = async (req) => {
  const ip =
    req.headers["x-vercel-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["cf-connecting-ip"] ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    req.ip;

  const locationFromHeaders = {
    city:
      req.headers["x-vercel-ip-city"] ||
      req.headers["cf-ipcity"] ||
      undefined,
    region:
      req.headers["x-vercel-ip-country-region"] ||
      req.headers["cf-region"] ||
      undefined,
    country:
      req.headers["x-vercel-ip-country"] ||
      req.headers["cf-ipcountry"] ||
      undefined,
    lat: req.headers["x-vercel-ip-latitude"]
      ? Number(req.headers["x-vercel-ip-latitude"])
      : undefined,
    lng: req.headers["x-vercel-ip-longitude"]
      ? Number(req.headers["x-vercel-ip-longitude"])
      : undefined,
  };

  let location =
    locationFromHeaders.city ||
    locationFromHeaders.region ||
    locationFromHeaders.country
      ? locationFromHeaders
      : undefined;

  if (!location) {
    location = await lookupGeo(ip);
  }

  return {
    ipAddress: ip,
    userAgent: req.headers["user-agent"],
    location,
  };
};
