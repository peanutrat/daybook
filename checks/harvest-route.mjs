import assert from 'node:assert/strict';
import {normalizeTrip,countries} from '../src/water-trip.ts';
import {waterPeriod} from '../src/water-review.ts';
import {visitedDayScenes,routeReview} from '../src/harvest-route.ts';
const drink=(id,day,ml)=>({id,day,ml,at:day+'T12:00:00Z'});
const day='2026-10-22',trip=normalizeTrip({version:1,drinks:[drink('before','2026-10-21',700),drink('now',day,1000)],settledDays:[],ticketScenes:{[day]:10}}),before=JSON.stringify(trip);
assert.deepEqual(visitedDayScenes(trip,day),[0,1,2],'all crossed maps, not only the final map');
assert.deepEqual(visitedDayScenes(trip,'2026-10-23'),[],'no records cannot unlock scenery');
assert.deepEqual(visitedDayScenes(normalizeTrip({drinks:[drink('boundary',day,800)]}),day),[0,1],'arrival exactly on boundary unlocks arrival map');
const long=normalizeTrip({drinks:Array.from({length:5},(_,i)=>drink('long'+i,day,5000))});
assert.equal(visitedDayScenes(long,day).length,countries.length,'multiple laps deduplicate and remain bounded');
const stats=waterPeriod(trip,day,'week'),review=routeReview(stats,day);
assert.equal(review.ml,1700);assert.equal(review.km,170);assert.equal(review.restDays,2);assert.equal(review.points.filter(p=>p.kind==='planned').length,3);
assert.equal(review.points.find(p=>p.day==='2026-10-20').ml,0);assert.equal(review.points.find(p=>p.day==='2026-10-20').routeMl,700,'illustration bridges absent records without changing actual value');
assert.equal(review.points.reduce((n,d)=>n+d.ml,0),stats.ml);assert.equal(JSON.stringify(trip),before);
for(const period of ['day','week','month']){const zero=routeReview(waterPeriod(normalizeTrip(),day,period),day);assert.equal(zero.ml,0);assert(zero.max>0);assert(zero.points.every(p=>Number.isFinite(p.routeMl)));}
console.log('PASS: visited-only scenery, exact route boundaries and multiple laps; actual totals remain unchanged; rest/planned dates stay distinct; zero data and all period ranges.');
