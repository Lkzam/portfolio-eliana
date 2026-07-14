/* ============================================================
   Eliana Mazieiro — hero estilo "footer hero"
   Adaptado da técnica do template Loopstack (getlayers):
   - revelação da headline palavra por palavra
   - revelação do wordmark letra por letra
   - cursor customizado: anel instantâneo + plaquinha com lag (LERP)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- wordmark: divide em letras (revela da esquerda) ----------
  const logoText = document.querySelector(".hero-logo-text");
  if (logoText) {
    const text = logoText.textContent.trim();
    logoText.innerHTML = "";
    [...text].forEach((char, index) => {
      const wrapper = document.createElement("span");
      wrapper.className = "letter-wrapper";
      const inner = document.createElement("span");
      inner.textContent = char === " " ? " " : char;
      inner.className = "letter-inner";
      inner.style.animationDelay = `${index * 0.09}s`;
      wrapper.appendChild(inner);
      logoText.appendChild(wrapper);
    });
  }

  // ---------- headline: divide em palavras (revela de baixo) ----------
  const heroTitle = document.querySelector(".hero-title");
  if (heroTitle) {
    const parts = heroTitle.innerHTML.split(/(\s+|<br\s*\/?>)/i);
    heroTitle.innerHTML = "";
    let wordIndex = 0;
    parts.forEach((part) => {
      if (part.trim() === "" && !/<br/i.test(part)) {
        heroTitle.appendChild(document.createTextNode(" "));
      } else if (part.toLowerCase().startsWith("<br")) {
        heroTitle.appendChild(document.createElement("br"));
      } else {
        const wrapper = document.createElement("span");
        wrapper.className = "word-wrapper";
        const inner = document.createElement("span");
        inner.className = "word-inner";
        inner.textContent = part;
        inner.style.animationDelay = `${wordIndex * 0.1}s`;
        wordIndex++;
        wrapper.appendChild(inner);
        heroTitle.appendChild(wrapper);
      }
    });
  }

  // ---------- cursor customizado (anel) ----------
  const cursorRing = document.getElementById("cursor-ring");
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (cursorRing && fine) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let isFirstMove = true;
    let scale = 0, targetScale = 0;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (isFirstMove) {
        isFirstMove = false;
        cursorRing.classList.add("active");
      }
      targetScale = 1;
    });

    document.addEventListener("mouseleave", () => { targetScale = 0; });
    document.addEventListener("mouseenter", () => { targetScale = 1; });

    // expande o anel ao passar por botões/links
    document.querySelectorAll(".hero-btn, a, button").forEach((el) => {
      el.addEventListener("mouseenter", () => cursorRing.classList.add("expanded"));
      el.addEventListener("mouseleave", () => cursorRing.classList.remove("expanded"));
    });

    const updatePhysics = () => {
      scale += (targetScale - scale) * 0.15;
      const ringScale = cursorRing.classList.contains("expanded") ? 1.6 * scale : scale;
      cursorRing.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(${ringScale})`;
      requestAnimationFrame(updatePhysics);
    };
    updatePhysics();
  }

  // ---------- fallback do vídeo: se não carregar, mantém só o brilho ----------
  const video = document.getElementById("bg-video");
  if (video) {
    video.addEventListener("error", () => { video.style.display = "none"; });
    const src = video.querySelector("source");
    if (src) src.addEventListener("error", () => { video.style.display = "none"; });
  }

  // ---------- fundo Aurora (seção Sobre) ----------
  // Porte para WebGL2 nativo do componente Aurora (React Bits / ogl),
  // usando os mesmos shaders. Sem dependências externas.
  initAurora();
});

const AURORA_VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const AURORA_FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ),
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \
  int index = 0;                                            \
  for (int i = 0; i < 2; i++) {                               \
     ColorStop currentColor = colors[i];                    \
     bool isInBetween = currentColor.position <= factor;    \
     index = int(mix(float(index), float(i), float(isInBetween))); \
  }                                                         \
  ColorStop currentColor = colors[index];                   \
  ColorStop nextColor = colors[index + 1];                  \
  float range = nextColor.position - currentColor.position; \
  float lerpFactor = (factor - currentColor.position) / range; \
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);

  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);

  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;

  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);

  vec3 auroraColor = intensity * rampColor;

  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}
`;

function initAurora() {
  const canvas = document.getElementById("auroraCanvas");
  if (!canvas) return;
  const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: true });
  if (!gl) return; // sem WebGL2: seção fica só com o fundo escuro

  // props (mesmos do exemplo de uso do componente)
  const colorStops = ["#95595D", "#5D3757", "#272040"];
  const speed = 1.5, amplitude = 1.0, blend = 0.5;

  const hexToRGB = (hex) => {
    const n = parseInt(hex.replace("#", ""), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  };

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error("Aurora shader:", gl.getShaderInfoLog(s));
    }
    return s;
  };

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, AURORA_VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, AURORA_FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("Aurora program:", gl.getProgramInfoLog(prog));
    return;
  }
  gl.useProgram(prog);

  // triângulo que cobre a tela
  const posLoc = gl.getAttribLocation(prog, "position");
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, "uTime");
  const uAmp = gl.getUniformLocation(prog, "uAmplitude");
  const uStops = gl.getUniformLocation(prog, "uColorStops");
  const uRes = gl.getUniformLocation(prog, "uResolution");
  const uBlend = gl.getUniformLocation(prog, "uBlend");

  gl.uniform3fv(uStops, new Float32Array(colorStops.flatMap(hexToRGB)));
  gl.uniform1f(uAmp, amplitude);
  gl.uniform1f(uBlend, blend);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  function resize() {
    const w = canvas.clientWidth || canvas.offsetWidth;
    const h = canvas.clientHeight || canvas.offsetHeight;
    if (!w || !h) return;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
  }
  resize();
  let resizeTimer;
  window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });

  const draw = (uTimeValue) => {
    gl.uniform1f(uTime, uTimeValue);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  // loop à prova de falhas: nunca cancela o rAF, apenas pula o desenho
  // quando a seção está fora da tela (economia sem risco de congelar).
  let paused = false;
  const frame = (t) => {
    requestAnimationFrame(frame);
    if (paused) return;
    const time = t * 0.01;
    draw(time * speed * 0.1);
  };
  requestAnimationFrame(frame);

  const sec = document.getElementById("sobre");
  if ("IntersectionObserver" in window && sec) {
    new IntersectionObserver(
      (entries) => entries.forEach((e) => { paused = !e.isIntersecting; }),
      { threshold: 0 }
    ).observe(sec);
  }
}
