const nextConfig = {
  transpilePackages: ["@wormhole-foundation/wormhole-connect"],

  webpack: (config) => {
    config.resolve = config.resolve || {};

    config.resolve.fallback = {
      ...config.resolve.fallback,
      encoding: false,
    };

    return config;
  },
};

export default nextConfig;