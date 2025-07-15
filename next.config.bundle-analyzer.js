const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Enable SWC minification
  swcMinify: true,
  
  // Optimize images
  images: {
    domains: ['images.ctfassets.net'], // Contentful images
    formats: ['image/avif', 'image/webp'],
  },
  
  // Experimental features
  experimental: {
    // Enable React Server Components
    serverComponents: true,
    // Enable optimizePackageImports
    optimizePackageImports: ['lucide-react'],
  },
  
  // Webpack configuration for bundle analysis
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle analysis configuration
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html',
          defaultSizes: 'parsed',
          openAnalyzer: false,
          generateStatsFile: true,
          statsFilename: isServer ? '../analyze/server-stats.json' : './analyze/client-stats.json',
        })
      )
    }
    
    // Optimize for production
    if (!dev) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Create a separate chunk for design system CSS
          designSystem: {
            name: 'design-system',
            test: /[\\/]src[\\/]styles[\\/]/,
            chunks: 'all',
            priority: 10,
            enforce: true,
          },
          // Create a separate chunk for components
          components: {
            name: 'components',
            test: /[\\/]src[\\/]components[\\/]/,
            chunks: 'all',
            priority: 5,
            minChunks: 2,
          },
          // Vendor libraries
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            chunks: 'all',
            priority: 1,
          },
        },
      }
    }
    
    return config
  },
  
  // Headers for performance optimization
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=60',
          },
        ],
      },
    ]
  },
}

module.exports = withBundleAnalyzer(nextConfig)