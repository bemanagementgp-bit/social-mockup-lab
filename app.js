/* Social Mockup Lab – fake chat / post / notification mockups.
 * One state object drives two renderers: a live HTML/CSS preview (.phone) and a canvas renderer for PNG export.
 * Vanilla JS, no build step. Depends on config.js, monetize.js, studio.js.
 */
(function () {
  'use strict';
  const C = window.APP_CONFIG || {}, S = window.Studio;
  const $ = id => document.getElementById(id);
  const FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
  const DW = 390, DH = 844, SB = 54, BEZEL = 14;
  const KEY = 'sml_state', SAVES_KEY = 'sml_saves';
  const TYPES = ['whatsapp', 'imessage', 'instagram', 'x', 'notify'];
  const LABELS = { whatsapp: 'WhatsApp chat', imessage: 'iMessage chat', instagram: 'Instagram post', x: 'X post', notify: 'Notifications' };
  const AV_COLORS = ['#f97316', '#0a84ff', '#34c759', '#af52de', '#ff2d55', '#5856d6', '#ff9500', '#00a884'];
  const GRADS = [['#f97316', '#ec4899'], ['#0ea5e9', '#6366f1'], ['#22c55e', '#06b6d4'], ['#8b5cf6', '#ec4899'], ['#f43f5e', '#f59e0b'], ['#334155', '#0f172a']];
  const GRAD_NAMES = ['Sunset', 'Ocean', 'Mint', 'Violet', 'Fire', 'Night'];
  const WA_WALLS = { light: '#efeae2', dark: '#0b141a' };
  const WA_SWATCHES = ['#efeae2', '#e5ddd5', '#dcf0f5', '#f0e6f6', '#e8f5e9', '#0b141a', '#111b21', '#1f2937'];

  // ---- icons: SVG path data shared by the DOM (inline <svg>) and the canvas (Path2D) ----
  const ICONS = {
    chevL: { d: 'M15 18l-6-6 6-6', sw: 2.4 },
    video: { d: 'M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z', f: 1 },
    videoO: { d: 'M23 7l-7 5 7 5V7zM3 5h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z' },
    phone: { d: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z', f: 1 },
    more: { d: 'M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z', f: 1 },
    moreH: { d: 'M6 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z', f: 1 },
    tick1: { d: 'M3 13l4 4L16 8', sw: 2.2 },
    tick2: { d: 'M2 13l4 4L15 8M10 17l1.5 1.5L22 8', sw: 2.2 },
    plus: { d: 'M12 5v14M5 12h14' },
    camera: { d: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
    mic: { d: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8' },
    heart: { d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' },
    comment: { d: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' },
    send: { d: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z' },
    bookmark: { d: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z' },
    repeat: { d: 'M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3' },
    chart: { d: 'M18 20V10M12 20V4M6 20v-6' },
    share: { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12' },
    home: { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10' },
    search: { d: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35' },
    plusSq: { d: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM12 8v8M8 12h8' },
    reels: { d: 'M4 3h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM2 8h20M7 3l3 5M13 3l3 5M10 12l5 3-5 3z' },
    lock: { d: 'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM7 11V7a5 5 0 0 1 10 0v4' },
    flash: { d: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
    smile: { d: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01' }
  };

  // ---- defaults ----
  const DEFAULTS = {
    whatsapp: {
      name: 'Sofia Reyes', status: 'online', avatar: null, dark: false, wallpaper: WA_WALLS.light, doodle: true, date: 'Today',
      messages: [
        { side: 'received', text: 'Hey! Did you see the brief for the campaign? 🚀', time: '10:21', ticks: 'read' },
        { side: 'sent', text: 'Yes!! Just finished the first mockups', time: '10:22', ticks: 'read' },
        { side: 'received', text: 'No way, already? Send them over 👀', time: '10:22', ticks: 'read' },
        { side: 'sent', text: 'Uploading now. Give me 2 min', time: '10:23', ticks: 'read' },
        { side: 'received', text: "You're a legend 🙌", time: '10:24', ticks: 'read' },
        { side: 'sent', text: 'Lunch later to go through feedback?', time: '10:24', ticks: 'delivered' }
      ]
    },
    imessage: {
      name: 'Mom', avatar: null, dark: false, style: 'imessage', delivered: true, date: 'Today 9:41',
      messages: [
        { side: 'received', text: 'Are you coming for dinner on Sunday?' },
        { side: 'sent', text: 'Of course! Should I bring dessert? 🍰' },
        { side: 'received', text: 'Yes please. Your brother is coming too' },
        { side: 'sent', text: 'Perfect, see you at 7' }
      ]
    },
    instagram: {
      username: 'wanderlust.ana', verified: true, avatar: null, image: null, gradient: 0, likes: 2481,
      caption: 'Golden hour in Lisbon never disappoints 🌅 Three days here and I already want to move. #lisbon #travelgram #goldenhour',
      comCount: 48, comments: [{ user: 'marco.travels', text: 'This light is unreal 😍' }, { user: 'julia_k', text: 'Take me with you next time!!' }],
      time: '2 hours ago', dark: false
    },
    x: {
      name: 'Lena Park', handle: '@lenabuilds', verified: true, avatar: null, image: null,
      text: 'Shipped the new onboarding flow today. 3 weeks of work, 40% fewer drop-offs in the first test. Small team, big wins 🚀 #buildinpublic',
      time: '10:24 AM · Oct 26, 2026', replies: 48, reposts: 212, likes: 1830, views: 96400, dark: false
    },
    notify: {
      clock: '9:41', date: 'Monday, October 26', gradient: 1,
      items: [
        { app: 'Messages', emoji: '💬', color: '#34c759', title: 'Sofia Reyes', body: 'Mockups look amazing! Can we call at 3?', time: 'now' },
        { app: 'Instagram', emoji: '📸', color: '#e1306c', title: 'Instagram', body: 'wanderlust.ana and 12 others liked your photo.', time: '5m ago' },
        { app: 'Calendar', emoji: '📅', color: '#ff3b30', title: 'Design review', body: 'In 15 minutes · Meeting room B', time: '9m ago' }
      ]
    }
  };

  // ---- palettes (exposed to CSS as --p-* custom properties and used directly by the canvas) ----
  const PAL = {
    whatsapp: {
      light: { head: '#f6f6f6', text: '#111b21', sub: '#667781', meta: '#667781', sent: '#d9fdd3', recv: '#ffffff', pill: 'rgba(255,255,255,.95)', pillText: '#54656f', input: '#ffffff', ph: '#8696a0', mic: '#00a884', line: 'rgba(0,0,0,.08)', sb: '#111b21', tick: '#8696a0', read: '#53bdeb', icon: '#54656f', dot: 'rgba(0,0,0,.09)', homeBar: '#111b21' },
      dark: { head: '#1f2c34', text: '#e9edef', sub: '#8696a0', meta: '#8696a0', sent: '#005c4b', recv: '#202c33', pill: '#182229', pillText: '#8696a0', input: '#2a3942', ph: '#8696a0', mic: '#00a884', line: 'rgba(255,255,255,.08)', sb: '#e9edef', tick: '#8696a0', read: '#53bdeb', icon: '#aebac1', dot: 'rgba(255,255,255,.07)', homeBar: '#e9edef' }
    },
    imessage: {
      light: { bg: '#ffffff', head: '#f6f6f6', text: '#000000', sub: '#8e8e93', recv: '#e9e9eb', recvText: '#000000', blue: '#0a84ff', green: '#34c759', line: 'rgba(0,0,0,.12)', inputBorder: '#c7c7cc', plusBg: '#e9e9eb', ph: '#8e8e93', sb: '#000000', homeBar: '#000000' },
      dark: { bg: '#000000', head: '#1c1c1e', text: '#ffffff', sub: '#8e8e93', recv: '#26252a', recvText: '#ffffff', blue: '#0a84ff', green: '#34c759', line: 'rgba(255,255,255,.14)', inputBorder: '#3a3a3c', plusBg: '#2c2c2e', ph: '#8e8e93', sb: '#ffffff', homeBar: '#ffffff' }
    },
    instagram: {
      light: { bg: '#ffffff', text: '#262626', sub: '#737373', line: '#dbdbdb', blue: '#0095f6', sb: '#000000', homeBar: '#000000' },
      dark: { bg: '#000000', text: '#f5f5f5', sub: '#a8a8a8', line: '#262626', blue: '#0095f6', sb: '#ffffff', homeBar: '#ffffff' }
    },
    x: {
      light: { bg: '#ffffff', text: '#0f1419', sub: '#536471', line: '#eff3f4', blue: '#1d9bf0', sb: '#000000', homeBar: '#000000' },
      dark: { bg: '#000000', text: '#e7e9ea', sub: '#71767b', line: '#2f3336', blue: '#1d9bf0', sb: '#ffffff', homeBar: '#ffffff' }
    },
    notify: {
      light: { text: '#ffffff', card: 'rgba(250,250,252,.84)', cardText: '#000000', cardSub: 'rgba(60,60,67,.6)', sb: '#ffffff', homeBar: '#ffffff' }
    }
  };
  function palette(t, d) {
    const p = Object.assign({}, PAL[t][d.dark ? 'dark' : 'light'] || PAL[t].light);
    if (t === 'whatsapp') p.wall = d.wallpaper || WA_WALLS.light;
    if (t === 'imessage') p.sentBg = d.style === 'sms' ? p.green : p.blue;
    if (t === 'notify') { const g = GRADS[d.gradient] || GRADS[0]; p.wall = `linear-gradient(160deg,${g[0]},${g[1]})`; }
    return p;
  }

  // ---- state ----
  const clone = o => JSON.parse(JSON.stringify(o));
  function loadState() {
    const saved = S.restore(KEY, {});
    const st = { type: TYPES.includes(saved.type) ? saved.type : 'whatsapp', frame: saved.frame !== false };
    TYPES.forEach(t => { st[t] = Object.assign({}, clone(DEFAULTS[t]), saved[t] || {}); });
    return st;
  }
  let state = loadState();
  const persist = S.debounce(() => S.persist(KEY, state), 250);
  const cur = () => state[state.type];

  // ---- small helpers ----
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (v, d) => { const n = Number(v); return isFinite(n) && n >= 0 ? n : (d || 0); };
  function fmtK(n) { n = num(n); if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'; if (n >= 1e4) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'; return n.toLocaleString('en-US'); }
  function initials(name) { const s = String(name || '').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase(); return s || '?'; }
  function nameColor(name) { let h = 0; for (const ch of String(name || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return AV_COLORS[h % AV_COLORS.length]; }
  function svgIcon(name, size, color, style) {
    const ic = ICONS[name];
    return `<svg class="ic${style ? ' abs' : ''}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${ic.f ? 'currentColor' : 'none'}" stroke="${ic.f ? 'none' : 'currentColor'}" stroke-width="${ic.sw || 2}" stroke-linecap="round" stroke-linejoin="round" style="color:${color}${style ? ';' + style : ''}" aria-hidden="true"><path d="${ic.d}"/></svg>`;
  }
  const icAt = (name, size, color, x, y) => svgIcon(name, size, color, `left:${x}px;top:${y}px`);
  function cIcon(ctx, name, x, y, size, color) {
    const ic = ICONS[name]; const p = ic.p || (ic.p = new Path2D(ic.d));
    ctx.save(); ctx.translate(x, y); ctx.scale(size / 24, size / 24);
    if (ic.f) { ctx.fillStyle = color; ctx.fill(p); } else { ctx.strokeStyle = color; ctx.lineWidth = ic.sw || 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(p); }
    ctx.restore();
  }
  function badgeSVG(size, color) {
    return `<svg class="badge-v" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="${color}"/><path d="M7 12.5l3 3 7-7" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  function cBadge(ctx, x, y, size, color) { // x,y top-left
    ctx.save(); ctx.translate(x, y); ctx.scale(size / 24, size / 24);
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(12, 12, 11, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(7, 12.5); ctx.lineTo(10, 15.5); ctx.lineTo(17, 8.5); ctx.stroke();
    ctx.restore();
  }
  function avatarHTML(name, src, size, style) {
    const abs = style ? ' abs' : '';
    if (src) return `<img class="av${abs}" src="${src}" width="${size}" height="${size}" alt="" style="width:${size}px;height:${size}px;${style || ''}">`;
    return `<span class="av${abs}" style="width:${size}px;height:${size}px;background:${nameColor(name)};font-size:${Math.round(size * 0.4)}px;${style || ''}">${esc(initials(name))}</span>`;
  }
  const IMG = {};
  function imgFor(src) { if (!src) return null; if (!IMG[src]) { const im = new Image(); im.src = src; IMG[src] = im; } return IMG[src]; }
  const loaded = im => !!(im && im.complete && im.naturalWidth);
  function ensureImages() {
    const srcs = [];
    TYPES.forEach(t => { srcs.push(state[t].avatar, state[t].image); });
    return Promise.all(srcs.filter(Boolean).map(s => { const im = imgFor(s); return loaded(im) ? null : new Promise(r => { im.addEventListener('load', r, { once: true }); im.addEventListener('error', r, { once: true }); }); }));
  }
  function cAvatar(ctx, name, src, cx, cy, r) {
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
    const im = src && IMG[src];
    if (loaded(im)) { const c = S.cover(im.naturalWidth, im.naturalHeight, r * 2, r * 2); ctx.drawImage(im, c.sx, c.sy, c.sw, c.sh, cx - r, cy - r, r * 2, r * 2); }
    else { ctx.fillStyle = nameColor(name); ctx.fillRect(cx - r, cy - r, r * 2, r * 2); ctx.fillStyle = '#fff'; setFont(ctx, 600, Math.round(r * 0.8)); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(initials(name), cx, cy + 1); }
    ctx.restore();
  }
  function cCover(ctx, im, x, y, w, h) { const c = S.cover(im.naturalWidth, im.naturalHeight, w, h); ctx.drawImage(im, c.sx, c.sy, c.sw, c.sh, x, y, w, h); }
  function setFont(ctx, weight, size) { ctx.font = `${weight} ${size}px ${FONT}`; }
  // word wrap that respects \n; firstW = width budget for the very first line (bold username prefix etc.)
  function wrap(ctx, text, maxW, firstW) {
    const out = [];
    String(text == null ? '' : text).split('\n').forEach(par => {
      const words = par.split(' '); let line = '';
      words.forEach(w => {
        const t = line ? line + ' ' + w : w;
        const lim = (out.length === 0 && firstW != null) ? firstW : maxW;
        if (ctx.measureText(t).width > lim && line) { out.push(line); line = w; } else line = t;
      });
      out.push(line);
    });
    return out;
  }
  function ellipsize(ctx, text, maxW) { let t = String(text); if (ctx.measureText(t).width <= maxW) return t; while (t.length && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1); return t.trimEnd() + '…'; }
  function cssGrad(ctx, W, H, angle, c1, c2) {
    const a = angle * Math.PI / 180, len = Math.abs(W * Math.sin(a)) + Math.abs(H * Math.cos(a));
    const dx = Math.sin(a) * len / 2, dy = -Math.cos(a) * len / 2;
    const g = ctx.createLinearGradient(W / 2 - dx, H / 2 - dy, W / 2 + dx, H / 2 + dy); g.addColorStop(0, c1); g.addColorStop(1, c2); return g;
  }
  const linkRe = /([@#][A-Za-z0-9_]+|https?:\/\/[^\s]+)/g;

  // ---- status bar (shared geometry) ----
  function statusIconsSVG(color) {
    const bars = [[0, 4], [5, 6], [10, 8.5], [15, 11]].map(([x, h]) => `<rect x="${x}" y="${12 - h}" width="3.5" height="${h}" rx="1"/>`).join('');
    const arc = r => { const k = r * Math.SQRT1_2; return `<path d="M${31 - k} ${12.5 - k}A${r} ${r} 0 0 1 ${31 + k} ${12.5 - k}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`; };
    return `<svg class="sb-icons" width="74" height="14" viewBox="0 0 74 14" fill="${color}" aria-hidden="true">${bars}${arc(5.2)}${arc(9)}<circle cx="31" cy="12.5" r="1.8"/><rect x="45.5" y="1.5" width="24" height="11.5" rx="3.5" fill="none" stroke="${color}" opacity=".4"/><rect x="70.5" y="5" width="1.5" height="4.5" rx="1" opacity=".4"/><rect x="47.5" y="3.5" width="20" height="7.5" rx="2"/></svg>`;
  }
  const statusHTML = (color, time) => `<div class="sb">${time ? `<span class="sb-time">${esc(time)}</span>` : ''}${statusIconsSVG(color)}</div>`;
  const homeHTML = () => '<div class="home"></div>';
  function drawStatus(ctx, color, time) {
    if (time) { setFont(ctx, 600, 17); ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(time, 34, 27); }
    ctx.save(); ctx.translate(DW - 28 - 74, 20); ctx.fillStyle = color;
    [[0, 4], [5, 6], [10, 8.5], [15, 11]].forEach(([x, h]) => { S.roundRect(ctx, x, 12 - h, 3.5, h, 1); ctx.fill(); });
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineCap = 'round';
    [5.2, 9].forEach(r => { ctx.beginPath(); ctx.arc(31, 12.5, r, -Math.PI * 3 / 4, -Math.PI / 4); ctx.stroke(); });
    ctx.beginPath(); ctx.arc(31, 12.5, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = .4; ctx.lineWidth = 1; S.roundRect(ctx, 45.5, 1.5, 24, 11.5, 3.5); ctx.stroke(); S.roundRect(ctx, 70.5, 5, 1.5, 4.5, 1); ctx.fill();
    ctx.globalAlpha = 1; S.roundRect(ctx, 47.5, 3.5, 20, 7.5, 2); ctx.fill();
    ctx.restore();
  }
  function drawHome(ctx, color) { ctx.fillStyle = color; S.roundRect(ctx, 128, DH - 13, 134, 5, 3); ctx.fill(); }

  // =====================================================================
  // DOM templates
  // =====================================================================
  const TPL = {};
  const WA_TAIL_S = '<svg class="wa-tail" width="14" height="9" viewBox="0 0 14 9" aria-hidden="true"><path d="M0 0H14L8 9Z" fill="currentColor"/></svg>';
  const WA_TAIL_R = '<svg class="wa-tail" width="14" height="9" viewBox="0 0 14 9" aria-hidden="true"><path d="M0 0H14L6 9Z" fill="currentColor"/></svg>';
  const IM_TAIL_S = '<svg class="im-tail" width="20" height="18" viewBox="0 0 20 18" aria-hidden="true"><path d="M14 0C14 10 16 15 20 18C13 18 9 16 5 12Z" fill="currentColor"/></svg>';
  const IM_TAIL_R = '<svg class="im-tail" width="20" height="18" viewBox="0 0 20 18" aria-hidden="true"><path d="M6 0C6 10 4 15 0 18C7 18 11 16 15 12Z" fill="currentColor"/></svg>';

  TPL.whatsapp = (d, p) => {
    let rows = '', prev = null;
    d.messages.forEach(m => {
      const sent = m.side === 'sent';
      const gap = prev === null ? (d.date ? 10 : 0) : (prev === m.side ? 2 : 10); prev = m.side;
      const ticks = sent ? `<span class="ticks${m.ticks === 'read' ? ' read' : ''}">${svgIcon(m.ticks === 'sent' ? 'tick1' : 'tick2', 16, 'currentColor')}</span>` : '';
      rows += `<div class="wa-row ${sent ? 'sent' : 'received'}" style="margin-top:${gap}px"><div class="wa-bubble">${sent ? WA_TAIL_S : WA_TAIL_R}<span class="wa-txt">${esc(m.text)}</span><span class="wa-meta">${esc(m.time)}${ticks}</span></div></div>`;
    });
    return statusHTML(p.sb, '9:41') +
      `<div class="wa-head">${icAt('chevL', 26, p.icon, 6, 17)}${avatarHTML(d.name, d.avatar, 38, 'left:36px;top:11px')}<div class="wa-name">${esc(d.name)}</div><div class="wa-sub">${esc(d.status)}</div>${icAt('video', 24, p.icon, DW - 112, 18)}${icAt('phone', 22, p.icon, DW - 74, 19)}${icAt('more', 24, p.icon, DW - 36, 18)}</div>` +
      `<div class="wa-body${d.doodle ? ' doodle' : ''}">${d.date ? `<div class="wa-pill">${esc(d.date)}</div>` : ''}${rows}</div>` +
      `<div class="wa-input"><div class="wa-field">${icAt('plus', 24, p.icon, 10, 9)}<span class="wa-ph">Message</span>${icAt('camera', 24, p.icon, DW - 72 - 34, 9)}</div><div class="wa-mic">${icAt('mic', 22, '#fff', 10, 10)}</div></div>` + homeHTML();
  };

  TPL.imessage = (d, p) => {
    let rows = '', prev = null; const n = d.messages.length;
    d.messages.forEach((m, i) => {
      const sent = m.side === 'sent';
      const gap = prev === null ? 0 : (prev === m.side ? 2 : 10); prev = m.side;
      const last = i === n - 1 || d.messages[i + 1].side !== m.side;
      rows += `<div class="im-row ${sent ? 'sent' : 'received'}" style="margin-top:${gap}px"><div class="im-bubble">${last ? (sent ? IM_TAIL_S : IM_TAIL_R) : ''}${esc(m.text)}</div></div>`;
    });
    const lastSent = n && d.messages[n - 1].side === 'sent';
    return statusHTML(p.sb, '9:41') +
      `<div class="im-head">${icAt('chevL', 28, p.blue, 8, 74)}${avatarHTML(d.name, d.avatar, 52, 'left:169px;top:62px')}<div class="im-name">${esc(d.name)} <small>›</small></div>${icAt('videoO', 26, p.blue, DW - 40, 75)}</div>` +
      `<div class="im-body">${d.date ? `<div class="im-label">${esc(d.date)}</div>` : ''}${rows}${d.delivered && lastSent ? '<div class="im-delivered">Delivered</div>' : ''}</div>` +
      `<div class="im-input"><div class="im-plus">${icAt('plus', 20, p.sub, 7, 7)}</div><div class="im-field"></div><span class="im-ph">${d.style === 'sms' ? 'Text Message' : 'iMessage'}</span>${icAt('mic', 22, p.blue, DW - 44, 19)}</div>` + homeHTML();
  };

  TPL.instagram = (d, p) => {
    const g = GRADS[d.gradient] || GRADS[0];
    const img = d.image ? `<img src="${d.image}" alt="">` : '';
    const cap = `<p class="ig-cap"><b>${esc(d.username)}</b> ${esc(d.caption)}</p>`;
    const coms = d.comments.map(c => `<p class="ig-com"><b>${esc(c.user)}</b> ${esc(c.text)}</p>`).join('');
    const viewAll = d.comCount > 0 ? `<p class="ig-viewall">View all ${num(d.comCount).toLocaleString('en-US')} comments</p>` : '';
    const tabs = ['home', 'search', 'plusSq', 'reels'].map((n, i) => icAt(n, 26, p.text, 39 + 78 * i - 13, 12)).join('') + avatarHTML(d.username, d.avatar, 26, `left:${39 + 78 * 4 - 13}px;top:12px`);
    return statusHTML(p.sb, '9:41') +
      `<div class="ig-top">${icAt('chevL', 26, p.text, 10, 9)}<div class="t1">${esc(d.username)}</div><div class="t2">Posts</div></div>` +
      `<div class="ig-post"><div class="ig-ph">${avatarHTML(d.username, d.avatar, 32, 'left:12px;top:12px')}<div class="ig-user">${esc(d.username)}${d.verified ? badgeSVG(14, p.blue) : ''}</div>${icAt('moreH', 24, p.text, DW - 36, 16)}</div>` +
      `<div class="ig-img" style="background:linear-gradient(135deg,${g[0]},${g[1]})">${img}</div>` +
      `<div class="ig-acts">${icAt('heart', 26, p.text, 12, 10)}${icAt('comment', 26, p.text, 50, 10)}${icAt('send', 26, p.text, 88, 10)}${icAt('bookmark', 26, p.text, DW - 38, 10)}</div>` +
      `<div class="ig-info"><p class="ig-likes">${num(d.likes).toLocaleString('en-US')} likes</p>${cap}${viewAll}${coms}<p class="ig-time">${esc(d.time)}</p></div></div>` +
      `<div class="ig-tabs">${tabs}</div>` + homeHTML();
  };

  function xImgH(d) { const im = imgFor(d.image); if (!loaded(im)) return 220; return Math.round(Math.max(180, Math.min(400, 358 * im.naturalHeight / im.naturalWidth))); }
  TPL.x = (d, p) => {
    const text = esc(d.text).replace(linkRe, '<span class="x-link">$1</span>');
    const img = d.image ? `<div class="x-img" style="height:${xImgH(d)}px"><img src="${d.image}" alt=""></div>` : '';
    const act = (n, v) => `<div class="x-act">${svgIcon(n, 20, p.sub)}${v != null ? `<span>${fmtK(v)}</span>` : ''}</div>`;
    return statusHTML(p.sb, '9:41') +
      `<div class="x-head">${icAt('chevL', 26, p.text, 10, 12)}<div class="t">Post</div></div>` +
      `<div class="x-post"><div class="x-author">${avatarHTML(d.name, d.avatar, 40, 'left:0;top:0')}<div class="x-name">${esc(d.name)}${d.verified ? badgeSVG(16, p.blue) : ''}</div><div class="x-handle">${esc(d.handle)}</div>${icAt('moreH', 22, p.sub, 358 - 22, 9)}</div>` +
      `<p class="x-text">${text}</p>${img}` +
      `<p class="x-time">${esc(d.time)} · <b>${fmtK(d.views)}</b> Views</p><div class="x-div"></div>` +
      `<div class="x-acts">${act('comment', d.replies)}${act('repeat', d.reposts)}${act('heart', d.likes)}${act('bookmark')}${act('share')}</div><div class="x-div2"></div></div>` + homeHTML();
  };

  TPL.notify = (d, p) => {
    const cards = d.items.slice(0, 4).map(it => `<div class="nt-card"><div class="nt-icon" style="background:${esc(it.color)}">${esc(it.emoji)}</div><div class="nt-row"><div class="nt-title">${esc(it.title)}</div><div class="nt-when">${esc(it.time)}</div></div><div class="nt-body">${esc(it.body)}</div></div>`).join('');
    return statusHTML(p.sb, '') + icAt('lock', 20, '#fff', 185, 66) +
      `<div class="nt-date">${esc(d.date)}</div><div class="nt-time">${esc(d.clock)}</div><div class="nt-list">${cards}</div>` +
      `<div class="nt-btn" style="left:31px">${icAt('flash', 22, '#fff', 14, 14)}</div><div class="nt-btn" style="right:31px">${icAt('camera', 22, '#fff', 14, 14)}</div>` + homeHTML();
  };

  // =====================================================================
  // Canvas renderers (same metrics as the CSS above)
  // =====================================================================
  const DRAW = {};
  const text = (ctx, s, x, y, color, align) => { ctx.fillStyle = color; ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); ctx.textAlign = 'left'; };

  DRAW.whatsapp = (ctx, d, p, o) => {
    const bodyTop = SB + 60, bodyBot = DH - 76;
    if (!o.transparent) { ctx.fillStyle = p.head; ctx.fillRect(0, 0, DW, DH); }
    ctx.fillStyle = p.line; ctx.fillRect(0, SB + 59, DW, 1);
    drawStatus(ctx, p.sb, '9:41');
    cIcon(ctx, 'chevL', 6, SB + 17, 26, p.icon);
    cAvatar(ctx, d.name, d.avatar, 55, SB + 30, 19);
    setFont(ctx, 600, 16); text(ctx, d.name, 84, SB + 22, p.text);
    setFont(ctx, 400, 12.5); text(ctx, d.status, 84, SB + 41, p.sub);
    cIcon(ctx, 'video', DW - 112, SB + 18, 24, p.icon); cIcon(ctx, 'phone', DW - 74, SB + 19, 22, p.icon); cIcon(ctx, 'more', DW - 36, SB + 18, 24, p.icon);
    // body
    ctx.save(); ctx.beginPath(); ctx.rect(0, bodyTop, DW, bodyBot - bodyTop); ctx.clip();
    if (!o.transparent) {
      ctx.fillStyle = p.wall; ctx.fillRect(0, bodyTop, DW, bodyBot - bodyTop);
      if (d.doodle) { ctx.fillStyle = p.dot; for (let y = bodyTop + 11; y < bodyBot; y += 22) for (let x = 11; x < DW; x += 22) { ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill(); } }
    }
    let y = bodyTop + 10;
    if (d.date) {
      setFont(ctx, 500, 12.5); const w = ctx.measureText(d.date).width + 24;
      ctx.fillStyle = p.pill; S.roundRect(ctx, (DW - w) / 2, y, w, 24, 8); ctx.fill();
      text(ctx, d.date, DW / 2, y + 12, p.pillText, 'center'); y += 24;
    }
    let prev = null;
    d.messages.forEach(m => {
      y += prev === null ? (d.date ? 10 : 0) : (prev === m.side ? 2 : 10); prev = m.side;
      const sent = m.side === 'sent';
      setFont(ctx, 400, 11); const metaW = ctx.measureText(m.time).width + (sent ? 19 : 0);
      setFont(ctx, 400, 15);
      const pars = String(m.text).split('\n'), pw = pars.map(s => ctx.measureText(s).width);
      const pref = Math.max(Math.max.apply(null, pw), pw[pw.length - 1] + 8 + metaW);
      const inner = Math.min(288, pref);
      const lines = wrap(ctx, m.text, inner);
      const lastW = ctx.measureText(lines[lines.length - 1]).width;
      const fits = lastW + 8 + metaW <= inner + 0.5;
      const w = inner + 16, h = lines.length * 20 + (fits ? 0 : 20) + 12;
      const x = sent ? DW - 12 - w : 12;
      ctx.fillStyle = sent ? p.sent : p.recv; S.roundRect(ctx, x, y, w, h, 8); ctx.fill();
      ctx.beginPath();
      if (sent) { ctx.moveTo(x + w - 8, y); ctx.lineTo(x + w + 6, y); ctx.lineTo(x + w, y + 9); } else { ctx.moveTo(x + 8, y); ctx.lineTo(x - 6, y); ctx.lineTo(x, y + 9); }
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = p.text; ctx.textBaseline = 'middle';
      lines.forEach((l, i) => ctx.fillText(l, x + 9, y + 6 + i * 20 + 10));
      setFont(ctx, 400, 11); const my = y + h - 6 - 7.5, mx = x + w - 7 - metaW;
      text(ctx, m.time, mx, my, p.meta);
      if (sent) cIcon(ctx, m.ticks === 'sent' ? 'tick1' : 'tick2', x + w - 7 - 16, my - 8, 16, m.ticks === 'read' ? p.read : p.tick);
      y += h;
    });
    ctx.restore();
    // input bar
    const it = DH - 76;
    if (!o.transparent) { ctx.fillStyle = p.head; ctx.fillRect(0, it, DW, 76); }
    ctx.fillStyle = p.input; S.roundRect(ctx, 12, it + 7, DW - 72, 42, 21); ctx.fill();
    cIcon(ctx, 'plus', 22, it + 16, 24, p.icon);
    setFont(ctx, 400, 16); text(ctx, 'Message', 54, it + 28, p.ph);
    cIcon(ctx, 'camera', 12 + DW - 72 - 34, it + 16, 24, p.icon);
    ctx.fillStyle = p.mic; ctx.beginPath(); ctx.arc(DW - 33, it + 28, 21, 0, Math.PI * 2); ctx.fill();
    cIcon(ctx, 'mic', DW - 44, it + 17, 22, '#fff');
    drawHome(ctx, p.homeBar);
  };

  function imTail(ctx, x, y, sent) { // x,y = top-left of the 20x18 box
    ctx.save(); ctx.translate(x, y); ctx.beginPath();
    if (sent) { ctx.moveTo(14, 0); ctx.bezierCurveTo(14, 10, 16, 15, 20, 18); ctx.bezierCurveTo(13, 18, 9, 16, 5, 12); }
    else { ctx.moveTo(6, 0); ctx.bezierCurveTo(6, 10, 4, 15, 0, 18); ctx.bezierCurveTo(7, 18, 11, 16, 15, 12); }
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  DRAW.imessage = (ctx, d, p, o) => {
    const bodyTop = SB + 92, bodyBot = DH - 80;
    if (!o.transparent) { ctx.fillStyle = p.bg; ctx.fillRect(0, 0, DW, DH); ctx.fillStyle = p.head; ctx.fillRect(0, 0, DW, bodyTop); }
    ctx.fillStyle = p.line; ctx.fillRect(0, bodyTop - 1, DW, 1);
    drawStatus(ctx, p.sb, '9:41');
    cIcon(ctx, 'chevL', 8, 74, 28, p.blue);
    cAvatar(ctx, d.name, d.avatar, 195, 88, 26);
    setFont(ctx, 400, 12); const nw = ctx.measureText(d.name + ' ›').width;
    text(ctx, d.name + ' ', 195 - nw / 2, 130, p.text); text(ctx, '›', 195 + nw / 2, 130, p.sub, 'right');
    cIcon(ctx, 'videoO', DW - 40, 75, 26, p.blue);
    ctx.save(); ctx.beginPath(); ctx.rect(0, bodyTop, DW, bodyBot - bodyTop); ctx.clip();
    let y = bodyTop + 8;
    if (d.date) { setFont(ctx, 400, 11); text(ctx, d.date, DW / 2, y + 7, p.sub, 'center'); y += 24; }
    let prev = null; const n = d.messages.length;
    setFont(ctx, 400, 17);
    d.messages.forEach((m, i) => {
      y += prev === null ? 0 : (prev === m.side ? 2 : 10); prev = m.side;
      const sent = m.side === 'sent';
      const pw = String(m.text).split('\n').map(s => ctx.measureText(s).width);
      const inner = Math.min(252, Math.max.apply(null, pw));
      const lines = wrap(ctx, m.text, inner);
      const w = inner + 28, h = lines.length * 22 + 16;
      const x = sent ? DW - 16 - w : 16;
      ctx.fillStyle = sent ? p.sentBg : p.recv; S.roundRect(ctx, x, y, w, h, 18); ctx.fill();
      const last = i === n - 1 || d.messages[i + 1].side !== m.side;
      if (last) imTail(ctx, sent ? x + w - 14 : x - 6, y + h - 18, sent);
      ctx.fillStyle = sent ? '#fff' : p.recvText; ctx.textBaseline = 'middle';
      lines.forEach((l, k) => ctx.fillText(l, x + 14, y + 8 + k * 22 + 11));
      y += h;
    });
    if (d.delivered && n && d.messages[n - 1].side === 'sent') { setFont(ctx, 400, 11); text(ctx, 'Delivered', DW - 20, y + 4 + 7, p.sub, 'right'); }
    ctx.restore();
    const it = DH - 80;
    if (!o.transparent) { ctx.fillStyle = p.bg; ctx.fillRect(0, it, DW, 80); }
    ctx.fillStyle = p.plusBg; ctx.beginPath(); ctx.arc(29, it + 30, 17, 0, Math.PI * 2); ctx.fill();
    cIcon(ctx, 'plus', 19, it + 20, 20, p.sub);
    ctx.strokeStyle = p.inputBorder; ctx.lineWidth = 1; S.roundRect(ctx, 56.5, it + 11.5, DW - 68 - 1, 38, 19); ctx.stroke();
    setFont(ctx, 400, 17); text(ctx, d.style === 'sms' ? 'Text Message' : 'iMessage', 72, it + 30, p.ph);
    cIcon(ctx, 'mic', DW - 44, it + 19, 22, p.blue);
    drawHome(ctx, p.homeBar);
  };

  DRAW.instagram = (ctx, d, p, o) => {
    if (!o.transparent) { ctx.fillStyle = p.bg; ctx.fillRect(0, 0, DW, DH); }
    drawStatus(ctx, p.sb, '9:41');
    cIcon(ctx, 'chevL', 10, SB + 9, 26, p.text);
    setFont(ctx, 600, 11); if ('letterSpacing' in ctx) ctx.letterSpacing = '0.3px';
    text(ctx, String(d.username).toUpperCase(), DW / 2, SB + 13, p.sub, 'center');
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    setFont(ctx, 700, 16); text(ctx, 'Posts', DW / 2, SB + 31, p.text, 'center');
    const y0 = SB + 44;
    ctx.save(); ctx.beginPath(); ctx.rect(0, y0, DW, DH - 70 - y0); ctx.clip();
    cAvatar(ctx, d.username, d.avatar, 28, y0 + 28, 16);
    setFont(ctx, 600, 14); const uw = ctx.measureText(d.username).width; text(ctx, d.username, 54, y0 + 28, p.text);
    if (d.verified) cBadge(ctx, 54 + uw + 4, y0 + 21, 14, p.blue);
    cIcon(ctx, 'moreH', DW - 36, y0 + 16, 24, p.text);
    const y1 = y0 + 56, im = imgFor(d.image);
    if (loaded(im)) cCover(ctx, im, 0, y1, DW, DW);
    else { const g = GRADS[d.gradient] || GRADS[0]; ctx.fillStyle = cssGradAt(ctx, 0, y1, DW, DW, 135, g[0], g[1]); ctx.fillRect(0, y1, DW, DW); }
    const y2 = y1 + DW;
    cIcon(ctx, 'heart', 12, y2 + 10, 26, p.text); cIcon(ctx, 'comment', 50, y2 + 10, 26, p.text); cIcon(ctx, 'send', 88, y2 + 10, 26, p.text); cIcon(ctx, 'bookmark', DW - 38, y2 + 10, 26, p.text);
    let y = y2 + 44;
    setFont(ctx, 600, 14); text(ctx, num(d.likes).toLocaleString('en-US') + ' likes', 14, y + 9, p.text); y += 18;
    // caption with bold username prefix
    const drawPrefixed = (user, body) => {
      setFont(ctx, 600, 14); const w1 = ctx.measureText(user).width; setFont(ctx, 400, 14); const sp = ctx.measureText(' ').width;
      const lines = wrap(ctx, body, 362, 362 - w1 - sp);
      setFont(ctx, 600, 14); text(ctx, user, 14, y + 9, p.text);
      setFont(ctx, 400, 14); lines.forEach((l, i) => text(ctx, l, i === 0 ? 14 + w1 + sp : 14, y + 9 + i * 18, p.text));
      y += lines.length * 18;
    };
    y += 4; drawPrefixed(d.username, d.caption);
    if (d.comCount > 0) { y += 6; setFont(ctx, 400, 14); text(ctx, 'View all ' + num(d.comCount).toLocaleString('en-US') + ' comments', 14, y + 9, p.sub); y += 18; }
    d.comments.forEach(c => { y += 4; drawPrefixed(c.user, c.text); });
    y += 8; setFont(ctx, 400, 12); text(ctx, d.time, 14, y + 8, p.sub);
    ctx.restore();
    const tt = DH - 70;
    if (!o.transparent) { ctx.fillStyle = p.bg; ctx.fillRect(0, tt, DW, 70); }
    ctx.fillStyle = p.line; ctx.fillRect(0, tt, DW, 1);
    ['home', 'search', 'plusSq', 'reels'].forEach((n, i) => cIcon(ctx, n, 39 + 78 * i - 13, tt + 12, 26, p.text));
    cAvatar(ctx, d.username, d.avatar, 39 + 78 * 4, tt + 25, 13);
    drawHome(ctx, p.homeBar);
  };
  function cssGradAt(ctx, x, y, w, h, angle, c1, c2) {
    const a = angle * Math.PI / 180, len = Math.abs(w * Math.sin(a)) + Math.abs(h * Math.cos(a));
    const dx = Math.sin(a) * len / 2, dy = -Math.cos(a) * len / 2, cx = x + w / 2, cy = y + h / 2;
    const g = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy); g.addColorStop(0, c1); g.addColorStop(1, c2); return g;
  }

  DRAW.x = (ctx, d, p, o) => {
    if (!o.transparent) { ctx.fillStyle = p.bg; ctx.fillRect(0, 0, DW, DH); }
    drawStatus(ctx, p.sb, '9:41');
    cIcon(ctx, 'chevL', 10, SB + 12, 26, p.text);
    setFont(ctx, 700, 17); text(ctx, 'Post', 52, SB + 25, p.text);
    const y0 = SB + 62, L = 16, W = 358;
    ctx.save(); ctx.beginPath(); ctx.rect(0, y0, DW, DH - 30 - y0); ctx.clip();
    cAvatar(ctx, d.name, d.avatar, L + 20, y0 + 20, 20);
    setFont(ctx, 700, 15); const nw = ctx.measureText(d.name).width; text(ctx, d.name, L + 52, y0 + 12, p.text);
    if (d.verified) cBadge(ctx, L + 52 + nw + 3, y0 + 4, 16, p.blue);
    setFont(ctx, 400, 15); text(ctx, d.handle, L + 52, y0 + 32, p.sub);
    cIcon(ctx, 'moreH', L + W - 22, y0 + 9, 22, p.sub);
    let y = y0 + 40 + 12;
    setFont(ctx, 400, 17); const lines = wrap(ctx, d.text, W);
    ctx.textBaseline = 'middle';
    lines.forEach((l, i) => {
      let x = L; const ly = y + i * 22 + 11;
      l.split(' ').forEach((word, k, arr) => {
        const m = word.match(/^([@#][A-Za-z0-9_]+|https?:\/\/[^\s]+)(.*)$/);
        if (m) { ctx.fillStyle = p.blue; ctx.fillText(m[1], x, ly); x += ctx.measureText(m[1]).width; if (m[2]) { ctx.fillStyle = p.text; ctx.fillText(m[2], x, ly); x += ctx.measureText(m[2]).width; } }
        else { ctx.fillStyle = p.text; ctx.fillText(word, x, ly); x += ctx.measureText(word).width; }
        if (k < arr.length - 1) x += ctx.measureText(' ').width;
      });
    });
    y += lines.length * 22;
    const im = imgFor(d.image);
    if (d.image) {
      const h = xImgH(d); y += 12;
      ctx.save(); S.roundRect(ctx, L, y, W, h, 16); ctx.clip();
      if (loaded(im)) cCover(ctx, im, L, y, W, h); else { ctx.fillStyle = p.line; ctx.fillRect(L, y, W, h); }
      ctx.restore(); ctx.strokeStyle = p.line; ctx.lineWidth = 1; S.roundRect(ctx, L + .5, y + .5, W - 1, h - 1, 16); ctx.stroke();
      y += h;
    }
    y += 14; setFont(ctx, 400, 15); let tx = L; const ty = y + 10;
    text(ctx, d.time + ' · ', tx, ty, p.sub); tx += ctx.measureText(d.time + ' · ').width;
    setFont(ctx, 700, 15); text(ctx, fmtK(d.views), tx, ty, p.text); tx += ctx.measureText(fmtK(d.views)).width;
    setFont(ctx, 400, 15); text(ctx, ' Views', tx, ty, p.sub);
    y += 20 + 12; ctx.fillStyle = p.line; ctx.fillRect(L, y, W, 1); y += 1 + 8;
    const acts = [['comment', d.replies], ['repeat', d.reposts], ['heart', d.likes], ['bookmark', null], ['share', null]];
    setFont(ctx, 400, 13);
    acts.forEach(([n, v], i) => {
      const cx = L + W / 5 * (i + .5), label = v != null ? fmtK(v) : '';
      const tw = label ? ctx.measureText(label).width : 0, total = 20 + (label ? 4 + tw : 0), sx = cx - total / 2;
      cIcon(ctx, n, sx, y + 12, 20, p.sub);
      if (label) text(ctx, label, sx + 24, y + 22, p.sub);
    });
    y += 44 + 8; ctx.fillStyle = p.line; ctx.fillRect(L, y, W, 1);
    ctx.restore();
    drawHome(ctx, p.homeBar);
  };

  DRAW.notify = (ctx, d, p, o) => {
    const g = GRADS[d.gradient] || GRADS[0];
    if (!o.transparent) { ctx.fillStyle = cssGrad(ctx, DW, DH, 160, g[0], g[1]); ctx.fillRect(0, 0, DW, DH); }
    drawStatus(ctx, p.sb, '');
    cIcon(ctx, 'lock', 185, 66, 20, '#fff');
    ctx.shadowColor = 'rgba(0,0,0,.18)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 1;
    setFont(ctx, 500, 22); text(ctx, d.date, DW / 2, 106, '#fff', 'center');
    setFont(ctx, 300, 92); if ('letterSpacing' in ctx) ctx.letterSpacing = '-2px';
    text(ctx, d.clock, DW / 2 - 1, 170, '#fff', 'center');
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    let y = 240; const cw = DW - 24;
    d.items.slice(0, 4).forEach(it => {
      setFont(ctx, 400, 13); const tw = ctx.measureText(it.time).width;
      setFont(ctx, 400, 15); let lines = wrap(ctx, it.body, cw - 74 - 12);
      if (lines.length > 2) { lines = lines.slice(0, 2); lines[1] = ellipsize(ctx, lines[1] + ' ' + '…', cw - 86); }
      const h = Math.max(62, 12 + 19 + lines.length * 19 + 12);
      ctx.fillStyle = p.card; S.roundRect(ctx, 12, y, cw, h, 22); ctx.fill();
      ctx.fillStyle = it.color; S.roundRect(ctx, 24, y + 12, 38, 38, 9); ctx.fill();
      setFont(ctx, 400, 20); text(ctx, it.emoji, 43, y + 32, '#fff', 'center');
      setFont(ctx, 600, 15); text(ctx, ellipsize(ctx, it.title, cw - 86 - tw - 8), 86, y + 12 + 9.5, p.cardText);
      setFont(ctx, 400, 13); text(ctx, it.time, 12 + cw - 12, y + 12 + 9.5, p.cardSub, 'right');
      setFont(ctx, 400, 15); lines.forEach((l, i) => text(ctx, l, 86, y + 12 + 19 + i * 19 + 9.5, p.cardText));
      y += h + 8;
    });
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    [56, DW - 56].forEach(cx => { ctx.beginPath(); ctx.arc(cx, 739, 25, 0, Math.PI * 2); ctx.fill(); });
    cIcon(ctx, 'flash', 45, 728, 22, '#fff'); cIcon(ctx, 'camera', DW - 67, 728, 22, '#fff');
    drawHome(ctx, p.homeBar);
  };

  function draw(ctx, W, H, o) {
    o = o || {};
    const t = state.type, d = state[t], p = palette(t, d);
    const b = (state.frame && !o.transparent) ? BEZEL : 0;
    ctx.save();
    if (b) { ctx.fillStyle = '#0c0c0c'; S.roundRect(ctx, 0, 0, W, H, 60); ctx.fill(); }
    ctx.translate(b, b);
    S.roundRect(ctx, 0, 0, DW, DH, b ? 46 : 0); ctx.clip();
    DRAW[t](ctx, d, p, o);
    if (b) { ctx.fillStyle = '#000'; S.roundRect(ctx, DW / 2 - 62, 11, 124, 36, 18); ctx.fill(); }
    ctx.restore();
  }

  // =====================================================================
  // Preview (DOM) + scaling
  // =====================================================================
  const phone = $('phone'), wrapEl = $('phoneWrap'), stage = $('stage');
  function fitScale() {
    const b = state.frame ? BEZEL : 0, W = DW + 2 * b, H = DH + 2 * b;
    const maxH = Math.min(window.innerHeight * 0.62, 640) - 32, maxW = stage.clientWidth - 32;
    const s = Math.max(0.2, Math.min(maxW / W, maxH / H, 1));
    wrapEl.style.width = (W * s) + 'px'; wrapEl.style.height = (H * s) + 'px'; phone.style.transform = 'scale(' + s + ')';
  }
  function renderDOM() {
    const t = state.type, d = state[t], p = palette(t, d);
    phone.className = 'phone ' + t + (state.frame ? ' framed' : '');
    for (const k in p) phone.style.setProperty('--p-' + k, p[k]);
    phone.innerHTML = TPL[t](d, p) + (state.frame ? '<div class="island"></div>' : '');
    fitScale(); checkOverflow(); updateDims();
  }
  // rAF for smooth live editing, with a short timeout fallback so background/hidden tabs still update
  function scheduler(fn) { let p = false; const run = () => { if (!p) return; p = false; fn(); }; return () => { if (p) return; p = true; requestAnimationFrame(run); setTimeout(run, 80); }; }
  const renderPreview = scheduler(renderDOM);
  function update() { renderPreview(); persist(); }
  function checkOverflow() {
    const sel = { whatsapp: '.wa-body', imessage: '.im-body', instagram: '.ig-post', x: '.x-post', notify: '.nt-list' }[state.type];
    const el = phone.querySelector(sel); let over = false;
    if (el) over = state.type === 'notify' ? (el.offsetTop + el.offsetHeight > 700) : (el.scrollHeight > el.clientHeight + 1);
    $('overflowHint').classList.toggle('hidden', !over);
  }
  function exportDims(o) { const b = (state.frame && !(o && o.transparent)) ? BEZEL : 0; return { w: DW + 2 * b, h: DH + 2 * b }; }
  function updateDims() {
    const { w, h } = exportDims(); const pro = isPro();
    $('dimsHint').textContent = `Export ${w * 2}×${h * 2} px` + (pro ? ' (up to 3x)' : '');
    $('wmHint').textContent = pro ? 'Pro: no watermark' : 'Free exports carry a small watermark';
  }

  // =====================================================================
  // Export
  // =====================================================================
  const fileName = (mult, o) => S.safeName('mockup-' + state.type) + (mult > 1 ? '-' + mult + 'x' : '') + (o && o.transparent ? '-transparent' : '');
  let busyN = 0;
  function busy(on) { busyN += on ? 1 : -1; document.querySelectorAll('.studio-actions .btn').forEach(b => b.disabled = busyN > 0); }
  async function renderCanvas(mult, o) {
    await ensureImages(); const { w, h } = exportDims(o);
    const c = document.createElement('canvas'); c.width = w * 2 * mult; c.height = h * 2 * mult;
    const ctx = c.getContext('2d'); ctx.scale(2 * mult, 2 * mult); draw(ctx, w, h, o || {}); return c;
  }
  async function download(mult, o) {
    o = o || {};
    if (mult > 1 && !S.gate(mult + 'x')) return;
    if (o.transparent && !S.gate('transparent')) return;
    busy(true);
    try {
      await ensureImages(); const { w, h } = exportDims(o);
      await S.exportPNG(ctx => draw(ctx, w, h, o), w, h, { scale: 2 * mult, name: fileName(mult, o) });
      track('generate', { type: state.type, scale: mult, transparent: !!o.transparent });
      toast('PNG downloaded' + (isPro() ? '' : ' · upgrade to remove the watermark'));
    } catch (e) { toast('Export failed. Try a smaller image.'); }
    finally { busy(false); }
  }
  async function copyImage() {
    busy(true);
    try { const c = await renderCanvas(1); S.watermark(c.getContext('2d'), c.width, c.height); await S.copyCanvas(c); }
    finally { busy(false); }
  }
  async function sequence() {
    if (!S.gate('sequence')) return;
    const t = state.type, d = state[t], key = (t === 'whatsapp' || t === 'imessage') ? 'messages' : t === 'notify' ? 'items' : null;
    if (!key) { toast('Sequence export works for chats and notification stacks'); return; }
    const all = d[key]; if (all.length < 2) { toast('Add at least 2 messages first'); return; }
    busy(true);
    try {
      const files = [];
      for (let i = 1; i <= all.length; i++) { d[key] = all.slice(0, i); const c = await renderCanvas(1); files.push({ name: `${t}-${String(i).padStart(2, '0')}.png`, blob: await S.toBlob(c) }); }
      d[key] = all;
      await S.zip(files, fileName(1) + '-sequence'); track('download_zip', { count: files.length });
      toast(`ZIP with ${files.length} frames downloaded`);
    } catch (e) { toast('Could not build the ZIP (network needed for JSZip)'); }
    finally { d[key] = all; busy(false); }
  }

  // =====================================================================
  // Forms
  // =====================================================================
  const FIELDS = [
    ['waName', 'whatsapp', 'name'], ['waStatus', 'whatsapp', 'status'], ['waDate', 'whatsapp', 'date'], ['waWall', 'whatsapp', 'wallpaper'], ['waDoodle', 'whatsapp', 'doodle', 'check'],
    ['imName', 'imessage', 'name'], ['imDate', 'imessage', 'date'], ['imDelivered', 'imessage', 'delivered', 'check'],
    ['igUser', 'instagram', 'username'], ['igVerified', 'instagram', 'verified', 'check'], ['igLikes', 'instagram', 'likes', 'num'], ['igCaption', 'instagram', 'caption'], ['igComCount', 'instagram', 'comCount', 'num'], ['igTime', 'instagram', 'time'],
    ['xName', 'x', 'name'], ['xHandle', 'x', 'handle'], ['xVerified', 'x', 'verified', 'check'], ['xText', 'x', 'text'], ['xTime', 'x', 'time'], ['xReplies', 'x', 'replies', 'num'], ['xReposts', 'x', 'reposts', 'num'], ['xLikes', 'x', 'likes', 'num'], ['xViews', 'x', 'views', 'num'],
    ['ntClock', 'notify', 'clock'], ['ntDate', 'notify', 'date']
  ];
  function bindFields() {
    FIELDS.forEach(([id, t, prop, kind]) => {
      const el = $(id);
      el.addEventListener(kind === 'check' ? 'change' : 'input', () => {
        state[t][prop] = kind === 'check' ? el.checked : kind === 'num' ? num(el.value) : el.value;
        update();
      });
    });
  }
  function fillFields() {
    FIELDS.forEach(([id, t, prop, kind]) => { const el = $(id); if (kind === 'check') el.checked = !!state[t][prop]; else el.value = state[t][prop] == null ? '' : state[t][prop]; });
    imStyleSeg.set(state.imessage.style);
    renderTiles('igGrads', state.instagram.gradient); renderTiles('ntGrads', state.notify.gradient);
    renderSwatches(); refreshUploaders();
    TYPES.forEach(renderList);
  }
  // --- lists (messages / comments / notification items) ---
  function msgEditorHTML(m, i, n, type) {
    const sent = m.side === 'sent', wa = type === 'whatsapp';
    const ticks = wa ? `<select class="msg-ticks" data-f="ticks" aria-label="Ticks"${sent ? '' : ' hidden'}><option value="sent"${m.ticks === 'sent' ? ' selected' : ''}>✓ sent</option><option value="delivered"${m.ticks === 'delivered' ? ' selected' : ''}>✓✓ delivered</option><option value="read"${m.ticks === 'read' ? ' selected' : ''}>✓✓ read</option></select>` : '';
    return `<div class="msg-ed" data-i="${i}"><div class="msg-ed-top">
      <div class="seg seg-mini" role="group" aria-label="Side"><button type="button" data-act="side" data-v="received" class="${sent ? '' : 'active'}">Received</button><button type="button" data-act="side" data-v="sent" class="${sent ? 'active' : ''}">Sent</button></div>
      ${wa ? `<input class="msg-time" data-f="time" value="${esc(m.time)}" aria-label="Time" placeholder="10:24" maxlength="8">` : ''}${ticks}
      <div class="msg-tools"><button type="button" class="tb" data-act="up" aria-label="Move up"${i === 0 ? ' disabled' : ''}>▲</button><button type="button" class="tb" data-act="down" aria-label="Move down"${i === n - 1 ? ' disabled' : ''}>▼</button><button type="button" class="tb danger" data-act="del" aria-label="Delete message">✕</button></div>
    </div><textarea class="msg-text" data-f="text" rows="2" aria-label="Message text">${esc(m.text)}</textarea></div>`;
  }
  const LISTS = {
    whatsapp: { id: 'waMsgs', key: 'messages', row: (m, i, n) => msgEditorHTML(m, i, n, 'whatsapp') },
    imessage: { id: 'imMsgs', key: 'messages', row: (m, i, n) => msgEditorHTML(m, i, n, 'imessage') },
    instagram: { id: 'igComs', key: 'comments', row: (c, i) => `<div class="msg-ed row-ed" data-i="${i}"><input data-f="user" value="${esc(c.user)}" placeholder="username" aria-label="Commenter" style="width:110px;flex:0 0 auto"><input data-f="text" value="${esc(c.text)}" placeholder="Comment" aria-label="Comment text" class="grow"><button type="button" class="tb danger" data-act="del" aria-label="Delete comment">✕</button></div>` },
    x: null,
    notify: { id: 'ntItems', key: 'items', row: (it, i, n) => `<div class="msg-ed" data-i="${i}"><div class="msg-ed-top"><input data-f="app" value="${esc(it.app)}" placeholder="App" aria-label="App name" class="grow"><input data-f="emoji" class="w-emoji" value="${esc(it.emoji)}" aria-label="Icon emoji" maxlength="3"><input type="color" data-f="color" value="${esc(it.color)}" aria-label="Icon color"><input data-f="time" class="msg-time" value="${esc(it.time)}" placeholder="now" aria-label="Time" maxlength="10"><div class="msg-tools"><button type="button" class="tb" data-act="up" aria-label="Move up"${i === 0 ? ' disabled' : ''}>▲</button><button type="button" class="tb" data-act="down" aria-label="Move down"${i === n - 1 ? ' disabled' : ''}>▼</button><button type="button" class="tb danger" data-act="del" aria-label="Delete notification">✕</button></div></div><input data-f="title" value="${esc(it.title)}" placeholder="Title" aria-label="Title"><textarea data-f="body" rows="2" class="mt" aria-label="Body">${esc(it.body)}</textarea></div>` }
  };
  function renderList(type) {
    const L = LISTS[type]; if (!L) return;
    const arr = state[type][L.key];
    $(L.id).innerHTML = arr.map((m, i) => L.row(m, i, arr.length)).join('') || '<p class="hint">Nothing here yet – add one below.</p>';
  }
  function wireLists() {
    TYPES.forEach(type => {
      const L = LISTS[type]; if (!L) return; const el = $(L.id);
      el.addEventListener('input', e => { const row = e.target.closest('[data-i]'), f = e.target.dataset.f; if (!row || !f || e.target.tagName === 'SELECT') return; state[type][L.key][+row.dataset.i][f] = e.target.value; update(); });
      el.addEventListener('change', e => { const row = e.target.closest('[data-i]'), f = e.target.dataset.f; if (!row || !f || e.target.tagName !== 'SELECT') return; state[type][L.key][+row.dataset.i][f] = e.target.value; update(); });
      el.addEventListener('click', e => {
        const btn = e.target.closest('button[data-act]'); if (!btn) return;
        const row = btn.closest('[data-i]'), i = +row.dataset.i, arr = state[type][L.key], act = btn.dataset.act;
        if (act === 'side') arr[i].side = btn.dataset.v;
        else if (act === 'up' && i > 0) { const t = arr[i - 1]; arr[i - 1] = arr[i]; arr[i] = t; }
        else if (act === 'down' && i < arr.length - 1) { const t = arr[i + 1]; arr[i + 1] = arr[i]; arr[i] = t; }
        else if (act === 'del') arr.splice(i, 1);
        else return;
        renderList(type); update();
      });
    });
    $('waAdd').addEventListener('click', () => { const a = state.whatsapp.messages; const last = a[a.length - 1]; a.push({ side: last && last.side === 'sent' ? 'received' : 'sent', text: 'New message', time: last ? last.time : '10:25', ticks: 'read' }); renderList('whatsapp'); update(); focusLast('waMsgs'); });
    $('imAdd').addEventListener('click', () => { const a = state.imessage.messages; const last = a[a.length - 1]; a.push({ side: last && last.side === 'sent' ? 'received' : 'sent', text: 'New message' }); renderList('imessage'); update(); focusLast('imMsgs'); });
    $('igComAdd').addEventListener('click', () => { const a = state.instagram.comments; if (a.length >= 3) { toast('Keep it to 3 comments so the post fits the screen'); return; } a.push({ user: 'friend_' + (a.length + 1), text: 'Love this!' }); renderList('instagram'); update(); });
    $('ntAdd').addEventListener('click', () => { const a = state.notify.items; if (a.length >= 4) { toast('Up to 4 notifications fit the lock screen'); return; } a.push({ app: 'Mail', emoji: '✉️', color: '#0a84ff', title: 'New email', body: 'Your weekly summary is ready.', time: 'now' }); renderList('notify'); update(); });
  }
  function focusLast(listId) { const tas = $(listId).querySelectorAll('textarea'); const ta = tas[tas.length - 1]; if (ta) { ta.focus(); ta.select(); } }
  // --- tiles & swatches ---
  function renderTiles(id, active) {
    $(id).innerHTML = GRADS.map((g, i) => `<button type="button" class="tile${i === active ? ' active' : ''}" data-i="${i}" aria-label="${GRAD_NAMES[i]} gradient"><span class="sw" style="background:linear-gradient(135deg,${g[0]},${g[1]})"></span><span>${GRAD_NAMES[i]}</span></button>`).join('');
  }
  function wireTiles(id, type) {
    $(id).addEventListener('click', e => { const b = e.target.closest('.tile'); if (!b) return; state[type].gradient = +b.dataset.i; renderTiles(id, state[type].gradient); update(); });
  }
  function renderSwatches() {
    $('waWallSw').innerHTML = WA_SWATCHES.map(c => `<button type="button" class="swatch${state.whatsapp.wallpaper === c ? ' active' : ''}" data-c="${c}" style="background:${c}" aria-label="Wallpaper ${c}"></button>`).join('');
  }
  // --- uploads (avatars, post images) ---
  function shrink(img, maxSide, q) {
    const w = img.width || img.naturalWidth, h = img.height || img.naturalHeight, r = Math.min(1, maxSide / Math.max(w, h));
    const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * r)); c.height = Math.max(1, Math.round(h * r));
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', q);
  }
  function uploader(btnId, clearId, type, prop, maxSide) {
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.hidden = true; document.body.appendChild(input);
    $(btnId).addEventListener('click', () => input.click());
    input.addEventListener('change', async () => {
      const f = input.files[0]; input.value = ''; if (!f) return;
      try {
        const img = await S.readImage(f); const src = shrink(img, maxSide, 0.85);
        state[type][prop] = src; imgFor(src).addEventListener('load', renderPreview, { once: true });
        refreshUploaders(); update(); track('upload', { type, prop });
      } catch (e) { toast('Could not read that image'); }
    });
    $(clearId).addEventListener('click', () => { state[type][prop] = null; refreshUploaders(); update(); });
  }
  function refreshUploaders() {
    $('waAvPrev').innerHTML = avatarHTML(state.whatsapp.name, state.whatsapp.avatar, 36);
    $('imAvPrev').innerHTML = avatarHTML(state.imessage.name, state.imessage.avatar, 36);
    $('igAvPrev').innerHTML = avatarHTML(state.instagram.username, state.instagram.avatar, 36);
    $('xAvPrev').innerHTML = avatarHTML(state.x.name, state.x.avatar, 36);
    $('igImgPrev').innerHTML = state.instagram.image ? `<img src="${state.instagram.image}" alt="">` : 'none';
    $('xImgPrev').innerHTML = state.x.image ? `<img src="${state.x.image}" alt="">` : 'none';
  }

  // =====================================================================
  // Saved mockups
  // =====================================================================
  function getSaves() { try { return JSON.parse(localStorage.getItem(SAVES_KEY) || '[]'); } catch (e) { return []; } }
  function renderSaves() {
    const saves = getSaves();
    $('saveList').innerHTML = saves.map(s => `<div class="save-item" data-id="${s.id}"><span class="nm">${esc(s.name)} <small>· ${LABELS[s.type] || s.type}</small></span><button type="button" class="btn btn-sm" data-act="load">Load</button><button type="button" class="tb danger" data-act="del" aria-label="Delete saved mockup">✕</button></div>`).join('');
    $('saveHint').textContent = isPro() ? `${saves.length} saved · unlimited with Pro` : `${saves.length}/1 free slot · Pro saves unlimited mockups`;
  }
  function saveMockup() {
    const saves = getSaves();
    if (!isPro() && saves.length >= 1) { openPro('saves'); return; }
    const name = $('saveName').value.trim() || `${LABELS[state.type]} ${new Date().toLocaleDateString()}`;
    saves.unshift({ id: Date.now(), name, type: state.type, data: clone(state[state.type]), at: Date.now() });
    try { localStorage.setItem(SAVES_KEY, JSON.stringify(saves)); } catch (e) { toast('Storage is full – remove an image or a saved mockup'); return; }
    $('saveName').value = ''; renderSaves(); track('save', { type: state.type }); toast('Mockup saved');
  }
  function wireSaves() {
    $('saveBtn').addEventListener('click', saveMockup);
    $('saveName').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); saveMockup(); } });
    $('saveList').addEventListener('click', e => {
      const btn = e.target.closest('button[data-act]'); if (!btn) return;
      const id = +btn.closest('[data-id]').dataset.id; let saves = getSaves(); const s = saves.find(x => x.id === id); if (!s) return;
      if (btn.dataset.act === 'load') { state.type = s.type; state[s.type] = Object.assign({}, clone(DEFAULTS[s.type]), s.data); setType(s.type); fillFields(); update(); toast('Loaded "' + s.name + '"'); }
      else { saves = saves.filter(x => x.id !== id); localStorage.setItem(SAVES_KEY, JSON.stringify(saves)); renderSaves(); }
    });
  }

  // =====================================================================
  // Type switching / appearance / init
  // =====================================================================
  let typeSeg, imStyleSeg;
  function setType(t) {
    state.type = t; typeSeg.set(t);
    document.querySelectorAll('.tform').forEach(f => f.classList.toggle('show', f.dataset.type === t));
    $('formTitle').textContent = LABELS[t];
    const hasDark = t !== 'notify'; $('darkRow').classList.toggle('hidden', !hasDark); $('darkSw').checked = hasDark && !!state[t].dark;
    $('seqBtn').classList.toggle('hidden', !(t === 'whatsapp' || t === 'imessage' || t === 'notify'));
  }
  function toggleDark(on) {
    const t = state.type, d = state[t]; if (t === 'notify') return; d.dark = on;
    if (t === 'whatsapp' && (d.wallpaper === WA_WALLS.light || d.wallpaper === WA_WALLS.dark)) { d.wallpaper = on ? WA_WALLS.dark : WA_WALLS.light; $('waWall').value = d.wallpaper; renderSwatches(); }
    update();
  }
  function resetCurrent() { const t = state.type; state[t] = clone(DEFAULTS[t]); fillFields(); setType(t); update(); toast('Reset to the sample ' + LABELS[t].toLowerCase()); }
  function refreshPro() { document.body.classList.toggle('is-pro', isPro()); renderSaves(); updateDims(); }

  function init() {
    const price = C.PRO_PRICE || '$9';
    const pp = $('proPrice'); if (pp) pp.textContent = price;
    document.querySelectorAll('[data-pro-price]').forEach(el => el.textContent = price);

    typeSeg = S.seg($('typeSeg'), v => { setType(v); update(); track('switch_type', { type: v }); });
    imStyleSeg = S.seg($('imStyle'), v => { state.imessage.style = v; update(); });
    $('darkSw').addEventListener('change', e => toggleDark(e.target.checked));
    $('frameSw').checked = state.frame;
    $('frameSw').addEventListener('change', e => { state.frame = e.target.checked; update(); });
    $('waWallSw').addEventListener('click', e => { const b = e.target.closest('.swatch'); if (!b) return; state.whatsapp.wallpaper = b.dataset.c; $('waWall').value = b.dataset.c; renderSwatches(); update(); });
    $('waWall').addEventListener('input', renderSwatches);
    wireTiles('igGrads', 'instagram'); wireTiles('ntGrads', 'notify');
    uploader('waAvBtn', 'waAvClear', 'whatsapp', 'avatar', 160);
    uploader('imAvBtn', 'imAvClear', 'imessage', 'avatar', 160);
    uploader('igAvBtn', 'igAvClear', 'instagram', 'avatar', 160);
    uploader('xAvBtn', 'xAvClear', 'x', 'avatar', 160);
    uploader('igImgBtn', 'igImgClear', 'instagram', 'image', 1000);
    uploader('xImgBtn', 'xImgClear', 'x', 'image', 1000);
    ['waName', 'imName', 'igUser', 'xName'].forEach(id => $(id).addEventListener('input', refreshUploaders));
    bindFields(); wireLists(); wireSaves();

    $('dlBtn').addEventListener('click', () => download(1));
    $('copyBtn').addEventListener('click', copyImage);
    $('x2Btn').addEventListener('click', () => download(2));
    $('x3Btn').addEventListener('click', () => download(3));
    $('transBtn').addEventListener('click', () => download(1, { transparent: true }));
    $('seqBtn').addEventListener('click', sequence);
    $('resetBtn').addEventListener('click', resetCurrent);
    document.addEventListener('pro:changed', refreshPro);
    window.addEventListener('resize', S.debounce(fitScale, 80));

    fillFields(); setType(state.type); refreshPro();
    ensureImages().then(renderPreview); renderDOM();
  }
  init();
})();
