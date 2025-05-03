<script lang="ts">
	import { albumColors } from '$lib/colors';
	import { texts } from '$lib/texts';
	import html2canvas from 'html2canvas';
	import { onMount } from 'svelte';
	import { textfit } from 'svelte-textfit';
	import Scribble from './Scribble.svelte';

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
	let mirroredText = false;
	let scribbledText = false;

	// can only scribble when centered
	$: scribbledText = centeredText ? scribbledText : false;

	let albumArt!: HTMLDivElement;
	let scribble!: HTMLDivElement;

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

	async function renderArt() {
		const { Image } = await import('image-js');
		const canvas = await html2canvas(albumArt, {
			backgroundColor: styles.background
		});

		let image = await Image.load(canvas.toDataURL('image/png'));
		const originalWidth = image.width;
		image = image
			.resize({ preserveAspectRatio: true, width: originalWidth * 0.85 }) // Get those compression artifacts like the original cover
			.resize({ preserveAspectRatio: true, width: originalWidth })
			.blurFilter({ radius: 2 });

		const imageCanvas = image.getCanvas();
		if (scribbledText) {
			const scribbleSvg = scribble.querySelector('svg')! as SVGSVGElement;
			const svgString = new XMLSerializer().serializeToString(scribbleSvg);
			// load svg as image with foreground color
			const dataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;

			const scribbleImage = new window.Image(); // Use window.Image to avoid conflict with image-js Image

			await new Promise((resolve, reject) => {
				scribbleImage.onload = resolve;
				scribbleImage.onerror = reject;
				scribbleImage.src = dataUrl;
			});

			const ctx = imageCanvas.getContext('2d');
			if (ctx) {
				const canvasWidth = imageCanvas.width;
				const canvasHeight = imageCanvas.height;
				const svgAspectRatio =
					scribbleSvg.viewBox.baseVal.width / scribbleSvg.viewBox.baseVal.height;
				const drawWidth = canvasWidth;
				const drawHeight = drawWidth / svgAspectRatio;
				// Center the scribble vertically
				const drawX = 0;
				const drawY = (canvasHeight - drawHeight) / 2;

				ctx.drawImage(scribbleImage, drawX, drawY, drawWidth, drawHeight);

				image = Image.fromCanvas(imageCanvas);
			} else {
				console.error('Could not get 2D context from canvas');
			}
		}

		return image;
	}

	async function downloadArt() {
		const image = await renderArt();

		const link = document.createElement('a');
		link.href = image.toDataURL();

		link.download = `${text}.png`;
		link.click();
	}

	async function copyArtToClipboard() {
		const image = await renderArt();
		const blob = await image.toBlob('image/png', 1.0);

		const item = new ClipboardItem({
			'image/png': blob
		});

		await navigator.clipboard.write([item]);

		alert('Copied image to clipboard');
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
	<div class="scribble" bind:this={scribble} class:hidden={!scribbledText}>
		<Scribble color={styles.foreground} />
	</div>
	<div
		contenteditable="true"
		bind:textContent={text}
		style={cssVariables}
		class="album-art"
		bind:this={albumArt}
		class:centered={centeredText}
		class:mirrored={mirroredText}
		use:textfit={{
			update: [text, styles],
			parent: albumArt,
			max: 6 * rem
		}}
	></div>
</section>

<section class="settings">
	<div>
		<label for="center">Center text but might not work well with long text</label>
		<input type="checkbox" id="center" bind:checked={centeredText} />
		<label for="mirror">Mirror text</label>
		<input type="checkbox" id="mirror" bind:checked={mirroredText} />
		<label for="scribble"><s>Scribble</s></label>
		<input type="checkbox" id="scribble" disabled={!centeredText} bind:checked={scribbledText} />
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
	<button data-umami-event="Export" on:click={downloadArt}>download</button>
	<button data-umami-event="Export" on:click={copyArtToClipboard}>copy to clipboard</button>
</section>

<style>
	.shadow {
		box-shadow: 1px 0px 45px 2px rgba(0, 0, 0, 0.25);
		margin: 2rem 0;
		position: relative;
	}
	.scribble.hidden {
		display: none;
	}
	.scribble {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 100%;
		height: auto;
		z-index: 2;
		pointer-events: none; /* Allow clicks to pass through */
	}
	.album-art {
		background-color: var(--background);
		color: var(--foreground);
		width: 24rem;
		height: 24rem;
		text-align: justify;
		backface-visibility: hidden;
		filter: blur(2px);
	}
	.album-art.centered {
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		text-align: center;
	}
	.album-art.mirrored {
		transform: scaleX(-1);
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
