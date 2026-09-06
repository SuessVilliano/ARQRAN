import test from 'node:test'
import assert from 'node:assert/strict'
import {newObject,sanitizeScene} from '../src/scene-model.js'

test('new object includes transform and geo settings',()=>{const o=newObject('video');assert.equal(o.type,'video');assert.equal(o.scale.x,1);assert.equal(o.geo.enabled,false)})
test('scene sanitizer keeps multiple object types',()=>{const s=sanitizeScene({title:'Demo',slug:'demo',objects:[newObject('model',{src:'https://x.test/a.glb'}),newObject('video',{src:'https://x.test/a.mp4'})]});assert.equal(s.objects.length,2);assert.equal(s.objects[1].type,'video')})
test('scene sanitizer clamps invalid values',()=>{const o=newObject('text',{opacity:7,scale:{x:0,y:-1,z:2}});const s=sanitizeScene({objects:[o]});assert.equal(s.objects[0].opacity,1);assert.ok(s.objects[0].scale.x>=.01)})
