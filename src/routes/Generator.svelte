<script lang="ts">
	import { onMount } from 'svelte';
	import html2canvas from 'html2canvas';
	import { texts } from '$lib/texts';
	import { albumColors } from '$lib/colors';
	import { textfit } from 'svelte-textfit';

	let text: string = 'brat';
	let colorPreset = 'brat';

	let styles = {
		background: albumColors[colorPreset].background,
		foreground: albumColors[colorPreset].foreground
	};

	$: cssVariables = Object.entries(styles)
		.map(([k, v]) => `--${k}:${v};`)
		.join('');

	let rem = 16;
	let centeredText = false;

	let albumArt!: HTMLDivElement;

	function moveCursorToEnd(element: HTMLElement) {
		const sel = window.getSelection();
		if (sel) {
			sel.selectAllChildren(element);
			sel.collapseToEnd();
		}
	}

	function updateStyles() {
		if (colorPreset !== 'custom')
			styles = {
				background: albumColors[colorPreset].background,
				foreground: albumColors[colorPreset].foreground
			};
	}

	async function exportArt() {
		const { Image } = await import('image-js');
		const canvas = await html2canvas(albumArt);

		let image = await Image.load(canvas.toDataURL('image/jpeg'));
		const originalWidth = image.width;
		image = image
			.resize({ preserveAspectRatio: true, width: originalWidth * 0.85 }) // Get those compression artifacts like the original cover
			.resize({ preserveAspectRatio: true, width: originalWidth })
			.blurFilter({ radius: 2 });

		const link = document.createElement('a');
		link.href = image.toDataURL();

		link.download = `${text}.jpeg`;
		link.click();
	}

	onMount(() => {
		rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
		albumArt.focus();
		// Setting just text is not triggering the resize thing
		text = texts[Math.floor(Math.random() * texts.length)];
		albumArt.textContent = text;
		moveCursorToEnd(albumArt);
	});
</script>

<section class="shadow">
	<div
		contenteditable="true"
		bind:textContent={text}
		style={cssVariables}
		class="album-art"
		class:centered={centeredText}
		bind:this={albumArt}
		use:textfit={{
			update: text,
			parent: albumArt,
			max: 6 * rem
		}}
	></div>
</section>

<section class="settings">
	<div>
		<label for="center">Center text but might not work well with long text</label>
		<input type="checkbox" id="center" bind:checked={centeredText} />
	</div>
	<div>
		<label for="preset">color presets</label>
		<select id="preset" bind:value={colorPreset} on:change={updateStyles}>
			{#each Object.entries(albumColors) as [name, albumColor]}
				<option
					style="color: {albumColor.foreground}; background-color: {albumColor.background}"
					value={name}>{albumColor.name.toLowerCase()}</option
				>
			{/each}
			<option
				value="custom"
				style="color: {albumColors.brat.background}; background-color: {albumColors.brat
					.foreground}">custom color</option
			>
		</select>
	</div>
	<div>
		<label for="background">background</label>
		<input
			type="color"
			id="background"
			bind:value={styles.background}
			disabled={colorPreset !== 'custom'}
		/>
	</div>
	<div>
		<label for="foreground">text</label>
		<input
			type="color"
			id="foreground"
			bind:value={styles.foreground}
			disabled={colorPreset !== 'custom'}
		/>
	</div>
</section>

<section class="export">
	<button data-umami-event="Export" on:click={exportArt}>download</button>
</section>

<style>
	.shadow {
		box-shadow: 1px 0px 45px 2px rgba(0, 0, 0, 0.25);
		margin: 2rem 0;
	}
	.album-art {
		background-color: var(--background);
		color: var(--foreground);
		width: 24rem;
		height: 24rem;
		text-align: justify;
		backface-visibility: hidden;
		filter: blur(2px) contrast(1.25);
	}
	.album-art.centered {
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		text-align: center;
	}
	.album-art:focus {
		outline: none;
	}
	.settings {
		display: flex;
		flex-direction: row;
		gap: 1rem;
		margin: 2rem 0;
	}
	.settings div {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.export button {
		font-size: 1.5rem;
	}

	@media (max-width: 768px) {
		.settings {
			display: flex;
			flex-direction: column;
		}
		.settings div {
			justify-content: space-between;
		}
	}
</style>
