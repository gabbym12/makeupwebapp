// Glam Empire - salon business simulation game
// Feature: Trivia Question (panel-expert quizzes) + Progress Bar (tier progress)

const PRODUCTS_GAME = [
  { id: 'lipstick',    emoji: '💄', name: 'Lipstick',   cost: 8,  price: 20 },
  { id: 'foundation',  emoji: '🧴', name: 'Foundation', cost: 12, price: 28 },
  { id: 'mascara',     emoji: '👁️', name: 'Mascara',    cost: 6,  price: 16 },
  { id: 'blush',       emoji: '🌸', name: 'Blush',       cost: 7,  price: 15 },
  { id: 'eyeshadow',   emoji: '🎨', name: 'Eyeshadow',  cost: 10, price: 24 },
  { id: 'skincare',    emoji: '🧖', name: 'Skin Prep',  cost: 9,  price: 22 },
];
const MENTORS = [
  { id: 'vance',      emoji: '🧪', name: 'Dr. Evelyn Vance',  specialty: 'Cosmetic Chemistry',     cost: 150, unlock: 'skincare',  blurb: 'Chemistry genius. Unlocks premium Skin Prep line.' },
  { id: 'chen',       emoji: '🎭', name: 'Marcus Chen',       specialty: 'SFX & Prosthetics',      cost: 300, unlock: 'sfx',       blurb: 'Film FX legend. Unlocks SFX services for big-budget clients.' },
  { id: 'brooks',     emoji: '👠', name: 'Aaliyah Brooks',    specialty: 'Editorial & Runway',     cost: 250, unlock: 'editorial', blurb: 'Fashion week director. VIP editorial clients start visiting.' },
  { id: 'rodriguez',  emoji: '📸', name: 'Sofia Rodriguez',   specialty: 'HD Camera & Skin Prep',  cost: 200, unlock: 'bridal',    blurb: '4K bridal artistry. High-paying bridal clients appear.' },
  { id: 'tanaka',     emoji: '🎪', name: 'Kai Tanaka',        specialty: 'Stage & Performance FX', cost: 400, unlock: 'theater',   blurb: 'Theater MUA. Weekend theater contracts, huge payouts.' },
];
const TIERS = [ { rep: 0, name: 'Corner Counter' }, { rep: 50, name: 'Boutique' }, { rep: 150, name: 'Salon Studio' }, { rep: 300, name: 'Mega Glam Store' } ];
const FACES = ['👩','👩🏻','👩🏽','👩🏾','👨','👨🏻','🧑🏽','👩\u200d🦰','🧑\u200d🦱','👩\u200d🎤','👰','🧑\u200d🎨'];
const NAMES = ['Maya','Jordan','Priya','Zoe','Camila','Devon','Amara','Fiona','Chen','Roberta','Freya','Halle'];

// Feature: Trivia Question - quiz bank based on the expert panel session topics
const QUIZ = [
  { q: 'Which material is known for ultra-realistic cinematic creature effects?', opts: ['Foam latex','Silicone','Wax','Plaster'], a: 1, who: 'Marcus Chen - SFX & Prosthetics' },
  { q: 'Botanical surfactants are used in cosmetics as replacements for what?', opts: ['Pigments','Preservatives','Traditional cleansing agents','UV filters'], a: 2, who: 'Dr. Evelyn Vance - Cosmetic Chemistry' },
  { q: 'What does optical diffusion help with in HD makeup?', opts: ['Scent','Blurring skin texture under 4K cameras','Longer lashes','Hair growth'], a: 1, who: 'Sofia Rodriguez - HD Camera & Skin Prep' },
  { q: 'Stage makeup relies on bold contouring mainly because...', opts: ['It photographs better up close','It reads well from a distance','It saves product','It is required by law'], a: 1, who: 'Kai Tanaka - Stage & Performance FX' },
  { q: 'In runway makeup, spatial placement of color matters for...', opts: ['Passport photos','Avant-garde looks under harsh runway lighting','UV protection','Waterproofing'], a: 1, who: 'Aaliyah Brooks - Editorial & Runway' },
  { q: 'Non-comedogenic primers are formulated to...', opts: ['Add shimmer','Avoid clogging pores','Change skin tone','Set with heat'], a: 1, who: 'Sofia Rodriguez - HD Camera & Skin Prep' },
  { q: 'Shelf-life testing of a lipstick mainly checks...', opts: ['Color stability and pigment separation','Battery life','Weight','Sound'], a: 0, who: 'Dr. Evelyn Vance - Cosmetic Chemistry' },
  { q: 'Seamless edge blending on prosthetics is finished using...', opts: ['Solvents to dissolve edges','Glitter','Hair spray','Hot water only'], a: 0, who: 'Marcus Chen - SFX & Prosthetics' },
];

