import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */

	// palun: trying to reduce the number of watched files. see also tsconfig.json
	experimental: {
		turbo: {
			rules: {
				watch: [
					"src/**/*",
					"!node_modules/**",
					"!.git/**",
					"!.next/**"
				]
			}
		}
	},
	webpack: (config) => {
		config.watchOptions = {
			poll: false,
			ignored: ['**/node_modules', '**/.git', '.next/**']
		}
		return config
	}

};

export default nextConfig;
