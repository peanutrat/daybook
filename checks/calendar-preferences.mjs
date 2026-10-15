import assert from 'node:assert/strict';
import {calendarLayout,isWeekend,weekendColor} from '../src/calendar-preferences.js';
for(let y=2024;y<=2032;y++)for(let m=0;m<12;m++)for(const start of [0,1]){const l=calendarLayout(y,m,start);assert.equal(l.cells%7,0);assert(l.cells>=l.first+l.count);assert.equal(l.weekdays[l.first],new Date(y,m,1).getDay());assert.equal(l.weekdays[0],start)}
assert.deepEqual(calendarLayout(2026,9).weekdays,[1,2,3,4,5,6,0]);assert.equal(weekendColor(false,'#ff0000','#123456'),undefined);assert.equal(weekendColor(true,'#bb5566','#123456'),'#bb5566');assert.equal(weekendColor(true,'bad','#123456'),'#123456');assert(isWeekend(0)&&isWeekend(6)&&!isWeekend(1));console.log('PASS: calendar ordering and weekend colors');
