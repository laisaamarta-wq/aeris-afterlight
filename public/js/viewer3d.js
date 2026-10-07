/* Floating-garment viewer. Loads any GLB/GLTF, normalises it, and presents it
   inside a glass orb with drag-to-rotate, zoom, colour tint and inspect hotspots. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const BV = `varying vec3 vN;varying vec3 vV;varying vec3 vW;
void main(){vec4 wp=modelMatrix*vec4(position,1.);vW=wp.xyz;vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-wp.xyz);gl_Position=projectionMatrix*viewMatrix*wp;}`;
const BF = `uniform float uTime;uniform float uOpacity;
varying vec3 vN;varying vec3 vV;varying vec3 vW;
void main(){vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;float f=1.-abs(dot(N,vV));float fr=pow(f,2.6);
vec3 R=reflect(-vV,N);float spec=pow(max(dot(R,normalize(vec3(-.45,.8,.6))),0.),90.)*1.1+pow(max(dot(R,normalize(vec3(.7,.15,.7))),0.),28.)*.2;
vec3 irid=.5+.5*cos(f*9.+uTime*.15+vW.y*.8+vec3(0.,2.1,4.2));
vec3 col=mix(vec3(1.),irid,.12)+spec;float a=(.022+fr*.34)*uOpacity+spec*uOpacity;gl_FragColor=vec4(col,clamp(a,0.,1.));}`;

export function createViewer({ canvas, host, glb, hotspots = [], yaw0 = 0, onReady, onError, onProgress, onTick }) {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  const D = 6.2; camera.position.set(0, 0.1, D);
  scene.add(new THREE.HemisphereLight(0xfff4ea, 0x8f8a86, 1.1));
  const key = new THREE.DirectionalLight(0xffe2cc, 2.2); key.position.set(3, 3, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xc9d3ea, 1.4); rim.position.set(-3, 2, -4); scene.add(rim);

  const stage = new THREE.Group(); scene.add(stage);
  const spin = new THREE.Group(); stage.add(spin);
  const bubbleMat = (op) => new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uOpacity: { value: op } }, vertexShader: BV, fragmentShader: BF, transparent: true, depthWrite: false, side: THREE.DoubleSide });
  const orb = new THREE.Mesh(new THREE.SphereGeometry(1.55, 96, 64), bubbleMat(0.8)); orb.renderOrder = 2; stage.add(orb);
  const bubbles = [[-1, .55, .5, .26], [1, .25, .6, .2], [-.9, -.5, .6, .14], [.85, -.62, .3, .22], [.3, 1, .4, .1], [1.05, .8, -.2, .09], [-1.1, -.05, -.3, .07]].map(([x, y, z, r], k) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), bubbleMat(1)); m.renderOrder = 3; m.scale.setScalar(r);
    m.userData = { dir: new THREE.Vector3(x, y, z).normalize(), d: 1.55 * (1 + (k % 3) * 0.04), ph: k * 1.7, sp: 0.05 + (k % 4) * 0.012 };
    stage.add(m); return m;
  });

  // DOM overlay for hotspots
  host.insertAdjacentHTML('beforeend', `<svg class="leader" aria-hidden="true"><line x1="0" y1="0" x2="0" y2="0"/></svg><div class="markers"></div>
    <div class="hs-panel glass" role="dialog" aria-live="polite"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span class="mono dim hs-k"></span><button class="circ sm hs-x" aria-label="Close detail"><svg class="i" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div><h4 class="hs-t"></h4><div class="mono hs-l"></div></div>`);
  const elMarkers = host.querySelector('.markers'), panel = host.querySelector('.hs-panel'), leader = host.querySelector('.leader line');
  elMarkers.innerHTML = hotspots.map((h, i) => `<button class="marker" data-i="${i}"><span class="m-dot"></span><span class="m-lbl mono">${h.label}</span></button>`).join('');
  const markerEls = [...elMarkers.children];

  const S = { yaw: yaw0 + 0.5, vel: 0, pitch: 0, tPitch: 0, zoom: 1, tZoom: 1, inspect: false, active: -1, face: null, visible: true, ready: false, t: 0, tint: null };
  const anchors = []; let fabricMats = []; let model = null;

  // load
  const loader = new GLTFLoader();
  loader.load(glb, (g) => {
    const wrap = new THREE.Group(); wrap.add(g.scene);
    g.scene.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = false;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => { if (m) { m.envMapIntensity = 0.7; fabricMats.push({ m, base: m.color ? m.color.clone() : null }); } });
      }
    });
    const box = new THREE.Box3().setFromObject(wrap), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
    g.scene.position.sub(c);
    const s = 2.3 / Math.max(size.y, size.x * 0.95);
    wrap.scale.setScalar(s);
    hotspots.forEach((h, i) => {
      const o = new THREE.Object3D();
      o.position.set(size.x * h.n[0], size.y * h.n[1], size.z * h.n[2]);
      wrap.add(o); anchors[i] = o;
    });
    model = wrap; spin.add(wrap); S.ready = true; onReady && onReady();
  }, (e) => onProgress && e.total && onProgress(e.loaded / e.total), (err) => onError && onError(err));

  // interaction
  const ptr = { down: false, id: null, x: 0, y: 0, sx: 0, sy: 0, lt: 0, vel: 0, moved: false };
  const pts = new Map(); let pinch = null;
  canvas.addEventListener('pointerdown', (e) => {
    pts.set(e.pointerId, e);
    if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), z: S.tZoom }; ptr.down = false; return; }
    Object.assign(ptr, { down: true, id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, lt: performance.now(), vel: 0, moved: false });
    S.face = null; canvas.setPointerCapture?.(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (pts.has(e.pointerId)) pts.set(e.pointerId, e);
    if (pinch && pts.size === 2) { const [a, b] = [...pts.values()]; setZoom(pinch.z * Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) / pinch.d); return; }
    if (!ptr.down || e.pointerId !== ptr.id) return;
    const dx = e.clientX - ptr.x, dy = e.clientY - ptr.y, now = performance.now(), dt = Math.max(8, now - ptr.lt);
    if (Math.hypot(e.clientX - ptr.sx, e.clientY - ptr.sy) > 6) ptr.moved = true;
    S.yaw += dx * 0.009; S.vel = 0; ptr.vel = ptr.vel * 0.5 + (dx * 0.009 / (dt / 1000)) * 0.5;
    S.tPitch = Math.max(-0.4, Math.min(0.5, S.tPitch + dy * 0.004));
    ptr.x = e.clientX; ptr.y = e.clientY; ptr.lt = now;
  });
  const up = (e) => {
    pts.delete(e.pointerId); if (pts.size < 2) pinch = null;
    if (!ptr.down || e.pointerId !== ptr.id) return; ptr.down = false;
    if (performance.now() - ptr.lt > 90) ptr.vel = 0;
    if (ptr.moved) S.vel = Math.max(-7, Math.min(7, ptr.vel));
    else if (!S.inspect) api.setInspect(true);
    else if (S.active >= 0) api.closeHotspot();
    else api.setInspect(false);
  };
  canvas.addEventListener('pointerup', up);
  // a cancelled pointer (e.g. the page took over for a vertical scroll) is never a tap
  canvas.addEventListener('pointercancel', (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (e.pointerId === ptr.id) ptr.down = false; });
  canvas.addEventListener('wheel', (e) => { if (!e.ctrlKey) return; e.preventDefault(); setZoom(S.tZoom * (1 - e.deltaY * 0.01)); }, { passive: false });
  markerEls.forEach((b) => b.addEventListener('click', () => api.openHotspot(+b.dataset.i)));
  panel.querySelector('.hs-x').addEventListener('click', () => api.closeHotspot());

  function setZoom(z) { S.tZoom = Math.max(0.75, Math.min(2.2, z)); }

  // sizing / visibility
  const resize = () => {
    const r = canvas.getBoundingClientRect(); if (!r.width) return;
    renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize); ro.observe(canvas); resize();
  const io = new IntersectionObserver(([en]) => { S.visible = en.isIntersecting; }, { threshold: 0.01 }); io.observe(canvas);

  const v = new THREE.Vector3(), cpos = new THREE.Vector3(), tmp = new THREE.Color(), white = new THREE.Color(1, 1, 1);
  let raf, last = performance.now();
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!S.visible || document.hidden) { last = now; return; }
    const dt = Math.min((now - last) / 1000, 0.05); last = now; S.t += dt;
    // fit: keep the garment the same apparent size regardless of aspect
    const vis = 2 * D * Math.tan(THREE.MathUtils.degToRad(15));
    // portrait stages (phones) fit the garment, not the orb, so the product stays large
    const fitS = camera.aspect < 0.9 ? Math.min(1.05, (vis * camera.aspect) / 2.25) : Math.min(1, (vis * camera.aspect) / 2.9) * 0.92;
    S.zoom += (S.tZoom - S.zoom) * (1 - Math.exp(-6 * dt));
    stage.scale.setScalar(fitS * S.zoom);
    if (!ptr.down) {
      if (S.face != null) { const d = ((S.face - S.yaw + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; S.yaw += d * (1 - Math.exp(-4 * dt)); S.vel = 0; if (Math.abs(d) < 0.002 && S.active < 0) S.face = null; }
      else { const auto = S.inspect ? 0 : RM ? 0.04 : 0.16; S.vel += (auto - S.vel) * (1 - Math.exp(-1.1 * dt)); S.yaw += S.vel * dt; }
    }
    S.pitch += (S.tPitch - S.pitch) * (1 - Math.exp(-5 * dt));
    spin.rotation.set(S.pitch, S.yaw, Math.sin(S.t * 0.45) * 0.02);
    spin.position.y = RM ? 0 : Math.sin(S.t * 0.7) * 0.05;
    orb.material.uniforms.uTime.value = S.t;
    orb.material.uniforms.uOpacity.value += ((S.inspect ? 0.12 : 0.8) - orb.material.uniforms.uOpacity.value) * (1 - Math.exp(-3 * dt));
    bubbles.forEach((b) => { const u = b.userData; v.copy(u.dir).applyAxisAngle(THREE.Object3D.DEFAULT_UP, S.t * u.sp + u.ph * 0.1).multiplyScalar(u.d); v.y += Math.sin(S.t * 0.6 + u.ph) * 0.05; b.position.copy(v); b.material.uniforms.uTime.value = S.t; b.material.uniforms.uOpacity.value = S.inspect ? 0.3 : 1; });
    if (S.tint) fabricMats.forEach((f) => { if (f.m.color && f.base) { tmp.copy(f.base).multiply(S.tint); f.m.color.lerp(tmp, 1 - Math.exp(-5 * dt)); } });
    else fabricMats.forEach((f) => { if (f.m.color && f.base) f.m.color.lerp(f.base, 1 - Math.exp(-5 * dt)); });
    renderer.render(scene, camera);
    if (S.inspect) projectMarkers();
    onTick && onTick({ yaw: S.yaw, zoom: S.zoom });
  }
  raf = requestAnimationFrame(frame);

  function projectMarkers() {
    const r = canvas.getBoundingClientRect(), hr = host.getBoundingClientRect(); spin.getWorldPosition(cpos);
    let act = null;
    markerEls.forEach((m, i) => {
      const a = anchors[i]; if (!a) { m.hidden = true; return; }
      a.getWorldPosition(v); const back = v.z - cpos.z < -0.05;
      v.project(camera); const x = (v.x * 0.5 + 0.5) * r.width + (r.left - hr.left), y = (-v.y * 0.5 + 0.5) * r.height + (r.top - hr.top);
      m.style.transform = `translate(${x}px,${y}px)`; m.classList.toggle('back', back);
      if (i === S.active) act = { x, y };
    });
    if (act) {
      const pw = panel.offsetWidth, ph = panel.offsetHeight, W = hr.width, H = hr.height, right = act.x < W * 0.55;
      let px = right ? act.x + 50 : act.x - 50 - pw; px = Math.max(12, Math.min(W - pw - 12, px));
      let py = Math.max(12, Math.min(H - ph - 12, act.y - ph / 2));
      if (W < 560) { px = Math.max(12, Math.min(W - pw - 12, act.x - pw / 2)); py = Math.max(12, act.y - ph - 36); }
      panel.style.transform = `translate(${px}px,${py}px)`;
      leader.setAttribute('x1', act.x); leader.setAttribute('y1', act.y);
      leader.setAttribute('x2', W < 560 ? act.x : right ? px : px + pw); leader.setAttribute('y2', W < 560 ? py + ph : py + ph / 2);
    }
  }

  const api = {
    setInspect(on) {
      S.inspect = on; host.classList.toggle('inspecting', on);
      if (!on) api.closeHotspot();
      host.dispatchEvent(new CustomEvent('inspect', { detail: on }));
    },
    openHotspot(i) {
      const h = hotspots[i]; if (!h) return; S.active = i;
      panel.querySelector('.hs-k').textContent = `${String(i + 1).padStart(2, '0')} / ${h.label}`;
      panel.querySelector('.hs-t').textContent = h.title;
      panel.querySelector('.hs-l').innerHTML = h.lines.map((l) => `<p>${l}</p>`).join('');
      markerEls.forEach((m, k) => m.classList.toggle('active', k === i));
      panel.classList.add('on'); leader.classList.add('on');
      const a = anchors[i]; if (a) { a.getWorldPosition(v); spin.worldToLocal(v); S.face = Math.atan2(-v.x, v.z) + 0.3; }
    },
    closeHotspot() { S.active = -1; S.face = null; panel.classList.remove('on'); leader.classList.remove('on'); markerEls.forEach((m) => m.classList.remove('active')); },
    setTint(hex) { S.tint = hex ? new THREE.Color(hex) : null; },
    zoomBy(f) { setZoom(S.tZoom * f); },
    reset() { setZoom(1); S.tPitch = 0; S.face = yaw0 + 0.5; api.closeHotspot(); S.face = yaw0 + 0.5; },
    rotate90() { S.face = S.yaw + Math.PI / 2; },
    dispose() { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); renderer.dispose(); },
  };
  return api;
}