let S;
let customers = [], spawnT = null, dayActive = false, activeEvent = null, dayQuizShown = false;
let toastT;

function defaultState() {
  return { coins: 60, rep: 0, day: 1, served: 0,
    stock: { lipstick: 4, foundation: 3, mascara: 4, blush: 3, eyeshadow: 2, skincare: 0 },
    mentors: [], dayEarnings: 0, dayServed: 0, sinceQuiz: 0, quizzesRight: 0,
    unlocked: ['lipstick','foundation','mascara','blush','eyeshadow'] };
}
function load() { try { const s = JSON.parse(localStorage.getItem('glamEmpire')); if (s) return s; } catch (e) {} return defaultState(); }
function save(toast) { localStorage.setItem('glamEmpire', JSON.stringify(S)); if (toast) toastMsg('Game saved!'); }
function resetGame() { localStorage.removeItem('glamEmpire'); S = defaultState(); customers = []; startDay(); render(); }

function unlockedProducts() { return PRODUCTS_GAME.filter(p => S.unlocked.includes(p.id) || S.mentors.some(m => m.unlock === p.id)); }
function tier() { let t = TIERS[0]; for (const x of TIERS) if (S.rep >= x.rep) t = x; return t; }
function nextTier() { return TIERS[TIERS.indexOf(tier()) + 1] || null; }

function render() {
  document.getElementById('coins').textContent = S.coins;
  document.getElementById('rep').textContent = S.rep;
  document.getElementById('day').textContent = S.day;
  document.getElementById('served').textContent = S.served;
  document.getElementById('shopTier').innerHTML = 'Shop Tier: <span class="tier">' + tier().name + '</span>';
  // Feature: Progress Bar toward next shop tier
  const nt = nextTier();
  const wrap = document.getElementById('progressWrap');
  if (nt) {
    const pct = Math.min(100, Math.round((S.rep - tier().rep) / (nt.rep - tier().rep) * 100));
    wrap.innerHTML = '<div class="sub" style="font-size:11px;margin:4px 0 2px">Next tier: ' + nt.name + ' (' + pct + '%)</div>'
      + '<div class="bar"><div style="width:' + pct + '%"></div></div>';
  } else {
    wrap.innerHTML = '<div class="sub" style="font-size:11px;margin:4px 0 2px">Max tier reached! 🎉</div><div class="bar"><div style="width:100%"></div></div>';
  }
  const shelf = document.getElementById('shelf'); shelf.innerHTML = '';
  for (const p of unlockedProducts()) {
    const s = S.stock[p.id] || 0;
    const d = document.createElement('div'); d.className = 'item';
    d.innerHTML = '<div class="emoji">' + p.emoji + '</div><div>' + p.name + '</div><div class="stock">' + s + ' in stock</div>';
    const b = document.createElement('button'); b.textContent = 'Restock (' + p.cost + '🪙)';
    b.disabled = S.coins < p.cost;
    b.onclick = function () { if (S.coins >= p.cost) { S.coins -= p.cost; S.stock[p.id] = (S.stock[p.id] || 0) + 3; toastMsg('+3 ' + p.name); render(); } };
    d.appendChild(b); shelf.appendChild(d);
  }
  const ml = document.getElementById('mentors'); ml.innerHTML = '';
  for (const m of MENTORS) {
    const owned = S.mentors.includes(m.id);
    const d = document.createElement('div'); d.className = 'mentor' + (owned ? ' done' : '');
    d.innerHTML = '<div class="mt">' + m.emoji + ' ' + m.name + ' <span style="color:#b9a3c9;font-size:11px">· ' + m.specialty + '</span></div>'
      + '<div class="md">' + m.blurb + '</div>';
    if (!owned) {
      const b = document.createElement('button'); b.textContent = '🎓 Hire - ' + m.cost + ' coins';
      b.disabled = S.coins < m.cost;
      b.onclick = function () { if (S.coins >= m.cost) { S.coins -= m.cost; S.mentors.push(m.id); toastMsg(m.name + ' joined your team! 💫'); render(); } };
      d.appendChild(b);
    } else { d.innerHTML += '<div style="color:#4ade80;font-weight:700">✓ On your team</div>'; }
    ml.appendChild(d);
  }
  renderCustomers();
}

