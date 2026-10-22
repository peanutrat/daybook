import {defineConfig} from "vite";
import {prepareLocales} from './scripts/prepare-locales.mjs';
export default defineConfig({base:"./",server:{allowedHosts:["terminal.local"]},esbuild:{jsx:"automatic"},plugins:[{name:'daybook-locales',buildStart:prepareLocales}]});
