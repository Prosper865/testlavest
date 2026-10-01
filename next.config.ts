import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // KYC submissions carry two files of up to 5 MB each, plus form fields.
      bodySizeLimit: "12mb",
    },
  },
  // Ship the SQL migrations with the server build so they can run on first request.
  outputFileTracingIncludes: {
    "/**": ["./drizzle/**/*"],
  },
};

export default nextConfig;
