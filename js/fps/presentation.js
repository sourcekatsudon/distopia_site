import * as THREE from '../../vendor/three.module.js';

// Linear HDR capture, quarter-resolution separable bloom, then one tone-map/output conversion.
export function createPresentation(renderer,{quality='high'}={}){
 if(!renderer.capabilities.isWebGL2||!renderer.extensions.has('EXT_color_buffer_float'))return {render:(scene,camera,state={})=>state.draw?state.draw(scene,camera):renderer.render(scene,camera),resize(){},setQuality(){},dispose(){},stats:()=>({mode:'direct'}),mode:'direct'};
 const gl=renderer.getContext(),sampleOptions=Array.from(gl.getInternalformatParameter(gl.RENDERBUFFER,gl.RGBA16F,gl.SAMPLES)||[]),safeSamples=sampleOptions.filter(n=>n>1&&n<=2).sort((a,b)=>b-a)[0]||0;
 const size=new THREE.Vector2();renderer.getDrawingBufferSize(size);
 const target=new THREE.WebGLRenderTarget(size.x,size.y,{type:THREE.HalfFloatType,depthBuffer:true});
 target.samples=quality==='high'?safeSamples:0;
 const a=new THREE.WebGLRenderTarget(Math.max(1,size.x>>2),Math.max(1,size.y>>2),{type:THREE.HalfFloatType,depthBuffer:false}),b=a.clone();
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1),geometry=new THREE.PlaneGeometry(2,2),quad=new THREE.Mesh(geometry);scene.add(quad);
 const vertexShader='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
 const bright=new THREE.ShaderMaterial({uniforms:{source:{value:target.texture}},vertexShader,fragmentShader:'varying vec2 vUv;uniform sampler2D source;void main(){vec3 c=texture2D(source,vUv).rgb;float peak=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c*smoothstep(.9,2.2,peak),1.);}',depthTest:false,depthWrite:false,toneMapped:false});
 const blur=new THREE.ShaderMaterial({uniforms:{source:{value:a.texture},stepSize:{value:new THREE.Vector2()}},vertexShader,fragmentShader:'varying vec2 vUv;uniform sampler2D source;uniform vec2 stepSize;void main(){vec3 c=texture2D(source,vUv).rgb*.227027;c+=(texture2D(source,vUv+stepSize*1.384615).rgb+texture2D(source,vUv-stepSize*1.384615).rgb)*.316216;c+=(texture2D(source,vUv+stepSize*3.230769).rgb+texture2D(source,vUv-stepSize*3.230769).rgb)*.070270;gl_FragColor=vec4(c,1.);}',depthTest:false,depthWrite:false,toneMapped:false});
 const composite=new THREE.ShaderMaterial({uniforms:{source:{value:target.texture},bloom:{value:a.texture},strength:{value:quality==='low'?.18:.32},time:{value:0},stress:{value:0}},vertexShader,fragmentShader:`varying vec2 vUv;uniform sampler2D source,bloom;uniform float strength,time,stress;

 void main(){vec3 c=texture2D(source,vUv).rgb;vec2 offset=(vUv-.5)*stress*.006;if(stress>.001){c.r=texture2D(source,vUv+offset).r;c.b=texture2D(source,vUv-offset).b;}c+=texture2D(bloom,vUv).rgb*strength;float vignette=smoothstep(.12,.85,distance(vUv,vec2(.5)));c*=1.-vignette*.12;gl_FragColor=vec4(c,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 float grain=fract(sin(dot(gl_FragCoord.xy+floor(time*24.),vec2(12.9898,78.233)))*43758.5453)-.5;gl_FragColor.rgb+=grain*.005;
 }`,depthTest:false,depthWrite:false});
 let elapsed=0,disposed=false;
 function render(world,view,state={}){elapsed=state.time??elapsed+.016;composite.uniforms.stress.value=state.stress||0;renderer.setRenderTarget(target);if(state.draw)state.draw(world,view);else renderer.render(world,view);quad.material=bright;renderer.setRenderTarget(a);renderer.render(scene,camera);quad.material=blur;blur.uniforms.source.value=a.texture;blur.uniforms.stepSize.value.set(1/a.width,0);renderer.setRenderTarget(b);renderer.render(scene,camera);blur.uniforms.source.value=b.texture;blur.uniforms.stepSize.value.set(0,1/a.height);renderer.setRenderTarget(a);renderer.render(scene,camera);quad.material=composite;composite.uniforms.time.value=elapsed;renderer.setRenderTarget(null);renderer.render(scene,camera);}
 function resize(){renderer.getDrawingBufferSize(size);target.setSize(size.x,size.y);a.setSize(Math.max(1,size.x>>2),Math.max(1,size.y>>2));b.setSize(a.width,a.height);}
 function dispose(){if(disposed)return;disposed=true;target.dispose();a.dispose();b.dispose();geometry.dispose();bright.dispose();blur.dispose();composite.dispose();}
 function setQuality(value){const samples=value==='high'?safeSamples:0;if(target.samples!==samples){target.samples=samples;target.dispose();}composite.uniforms.strength.value=value==='low'?.18:.32;resize();}
 return {render,resize,setQuality,dispose,stats:()=>({mode:'hdr-bloom',width:target.width,height:target.height,samples:target.samples,msaaSupported:safeSamples,bloomWidth:a.width,bloomHeight:a.height}),mode:'hdr-bloom'};
}
