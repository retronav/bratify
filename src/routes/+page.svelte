<script>
	import Generator from './Generator.svelte';

	/** @type {import('./$types').PageData} */
	export let data;
</script>

<svelte:head>
	<title>bratify</title>
	<meta
		name="description"
		content="BRAT generator.
	Write your text and export it as if it was a BRAT album art piece."
	/>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="bratify" />
	<meta
		property="og:description"
		content="BRAT
	generator. Write your text and export it as if it was a BRAT album art
	piece."
	/>
	<meta property="og:image" content={`https://${data.url ?? ''}/bratify.png`} />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:title" content="bratify" />
	<meta
		property="twitter:description"
		content="BRAT
	generator. Write your text and export it as if it was a BRAT album art
	piece."
	/>
	<meta property="twitter:image" content={`https://${data.url ?? ''}/bratify.png`} />
</svelte:head>

<section>
	<header>
		<h1>bratify</h1>
	</header>

	<Generator />

	<footer>
		Made by <a href="https://karawale.in">retronav</a> xx.
		<a href="https://github.com/retronav/bratify">Source code</a>. Choose "custom color" in color
		preset if your brat summer is giving a different color combo.
		<br />
		<s>Scribbled</s> text only works when you center your text first. You can also set the background
		an image instead of a color!
	</footer>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	h1 {
		width: 100%;
		font-size: 2em;
	}

	footer {
		position: relative;
		bottom: 0;
		margin: 1rem 0;
	}
</style>
