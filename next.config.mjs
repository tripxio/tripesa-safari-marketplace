/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@getbrevo/brevo'],
  httpAgentOptions: {
    keepAlive: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tripesaglobal.s3.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle server-only packages on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
