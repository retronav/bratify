<script>
	import Generator from './Generator.svelte';
</script>

<svelte:head>
	<title>bratify</title>
	<meta
		name="description"
		content="BRAT album cover style art generator.
	Write your text and export it as if it was a BRAT album art piece."
	/>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="bratify" />
	<meta
		property="og:description"
		content="BRAT album cover style art
	generator. Write your text and export it as if it was a BRAT album art
	piece."
	/>
	<meta property="og:image" content="/bratify.png" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:title" content="bratify" />
	<meta
		property="twitter:description"
		content="BRAT album cover style art
	generator. Write your text and export it as if it was a BRAT album art
	piece."
	/>
	<meta property="twitter:image" content="/bratify.png" />
</svelte:head>

<section>
	<header>
		<h1>bratify</h1>
	</header>

	<Generator />

	<footer>
		Made by <a href="https://github.com/retronav">retronav</a> xx.
		<a href="https://github.com/retronav/bratify">Source code</a>.
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
	}

	footer {
		position: absolute;
		bottom: 0;
		margin: 2rem 0;
	}
</style>
