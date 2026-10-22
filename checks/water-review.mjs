import assert from 'node:assert/strict';
import {waterPeriod} from '../src/water-review.ts';
import {normalizeTrip} from '../src/water-trip.ts';
const days=['2026-09-30','2026-10-01','2026-10-18','2026-10-19','2026-10-25','2026-10-26','2026-10-31','2026-11-01'],trip=normalizeTrip({version:1,settledDays:[],drinks:days.map((day,i)=>({id:String(i),day,at:day+'T12:00:00Z',ml:100})),ticketScenes:{'2026-10-19':3,'bad':2,'2026-10-20':999}});
const week=waterPeriod(trip,'2026-10-22','week');assert.equal(week.start,'2026-10-19');assert.equal(week.end,'2026-10-25');assert.equal(week.ml,200);assert.equal(week.daily.length,7);
const month=waterPeriod(trip,'2026-10-22','month');assert.equal(month.ml,600);assert.equal(month.daily.length,31);assert.equal(waterPeriod(trip,'2026-10-19','day').ml,100);
assert.equal(waterPeriod(trip,'2024-02-14','month').daily.length,29);assert.equal(waterPeriod(trip,'2026-01-01','week').start,'2025-12-29');
assert.deepEqual(trip.ticketScenes,{'2026-10-19':3});assert.deepEqual(normalizeTrip(JSON.parse(JSON.stringify(trip))).ticketScenes,trip.ticketScenes);
console.log('PASS: Monday-based weeks, month/year/leap boundaries, zero-filled days, totals and saved ticket scenery validation.');
