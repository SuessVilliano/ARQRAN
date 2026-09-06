import test from 'node:test'
import assert from 'node:assert/strict'
import {slugify,isPublicHttps,validateAdd,buildSceneUrl,haversineMeters,withinGeofence,MAX_FILES} from '../src/scene-utils.js'

test('slugify normalizes titles',()=>assert.equal(slugify('My Siren Head!'),'my-siren-head'))
test('public HTTPS rejects localhost',()=>{assert.equal(isPublicHttps('https://example.com'),true);assert.equal(isPublicHttps('http://example.com'),false);assert.equal(isPublicHttps('https://localhost:5173'),false)})
test('asset limit rejects overflow',()=>assert.equal(validateAdd(MAX_FILES,0,[{size:1}]).ok,false))
test('scene URL carries AR settings and geofence',()=>{const u=new URL(buildSceneUrl('https://ar.example.com',{title:'Demo',slug:'demo',src:'https://cdn.example.com/a.glb',settings:{scale:2,yaw:30},trigger:{type:'geo',lat:28.1,lng:-82.3,radius:50},claimLimit:3}));assert.equal(u.searchParams.get('src'),'https://cdn.example.com/a.glb');assert.equal(u.searchParams.get('trigger'),'geo');assert.equal(u.searchParams.get('claims'),'3')})
test('haversine/geofence works',()=>{const a={lat:28,lng:-82},b={lat:28.0001,lng:-82};assert.ok(haversineMeters(a,b)>10);assert.equal(withinGeofence(a,b,20),true);assert.equal(withinGeofence(a,b,5),false)})
