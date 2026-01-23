<script lang="ts">
	import { albumColors } from '$lib/colors';
	import { texts } from '$lib/texts';
	import { onMount } from 'svelte';
	import { textfit } from 'svelte-textfit';
	import Scribble from './Scribble.svelte';

	let text: string = 'brat';
	let colorPreset = 'brat';
	let bgImage: File | null = null;

	let albumArt!: HTMLDivElement;
	let scribble!: HTMLDivElement;
	let imageInput!: HTMLInputElement;

	let styles = {
		background: albumColors[colorPreset].background,
		foreground: albumColors[colorPreset].foreground,
		opacity: 1
	};

	$: if (bgImage) {
		styles.background = `url(${URL.createObjectURL(bgImage)})`;
	}

	$: if (colorPreset !== 'custom' && bgImage) {
		// reset input
		bgImage = null;
		imageInput.value = '';
	}

	$: cssVariables = Object.entries(styles)
		.map(([k, v]) => `--${k}:${v};`)
		.join('');

	let rem = 16;
	let centeredText = false;
	let mirroredText = false;
	let scribbledText = false;

	// can only scribble when centered
	$: scribbledText = centeredText ? scribbledText : false;

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
				foreground: albumColors[colorPreset].foreground,
				opacity: 1
			};
	}

	async function renderArt() {
		const { Image } = await import('image-js');
		const { default: html2canvas } = await import('html2canvas');

		const capturedElementCanvas = await html2canvas(albumArt, {
			backgroundColor: null,
			scale: 1 // might help on retina displays doubling the resolution
		});

		let processedForegroundImg = await Image.load(capturedElementCanvas.toDataURL('image/png'));
		const rawWidth = processedForegroundImg.width;

		processedForegroundImg = processedForegroundImg
			.resize({
				preserveAspectRatio: true,
				width: rawWidth * 0.85,
				interpolation: 'nearestNeighbor'
			})
			.resize({ preserveAspectRatio: true, width: rawWidth, interpolation: 'nearestNeighbor' });

		const compositeCanvas = document.createElement('canvas');
		compositeCanvas.width = processedForegroundImg.width;
		compositeCanvas.height = processedForegroundImg.height;

		const compositeCtx = compositeCanvas.getContext('2d')!;

		if (bgImage) {
			const backgroundImage = new window.Image();
			await new Promise((resolve, reject) => {
				backgroundImage.onload = resolve;
				backgroundImage.onerror = reject;
				backgroundImage.src = URL.createObjectURL(bgImage!);
			});

			const targetWidth = compositeCanvas.width;
			const targetHeight = compositeCanvas.height;
			const sourceWidth = backgroundImage.width;
			const sourceHeight = backgroundImage.height;

			const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);

			const scaledWidth = sourceWidth * scale;
			const scaledHeight = sourceHeight * scale;

			const offsetX = (targetWidth - scaledWidth) / 2;
			const offsetY = (targetHeight - scaledHeight) / 2;

			compositeCtx.filter = 'brightness(0.8)';
			compositeCtx.drawImage(backgroundImage, offsetX, offsetY, scaledWidth, scaledHeight);
			compositeCtx.filter = 'none';
		} else {
			compositeCtx.fillStyle = styles.background;
			compositeCtx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);
		}

		const foregroundCanvas = processedForegroundImg.getCanvas();

		compositeCtx.filter = 'blur(1px)';
		compositeCtx.drawImage(foregroundCanvas, 0, 0);
		compositeCtx.filter = 'none';

		if (scribbledText) {
			const scribbleSvg = scribble.querySelector('svg')! as SVGSVGElement;
			const svgXml = new XMLSerializer().serializeToString(scribbleSvg);
			const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgXml)}`;

			const scribbleOverlay = new window.Image();
			await new Promise((resolve, reject) => {
				scribbleOverlay.onload = resolve;
				scribbleOverlay.onerror = reject;
				scribbleOverlay.src = svgDataUrl;
			});

			const drawWidth = foregroundCanvas.width;
			const aspectRatio = scribbleSvg.viewBox.baseVal.width / scribbleSvg.viewBox.baseVal.height;
			const drawHeight = drawWidth / aspectRatio;
			const drawY = (foregroundCanvas.height - drawHeight) / 2;

			compositeCtx.drawImage(scribbleOverlay, 0, drawY, drawWidth, drawHeight);
		}

		return Image.fromCanvas(compositeCanvas);
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

	function onImageUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			// Switch to custom for better control of color
			colorPreset = 'custom';

			bgImage = input.files[0];
		} else {
			bgImage = null;
		}
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
	<div class="background" class:dimmed={!!bgImage} style={cssVariables}></div>
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
			disabled={colorPreset !== 'custom' || !!bgImage}
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
	<div>
		<label for="opacity">text fade</label>
		<input type="range" id="opacity" min="0" max="1" step="0.01" bind:value={styles.opacity} />
		<input
			type="number"
			aria-labelledby="opacity"
			min="0"
			max="1"
			step="0.01"
			bind:value={styles.opacity}
		/>
	</div>
	<div>
		<label for="image">background image</label>
		<input
			type="file"
			id="image"
			accept="image/*"
			on:change={onImageUpload}
			bind:this={imageInput}
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
	.background {
		background: var(--background);
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1;

		&.dimmed {
			filter: brightness(0.8);
		}
	}
	.album-art {
		color: var(--foreground);
		opacity: var(--opacity);
		width: 24rem;
		height: 24rem;
		text-align: justify;
		backface-visibility: hidden;
		filter: blur(1.5px);
		position: relative;
		z-index: 2;
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
		flex-wrap: wrap;
		flex-direction: row;
		gap: 1rem;
		margin: 2rem;

		label[for='opacity'] {
			color: #000000cc;
		}
	}
	.settings div {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.export button {
		font-size: 1.5rem;
	}

	input[type='range'] {
		accent-color: black;
	}

	@media (max-width: 768px) {
		.settings {
			display: flex;
			flex-direction: column;
			margin: 2rem 0;
		}
		.settings div {
			justify-content: space-between;
		}
	}
</style>
