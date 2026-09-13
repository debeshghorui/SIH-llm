import type { NextConfig } from "next";

const apiUrl = process.env.API_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: "/api/auth/:path*",
                destination: `${apiUrl}/api/auth/:path*`,
            },
            {
                source: "/api/workspaces/:path*",
                destination: `${apiUrl}/api/workspaces/:path*`,
            },
            {
                source: "/api/workspaces",
                destination: `${apiUrl}/api/workspaces`,
            },
            {
                source: "/api/memory/:path*",
                destination: `${apiUrl}/api/memory/:path*`,
            },
            {
                source: "/api/memory",
                destination: `${apiUrl}/api/memory`,
            },
            {
                source: "/api/inngest",
                destination: `${apiUrl}/api/inngest`,
            },
            {
                source: "/api/inngest/:path*",
                destination: `${apiUrl}/api/inngest/:path*`,
            },
        ];
    },
};

export default nextConfig;
