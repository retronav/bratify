import * as env from '$env/static/private';
export const prerender = true;

export function load() {
	// @ts-expect-error: ignore for local
	return { url: env?.VERCEL_PROJECT_PRODUCTION_URL ?? '' };
}
