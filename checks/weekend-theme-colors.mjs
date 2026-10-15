import assert from 'node:assert/strict';
import {weekendColor} from '../src/calendar-preferences.js';
import {baseThemes,themeVars} from '../src/themes.ts';
import {colorContrast} from '../src/task-colors.ts';
for(const theme of Object.values(baseThemes))for(const night of [false,true]){const v=themeVars(theme,night),accent=night?v['--accent']:theme.accent,bg=v['--soft'],c=weekendColor(true,undefined,accent,night,bg);assert.notEqual(c,accent);assert(colorContrast(c,bg)>=4.5,`${c} on ${bg}`);assert.equal(weekendColor(true,'#b75f66',accent,night,bg),'#b75f66');}
for(const background of ['#ffffff','#000000','#999999','#111177','#e8ede3'])for(const accent of ['#ffffff','#000000','#ffdd00','#dddddd','#abcdee']){const c=weekendColor(true,undefined,accent,false,background);assert(colorContrast(c,background)>=4.5,`${c} on ${background}`)}
assert.equal(weekendColor(false,undefined,'#6e886d'),undefined);
console.log('PASS: weekend theme hues are stronger, readable in day/night and custom colors stay unchanged.');
