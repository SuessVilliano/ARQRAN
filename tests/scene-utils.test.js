import test from 'node:test'
import assert from 'node:assert/strict'
import {slugify,isPublicHttps,validateAdd,buildSceneUrl,haversineMeters,withinGeofence,bearingDegrees,cardinal,MAX_FILES} from '../src/scene-utils.js'

test('slugify normalizes titles',()=>assert.equal(slugify('My Siren Head!'),'my-siren-head'))
test('public HTTPS rejects localhost',()=>{assert.equal(isPublicHttps('https://example.com'),true);assert.equal(isPublicHttps('http://example.com'),false);assert.equal(isPublicHttps('https://localhost:5173'),false)})
test('asset limit rejects overflow',()=>assert.equal(validateAdd(MAX_FILES,0,[{size:1}]).ok,false))
test('scene URL is stable and slug based',()=>{const u=new URL(buildSceneUrl('https://arqran.liv8.co',{title:'Demo',slug:'demo'}));assert.equal(u.origin,'https://arqran.liv8.co');assert.equal(u.pathname,'/x/demo');assert.equal(u.search,'')})
test('haversine/geofence works',()=>{const a={lat:28,lng:-82},b={lat:28.0001,lng:-82};assert.ok(haversineMeters(a,b)>10);assert.equal(withinGeofence(a,b,20),true);assert.equal(withinGeofence(a,b,5),false)})
test('bearing/cardinal helpers work',()=>{const b=bearingDegrees({lat:0,lng:0},{lat:1,lng:0});assert.ok(b<1||b>359);assert.equal(cardinal(b),'N')})
