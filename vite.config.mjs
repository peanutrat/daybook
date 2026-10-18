import {defineConfig} from "vite";
import {prepareLocales} from './scripts/prepare-locales.mjs';
export default defineConfig({base:"./",esbuild:{jsx:"automatic"},plugins:[{name:'daybook-locales',buildStart:prepareLocales}]});
