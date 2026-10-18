import fs from 'node:fs';
// The plain-JS timer shares the same dictionary and locale rules as React.
export function prepareLocales(){
 const catalog=JSON.parse(fs.readFileSync(new URL('../src/locales/en.json',import.meta.url),'utf8'));
 const root=new URL('../public/mushrooms/',import.meta.url);
 fs.writeFileSync(new URL('locale-en.js',root),'export default '+JSON.stringify(catalog)+';\n');
 fs.copyFileSync(new URL('../src/i18n-core.js',import.meta.url),new URL('i18n-core.js',root));
 const html=fs.readFileSync(new URL('index.html',root),'utf8');
 const translate=text=>catalog[text]??text;
 const en=html.replace('lang="zh-Hant"','lang="en"')
  .replace(/>([^<>]+)</g,(match,text)=>'>'+text.replace(text.trim(),translate(text.trim()))+'<')
  .replace(/((?:alt|title|placeholder|aria-label|content)=)"([^"]*)"/g,(_,attr,text)=>attr+'"'+translate(text).replaceAll('"','&quot;')+'"')
  .replaceAll('assets/receipt-day.png','assets/receipt-day-en.png');
 fs.writeFileSync(new URL('index-en.html',root),en);
}
if(process.argv[1]&&new URL('file://'+process.argv[1]).href===import.meta.url)prepareLocales();
