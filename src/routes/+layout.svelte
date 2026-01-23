<script>
	import './styles.css';
	import Umami from './Umami.svelte';
	import arialNarrow from '$lib/fonts/arial-narrow.woff'
</script>

<svelte:head>
	<link
		rel="preload"
		as="font"
		href={arialNarrow}
		type="font/woff2"
		crossorigin="anonymous"
	/>
</svelte:head>

<div class="app">
	<main>
		<slot />
	</main>
</div>
<Umami />
