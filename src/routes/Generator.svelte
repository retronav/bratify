<script lang="ts">
	import { onMount } from 'svelte';
	import textFit from 'textfit';
	import html2canvas from 'html2canvas';
	import { texts } from '$lib/texts';

	const styles = {
		background: '#8ace00',
		foreground: '#000000'
	};

	$: cssVariables = Object.entries(styles)
		.map(([k, v]) => `--${k}:${v};`)
		.join('');

	let text: string = '';

	let centeredText = false;

	let albumArt!: HTMLDivElement;

	function moveCursorToEnd(element: HTMLElement) {
		const sel = window.getSelection();
		if (sel) {
			sel.selectAllChildren(element);
			sel.collapseToEnd();
		}
	}

	function resizeText() {
		// Weird edge case where if center mode is selected and user removes all
		// existing text, the new entered text is not resized. Move it to
		// textFit's span so it'll handle that.
		for (const node of albumArt.childNodes) {
			if (node.nodeType === 3) {
				if (albumArt.querySelector('.textFitted')) {
					node.remove();
					albumArt.querySelector('.textFitted')!.textContent = node.textContent;
					moveCursorToEnd(albumArt);
				}
			}
		}

		const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

		textFit(albumArt, {
			maxFontSize: 6 * rem,
			multiLine: true
		});
	}

	async function exportArt() {
		const canvas = await html2canvas(albumArt);

		const blurredCanvas = document.createElement('canvas');
		blurredCanvas.width = canvas.width;
		blurredCanvas.height = canvas.height;
		const tempCtx = blurredCanvas.getContext('2d')!;
		tempCtx.filter = 'blur(1px) contrast(1.25)';
		tempCtx.drawImage(canvas, 0, 0);

		const image = blurredCanvas.toDataURL('image/png');
		const link = document.createElement('a');
		link.href = image;
		link.download = `${text}.png`;
		link.click();
	}

	onMount(() => {
		albumArt.focus();
		// Setting text is not triggering the resize thing
		albumArt.textContent = texts[Math.floor(Math.random() * texts.length)];
		resizeText();
		moveCursorToEnd(albumArt);
	});
</script>

<section class="shadow">
	<div
		contenteditable="plaintext-only"
		bind:textContent={text}
		on:input={resizeText}
		style={cssVariables}
		class="album-art"
		class:centered={centeredText}
		bind:this={albumArt}
	></div>
</section>

<section class="settings">
	<div>
		<label for="background">background</label>
		<input type="color" id="background" bind:value={styles.background} />
	</div>
	<div>
		<label for="foreground">text</label>
		<input type="color" id="foreground" bind:value={styles.foreground} />
	</div>
	<div>
		<label for="center">Center text but might not work well with long text</label>
		<input type="checkbox" id="center" bind:checked={centeredText} />
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
		filter: blur(1px) contrast(1.25);
	}
	.album-art.centered {
		display: flex;
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
