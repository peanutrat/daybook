import assert from 'node:assert/strict';
import {baseThemes,cleanColors,themeVars} from '../src/themes.ts';
import {colorContrast} from '../src/task-colors.ts';
assert.deepEqual(cleanColors(undefined),baseThemes.sage);
assert.equal(cleanColors({accent:'url(unsafe)',paper:'#abc'}).accent,baseThemes.sage.accent);
for(const input of [...Object.values(baseThemes),{page:'#000000',paper:'#ffffff',ink:'#ffffff',accent:'#ff0000',soft:'#000000',notice:'#000000'}])for(const night of [false,true]){const v=themeVars(input,night);for(const key of ['page','paper','soft','notice'])assert(colorContrast(v['--ink'],v['--'+key])>=4.5,key);assert(/^#[\da-f]{6}$/.test(v['--accent']));if(night)assert.notEqual(v['--paper'],input.paper)}
const saved={id:'my-theme',name:'奶油森林',colors:baseThemes.sand};const backup=JSON.parse(JSON.stringify({version:1,data:{customThemes:[saved],theme:saved.id}}));assert.deepEqual(backup.data.customThemes[0],saved);assert.notDeepEqual(themeVars(baseThemes.rose,false),themeVars(baseThemes.blue,false));
console.log('PASS: custom theme validation, day/night contrast, theme switching and JSON round-trip');
