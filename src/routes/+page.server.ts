import { env } from '$env/dynamic/private';
export const prerender = true;

export function load() {
	return { url: env.VERCEL_PROJECT_PRODUCTION_URL ?? '' };
}