function renderCustomers() {
  const c = document.getElementById('customers'); c.innerHTML = '';
  if (customers.length === 0) { c.innerHTML = '<div style="color:#b9a3c9;font-size:12px;padding:20px;text-align:center">No customers right now... they\'ll arrive soon!</div>'; return; }
  for (const cu of customers) {
    const d = document.createElement('div'); d.className = 'cust';
    const p = cu.premium ? '👑 ' : '';
    d.innerHTML = '<div class="face">' + cu.face + '</div><div class="info"><div class="name">' + p + cu.name + '</div>'
      + '<div class="want">wants ' + cu.want.emoji + ' ' + cu.want.name + '</div>'
      + '<div class="bar"><div style="width:' + Math.max(0, cu.patience) + '%"></div></div></div>';
    const b = document.createElement('button'); b.className = 'serve';
    const have = (S.stock[cu.want.id] || 0) > 0;
    b.textContent = have ? 'Serve (' + cu.pay + '🪙)' : 'Out of stock';
    b.disabled = !have;
    b.onclick = function () { serve(cu); };
    d.appendChild(b); c.appendChild(d);
  }
}

function spawnCustomer() {
  const avail = unlockedProducts().filter(p => (S.stock[p.id] || 0) > 0 || Math.random() < .4);
  if (avail.length === 0) return;
  const want = avail[Math.floor(Math.random() * avail.length)];
  const premiumPool = [];
  if (S.mentors.includes('rodriguez')) premiumPool.push('bridal');
  if (S.mentors.includes('brooks')) premiumPool.push('editorial');
  const premium = premiumPool.length > 0 && Math.random() < .25;
  customers.push({
    name: NAMES[Math.floor(Math.random() * NAMES.length)],
    face: FACES[Math.floor(Math.random() * FACES.length)],
    want: want, patience: 100, premium: premium,
    pay: Math.round(want.price * (premium ? 3 : 1) * (1 + S.rep / 400)),
  });
  renderCustomers();
}

function serve(cu) {
  if ((S.stock[cu.want.id] || 0) <= 0) return;
  S.stock[cu.want.id]--; S.coins += cu.pay; S.served++; S.dayServed++;
  const bonus = cu.premium ? 5 : 1 + (S.rep >= 100 ? 1 : 0);
  S.rep += bonus; S.dayEarnings += cu.pay;
  customers = customers.filter(x => x !== cu);
  toastMsg('+' + cu.pay + '🪙 ' + (cu.premium ? 'VIP thrilled! 💖' : 'Happy customer!'));
  render();
  S.sinceQuiz = (S.sinceQuiz || 0) + 1;
  if (S.sinceQuiz >= 4 && !dayQuizShown) { dayQuizShown = true; S.sinceQuiz = 0; setTimeout(askTrivia, 500); }
}

function tick() {
  for (const cu of customers) { cu.patience -= 4; }
  const left = customers.filter(cu => cu.patience > 0);
  if (left.length < customers.length) { S.rep = Math.max(0, S.rep - 2); toastMsg('A customer left... 😞 -2 rep'); }
  customers = left;
  if (!activeEvent && Math.random() < .04) randomEvent();
  render();
}

