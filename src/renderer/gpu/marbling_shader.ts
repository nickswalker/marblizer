// WGSL port of backmap.ts. Each fragment (output pixel) is traced back through
// the operation list newest-first, undoing displacements, until it lands inside
// a deposited ink disc (which are perfect circles at time zero) or falls through
// to the base colour. Because nothing is ever resampled, edges stay perfectly
// sharp regardless of canvas resolution.
//
// Keep this in lock-step with backmap.ts (validated against the vector renderer)
// and the buffer layout in op_buffer.ts. An Op is four vec4<f32> = 64 bytes:
//   info  = [kind, flag, _, _]
//   p0    = [aX, aY, radius/lineX, alpha/lineY]
//   p1    = [lambda/numTines, spacing/amplitude, alpha/wavelength, phase]
//   color = [r, g, b, a]
export const MARBLING_WGSL = /* wgsl */ `
struct Op {
  info:  vec4<f32>,
  p0:    vec4<f32>,
  p1:    vec4<f32>,
  color: vec4<f32>,
};

struct Uniforms {
  resolution: vec2<f32>,
  count:      u32,
  _pad:       u32,
  baseColor:  vec4<f32>,
};

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read> ops: array<Op>;

const PI: f32 = 3.14159265358979;
const AA_EDGE_DELTA: f32 = 1.0 / 512.0;

// Inverse of the rotation field (Vortex / CircularLineTine). Rotation preserves
// distance to the centre, so the inverse is a rotation by the negated angle.
fn rotateInverse(p: vec2<f32>, op: Op, isCircular: bool) -> vec2<f32> {
  let c = op.p0.xy;
  let radius = op.p0.z;
  let alpha = op.p0.w;
  let lambda = op.p1.x;
  let cc = op.info.y > 0.5;
  let pl = p - c;
  let len = length(pl);
  // The centre is a fixed point; this also avoids the l/len singularity.
  if (len < 1e-6) { return p; }
  var d: f32;
  if (isCircular) { d = abs(len - radius); } else { d = abs(100.0 / radius * len); }
  let l = alpha * lambda / (d + lambda);
  var theta = select(l / len, -l / len, cc);
  theta = -theta;
  let cs = cos(theta);
  let sn = sin(theta);
  return c + vec2<f32>(pl.x * cs - pl.y * sn, pl.x * sn + pl.y * cs);
}

// Forward displacement of LineTine; its inverse is the negation of this.
fn lineTineOffset(p: vec2<f32>, op: Op) -> vec2<f32> {
  let o = op.p0.xy;
  let line = op.p0.zw;
  let numTines = op.p1.x;
  let spacing = op.p1.y;
  let alpha = op.p1.z;
  let lambda = op.p1.w;
  let nrm = vec2<f32>(-line.y, line.x);
  var dPerp = abs(dot(p - o, nrm));
  let halfSpace = spacing / 2.0;
  if (dPerp / spacing < numTines) {
    let t = dPerp - floor(dPerp / spacing) * spacing;
    dPerp = halfSpace - abs(t - halfSpace);
  } else {
    dPerp = dPerp - spacing * numTines;
  }
  let factor = alpha * lambda / (dPerp + lambda);
  return line * factor;
}

// Forward displacement of WavyLineTine; its inverse is the negation of this.
fn wavyOffset(p: vec2<f32>, op: Op) -> vec2<f32> {
  let angle = op.p1.x;
  let amplitude = op.p1.y;
  let wavelength = op.p1.z;
  let phase = op.p1.w;
  let sinT = sin(angle);
  let cosT = cos(angle);
  let v = p.x * sinT - p.y * cosT;
  let factor = amplitude * sin(2.0 * PI / wavelength * v + phase);
  return vec2<f32>(cosT, sinT) * factor;
}

@vertex
fn vs(@builtin(vertex_index) vi: u32) -> @builtin(position) vec4<f32> {
  // Single oversized triangle covering the viewport.
  var corners = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>( 3.0, -1.0),
    vec2<f32>(-1.0,  3.0),
  );
  return vec4<f32>(corners[vi], 0.0, 1.0);
}

fn colorAt(samplePoint: vec2<f32>) -> vec4<f32> {
  var p = samplePoint;
  let n = i32(u.count);
  for (var i = n - 1; i >= 0; i = i - 1) {
    let op = ops[i];
    let kind = op.info.x;
    if (kind < 0.5) {                 // InkDrop
      let c = op.p0.xy;
      let radius = op.p0.z;
      let dd = p - c;
      let dist2 = dot(dd, dd);
      if (dist2 <= radius * radius) {
        return vec4<f32>(op.color.rgb, 1.0);
      }
      if (op.info.y > 0.5) {          // displacing: inverse radial spread
        let rPrime = sqrt(dist2);
        let r = sqrt(max(0.0, dist2 - radius * radius));
        p = c + dd * (r / rPrime);
      }
    } else if (kind < 1.5) {          // Vortex
      p = rotateInverse(p, op, false);
    } else if (kind < 2.5) {          // CircularLineTine
      p = rotateInverse(p, op, true);
    } else if (kind < 3.5) {          // LineTine
      p = p - lineTineOffset(p, op);
    } else {                          // WavyLineTine
      p = p - wavyOffset(p, op);
    }
  }
  return vec4<f32>(u.baseColor.rgb, 1.0);
}

fn colorDelta(a: vec4<f32>, b: vec4<f32>) -> f32 {
  return max(max(abs(a.r - b.r), abs(a.g - b.g)), abs(a.b - b.b));
}

fn adaptiveSupersample(p: vec2<f32>) -> vec4<f32> {
  let center = colorAt(p);
  let x0 = colorAt(p + vec2<f32>(-0.5, 0.0));
  let x1 = colorAt(p + vec2<f32>( 0.5, 0.0));
  let y0 = colorAt(p + vec2<f32>(0.0, -0.5));
  let y1 = colorAt(p + vec2<f32>(0.0,  0.5));
  let edge = max(
    max(colorDelta(center, x0), colorDelta(center, x1)),
    max(colorDelta(center, y0), colorDelta(center, y1))
  );
  if (edge < AA_EDGE_DELTA) {
    return center;
  }

  let d0 = colorAt(p + vec2<f32>(-0.5, -0.5));
  let d1 = colorAt(p + vec2<f32>( 0.5, -0.5));
  let d2 = colorAt(p + vec2<f32>(-0.5,  0.5));
  let d3 = colorAt(p + vec2<f32>( 0.5,  0.5));
  return (center + x0 + x1 + y0 + y1 + d0 + d1 + d2 + d3) / 9.0;
}

@fragment
fn fs(@builtin(position) fragPos: vec4<f32>) -> @location(0) vec4<f32> {
  return adaptiveSupersample(fragPos.xy);
}
`;
