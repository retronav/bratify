<script>
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';

	const umamiWebsiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;
	const umamiTrackingUrl = import.meta.env.VITE_UMAMI_TRACKING_URL;

	onMount(() => {
		if (!dev && umamiWebsiteId && umamiTrackingUrl) {
			const script = document.createElement('script');
			script.async = true;
			script.defer = true;
			script.setAttribute('data-website-id', umamiWebsiteId);
			script.src = umamiTrackingUrl;
			document.head.appendChild(script);
		}
	});
</script>