function startDay() {
  dayActive = true;
  customers = []; S.dayEarnings = 0; S.dayServed = 0; dayQuizShown = false; activeEvent = null; hideEventBanner();
  clearInterval(spawnT);
  spawnCustomer();
  spawnT = setInterval(function () { if (customers.length < 4) spawnCustomer(); tick(); }, 1200);
}
function resumeDay() {
  clearInterval(spawnT);
  spawnT = setInterval(function () { if (customers.length < 4) spawnCustomer(); tick(); }, 1200);
}

function endDay() {
  clearInterval(spawnT); dayActive = false;
  const t = tier();
  const next = TIERS[TIERS.indexOf(t) + 1];
  let msg = 'You served ' + S.dayServed + ' customers and earned ' + S.dayEarnings + '🪙. Reputation: ' + S.rep + '.';
  if (next && S.rep >= next.rep) msg += '<br>🎉 <b>Upgrade! Your shop is now a ' + next.name + '!</b>';
  document.getElementById('overlayHolder').innerHTML =
    '<div class="overlay"><div class="ocard"><h2>🌙 Day ' + S.day + ' Complete</h2><p>' + msg + '</p>'
    + '<button onclick="nextDay()">Start Day ' + (S.day + 1) + ' →</button></div></div>';
  save();
}
function nextDay() {
  document.getElementById('overlayHolder').innerHTML = '';
  S.day++; save(); startDay(); render();
}

function toastMsg(m) {
  const t = document.getElementById('toast'); t.textContent = m; t.style.opacity = 1;
  clearTimeout(toastT); toastT = setTimeout(function () { t.style.opacity = 0; }, 1600);
}

// Feature: Trivia Question
function askTrivia() {
  clearInterval(spawnT);
  const q = QUIZ[Math.floor(Math.random() * QUIZ.length)];
  const holder = document.getElementById('overlayHolder');
  holder.innerHTML = '<div class="overlay"><div class="ocard quiz-card"><h2>🎓 Pop Quiz!</h2>'
    + '<p style="color:#e9b7ff;font-size:11px">' + q.who + '</p>'
    + '<p style="font-weight:700">' + q.q + '</p>'
    + q.opts.map(function (o, i) { return '<button class="opt" onclick="answerQuiz(' + i + ')">' + String.fromCharCode(65 + i) + '. ' + o + '</button>'; }).join('')
    + '</div></div>';
  window._curQuiz = q;
}
function answerQuiz(i) {
  const q = window._curQuiz, btns = document.querySelectorAll('.opt');
  btns.forEach(function (b, idx) { b.disabled = true; if (idx === q.a) b.classList.add('right'); });
  if (i === q.a) {
    const prize = 30 + S.rep;
    S.coins += prize; S.rep += 3; S.quizzesRight = (S.quizzesRight || 0) + 1;
    toastMsg('Correct! +' + prize + '🪙 +3 rep 🎓');
  } else {
    toastMsg('Wrong... the correct answer was highlighted.');
  }
  render(); save();
  setTimeout(function () { document.getElementById('overlayHolder').innerHTML = ''; resumeDay(); }, 1400);
}

// Feature: Random events
function randomEvent() {
  const r = Math.random();
  if (r < .4) {
    activeEvent = { type: 'rush' };
    showEventBanner('⚡ RUSH HOUR! Customers arriving faster for 12 seconds!');
    clearInterval(spawnT);
    spawnT = setInterval(function () { if (customers.length < 6) spawnCustomer(); tick(); }, 700);
    setTimeout(function () { activeEvent = null; hideEventBanner(); resumeDay(); }, 12000);
  } else if (r < .7) {
    const gain = 20 + Math.round(S.rep / 2);
    S.rep += gain;
    showEventBanner('🌟 A beauty influencer praised your shop! +' + gain + ' reputation!');
    setTimeout(hideEventBanner, 6000);
  } else {
    const p = unlockedProducts()[0];
    const refund = Math.min(S.coins, p.cost * 3);
    S.coins += refund;
    showEventBanner('📦 A supplier refunded overstock! +' + refund + ' coins!');
    setTimeout(hideEventBanner, 6000);
  }
  render();
}
function showEventBanner(m) { const b = document.getElementById('eventBanner'); b.textContent = m; b.style.display = 'block'; }
function hideEventBanner() { document.getElementById('eventBanner').style.display = 'none'; }

S = load();
render();
startDay();