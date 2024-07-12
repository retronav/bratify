export interface AlbumColor {
	name: string;
	background: string;
	foreground: string;
}

export const albumColors: Record<string, AlbumColor> = {
	bratdeluxe: { name: 'Brat deluxe', background: '#ffffff', foreground: '#000000' },
	brat: { name: 'BRAT', background: '#8ace00', foreground: '#000000' },
	crash: { name: 'CRASH', background: '#019bd9', foreground: '#f70000' },
	howimfeelingnow: { name: "how i'm feeling now", background: '#ffffff', foreground: '#c1c1c1' },
	charli: { name: 'Charli', background: '#918a84', foreground: '#000000' },
	pop2: { name: 'Pop 2', background: '#c9a1dd', foreground: '#000000' },
	number1angel: { name: 'Number 1 Angel', background: '#d20001', foreground: '#ff1000' },
	sucker: { name: 'SUCKER', background: '#f5abcc', foreground: '#ffffff' },
	trueromance: { name: 'True Romance', background: '#700150', foreground: '#ffffff' }
};
