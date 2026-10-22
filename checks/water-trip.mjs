import assert from 'node:assert/strict';
import {emptyTrip,recordDrink,normalizeTrip,tripSummary,routeAt,settleDay,settlePreviousDays,ticketForDay,localDate} from '../src/water-trip.ts';
let value=emptyTrip();
const date=new Date(2026,9,19,12,0,0),day=localDate(date);
value=recordDrink(value,250,date,'first');
assert.equal(tripSummary(value,day).km,25);assert.equal(tripSummary(value,day).times,1);
assert.equal(routeAt(0).country,'finland');assert.equal(routeAt(79.9).country,'finland');assert.equal(routeAt(80).country,'norway');assert.equal(routeAt(160).country,'germany');assert.equal(routeAt(240).country,'italy');assert.equal(routeAt(1040).country,'finland');assert.equal(routeAt(1040).lap,2);
assert.equal(routeAt(79.9).remaining,.1);assert.equal(routeAt(80).remaining,80);
assert.equal(recordDrink(value,250,date,'first'),value,'Repeated submission ID is ignored');
for(const ml of [0,-1,NaN,Infinity,5001,12.5])assert.throws(()=>recordDrink(value,ml,date,'invalid'));
assert.equal(settleDay(emptyTrip(),day).settledDays.length,0,'No empty daily ticket');
value=settleDay(value,day);assert.equal(settleDay(value,day),value,'Settlement is idempotent');
value=recordDrink(value,500,date,'second');assert.equal(value.settledDays.length,1);
let ticket=ticketForDay(value,day);assert.equal(ticket.km,75);assert.equal(ticket.ml,750);assert.equal(ticket.times,2);assert.equal(ticket.to.country,'finland');
const tomorrow=new Date(2026,9,20,0,1),nextDay=localDate(tomorrow);value=recordDrink(value,250,tomorrow,'next-day');
assert.equal(tripSummary(value,nextDay).km,25);assert.equal(tripSummary(value,nextDay).totalKm,100);assert.equal(tripSummary(value,nextDay).route.country,'norway');
ticket=ticketForDay(value,day);assert.equal(ticket.end,75,'Older tickets exclude later journeys');
const nextTicket=ticketForDay(value,nextDay);assert.equal(nextTicket.start,75);assert.equal(nextTicket.end,100);assert.equal(nextTicket.to.country,'norway');
let unclosed=emptyTrip();unclosed=recordDrink(unclosed,100,date,'past');unclosed=recordDrink(unclosed,200,tomorrow,'today');
const closed=settlePreviousDays(unclosed,nextDay);assert.deepEqual(closed.settledDays,[day]);assert.equal(settlePreviousDays(closed,nextDay),closed);
assert.deepEqual(normalizeTrip(JSON.parse(JSON.stringify(value))),value,'Backup round trip preserves progress');
const malformed=normalizeTrip({drinks:[...value.drinks,value.drinks[0],{id:'bad',day,at:'invalid',ml:1},{id:'bad2',day:'2026-02-30',at:date.toISOString(),ml:200}],settledDays:[day,day,'not-a-date']});
assert.equal(malformed.drinks.length,value.drinks.length);assert.deepEqual(malformed.settledDays,[day]);assert.deepEqual(normalizeTrip(null),emptyTrip());
const deleted={...value,drinks:value.drinks.filter(d=>d.id!=='second')};assert.equal(tripSummary(deleted,nextDay).totalKm,50);assert.equal(ticketForDay(deleted,day).km,25);
const beforeMidnight=new Date(2026,9,19,23,59),afterMidnight=new Date(2026,9,20,0,0);assert.notEqual(localDate(beforeMidnight),localDate(afterMidnight));
console.log('PASS: water-to-mileage conversion, country boundaries and loops, entry validation/deduplication, local-day rollover, idempotent settlement, updated daily tickets, historical totals, backup recovery and deletion correction.');

const custom={...value,cupMl:600,driverName:'Peanut'};assert.deepEqual(normalizeTrip(JSON.parse(JSON.stringify(custom))),custom);assert.equal(normalizeTrip({...custom,cupMl:-1}).cupMl,undefined);assert.equal(normalizeTrip({...custom,driverName:' x '.repeat(30)}).driverName.length,32);

const {defaultAvatar}=await import('../src/elf-avatar.ts');const appearance={...defaultAvatar,eyes:'eyes-3',ears:'ears-2',skin:'#79503d',hairColor:'#6b8380'};
const profile={...value,avatar:appearance,goalMl:1800,mode:'goal',cupPresets:[150,350,600]};
assert.deepEqual(normalizeTrip(JSON.parse(JSON.stringify(profile))),profile,'Appearance, target and cup presets survive full backup');
const invalid=normalizeTrip({...profile,avatar:{...appearance,hair:'unknown',skin:'url(x)',eyes:'invalid'},goalMl:-20,cupPresets:[-1,250,250,0,330,500,600]});
assert.equal(invalid.avatar.frontHair,'frontHair-1');assert.equal(invalid.avatar.eyes,'eyes-1');assert.equal(invalid.avatar.skin,'#fee6d6');assert.equal(invalid.goalMl,undefined);assert.deepEqual(invalid.cupPresets,[250,330,500,600]);
console.log('PASS: avatar whitelist and color validation, settings backup recovery, and extended preset validation.');

for(const carStyle of ['forest','cranberry','cream','navy'])assert.equal(normalizeTrip({...value,carStyle}).carStyle,carStyle);assert.equal(normalizeTrip({...value,carStyle:'invalid'}).carStyle,undefined);
