/// <reference types="vite/client" />

declare module '*.mp4' {
	const src: string;
	export default src;
}

declare module '*.png' {
	const src: string;
	export default src;
}

interface ImportMetaEnv {
	readonly VITE_API_URL: string;
	readonly VITE_WEBSOCKET_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
