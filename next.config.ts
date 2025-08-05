import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'http',
				hostname: 'localhost',
				port: '8000',
				pathname: '/uploads/**',
			},
			{
				protocol: 'https',
				hostname: 'localhost',
				port: '8000',
				pathname: '/uploads/**',
			},
			// Add other domains as needed for external image URLs
			{
				protocol: 'https',
				hostname: '**',
			},
			{
				protocol: 'http',
				hostname: '**',
			},
		],
	},
};

export default nextConfig;
