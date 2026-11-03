/* melaevent – event management front end (vanilla JS) */
const on = (m, d, h, min = 0, y = 2026) => new Date(y, m - 1, d, h, min, 0, 0);

// Fixed dates leading up to 1 January 2027. Edit this array to add your own events.
const EVENTS = [
  { id: 1, title: "Frontend Sprint: Build in a Day", cat: "Tech", date: on(11, 14, 10), venue: "KIIT Campus 25, Block C Lecture Hall", image: "images/frontend-sprint.svg", seats: 60, desc: "A hands-on day of HTML, CSS and JavaScript. Ship a small project before dinner." },
  { id: 2, title: "Open Mic & Acoustic Night", cat: "Music", date: on(11, 21, 18, 30), venue: "KIIT Campus 6 Auditorium", image: "images/open-mic.svg", seats: 120, desc: "Local artists, unplugged sets and a friendly crowd. Sign up to perform or just listen." },
  { id: 3, title: "New Year Sunrise 5K Run", cat: "Sports", date: on(1, 1, 6, 0, 2027), venue: "KIIT Velodrome Track", image: "images/sunrise-5k.svg", seats: 200, desc: "Start the year on the move. A relaxed 5K for all paces, with a medal and breakfast at the finish." },
  { id: 4, title: "Street Food Festival", cat: "Food", date: on(12, 6, 16), venue: "KIIT Campus 7, MBA Garden", image: "images/street-food.svg", seats: 300, desc: "Thirty vendors, live cooking demos and a dessert trail. Come hungry." },
  { id: 5, title: "Watercolour for Beginners", cat: "Art", date: on(12, 13, 11), venue: "KIIT Campus 7, MBA Garden", image: "images/watercolour.svg", seats: 25, desc: "Learn washes, blending and simple landscapes. Paper and paints are provided." },
  { id: 6, title: "AI Tools for Students", cat: "Tech", date: on(12, 18, 14), venue: "KIIT Campus 25, Block C Lecture Hall", image: "images/ai-tools.svg", seats: 80, desc: "Practical demos of AI tools for research, coding and study, with time for questions." },
  { id: 7, title: "New Year's Eve Live Music Night", cat: "Music", date: on(12, 31, 21), venue: "KIIT Campus 13 Cricket Ground", image: "images/nye-music.svg", seats: 250, desc: "Five bands, one stage and a midnight countdown. See the year out together." },
  { id: 8, title: "Inter-College Football Cup", cat: "Sports", date: on(12, 27, 9), venue: "KIIT Campus 13 Football Ground", image: "images/football-cup.svg", seats: 400, desc: "Eight teams compete over one day. Cheer on your college from the stands." },
  { id: 9, title: "Sketchbook Meetup", cat: "Art", date: on(12, 29, 15), venue: "KIIT Campus 7, MBA Garden", image: "images/sketchbook.svg", seats: 30, desc: "Bring a sketchbook, draw with strangers and swap techniques over coffee." },
  { id: 10, title: "Baking Masterclass", cat: "Food", date: on(12, 22, 10, 30), venue: "KIIT Campus 7, MBA Garden", image: "images/baking.svg", seats: 20, desc: "Bake sourdough and a festive tart with a professional pastry chef." }
].sort((x, y) => x.date - y.date);

const $ = s => document.querySelector(s);
const esc = t => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const store = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const fmtDate = d => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const fmtTime = d => d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
let regs = store.get("melaevent.regs", []);
let state = { cat: "All", q: "" };
let current = null;

const seatsLeft = e => Math.max(0, e.seats - regs.filter(r => r.eventId === e.id).length);

/* ---------- Theme ---------- */
function setTheme(t) {
  document.documentElement.dataset.theme = t;
  const b = $("#themeBtn");
  b.textContent = t === "dark" ? "☀️" : "🌙";
  b.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
  store.set("melaevent.theme", t);
}
setTheme(store.get("melaevent.theme", matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
$("#themeBtn").onclick = () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");

/* ---------- Event list ---------- */
function renderChips() {
  const cats = ["All", ...new Set(EVENTS.map(e => e.cat))];
  $("#chips").innerHTML = cats.map(c => `<button class="chip" aria-pressed="${c === state.cat}" data-cat="${c}">${c}</button>`).join("");
}
function banner(e, withDate) {
  return `<img class="art" src="${e.image}" alt="" loading="lazy">` +
    (withDate ? `<span class="date">${e.date.getDate()}<small>${e.date.toLocaleString("en-IN", { month: "short" })}</small></span>` : "");
}
function renderGrid() {
  const q = state.q.trim().toLowerCase();
  const list = EVENTS.filter(e => (state.cat === "All" || e.cat === state.cat) &&
    (!q || [e.title, e.venue, e.cat, e.desc].join(" ").toLowerCase().includes(q)));
  $("#grid").innerHTML = list.map(e => `
    <article class="card">
      <div class="banner c-${e.cat}">${banner(e, true)}</div>
      <div class="card-body">
        <span class="tag">${e.cat}</span>
        <h3>${e.title}</h3>
        <p class="meta">${fmtDate(e.date)}, ${fmtTime(e.date)}<br>${e.venue}</p>
        <p class="desc">${e.desc}</p>
        <button class="btn" data-id="${e.id}">${seatsLeft(e) ? "View & register" : "View details"}</button>
      </div>
    </article>`).join("");
  $("#empty").hidden = list.length > 0;
  $("#count").textContent = `${list.length} event${list.length === 1 ? "" : "s"} found`;
}
$("#chips").onclick = ev => {
  const b = ev.target.closest(".chip"); if (!b) return;
  state.cat = b.dataset.cat; renderChips(); renderGrid();
};
$("#grid").onclick = ev => { const b = ev.target.closest("[data-id]"); if (b) openEvent(+b.dataset.id); };
$("#q").addEventListener("input", e => { state.q = e.target.value; renderGrid(); });
$("#heroSearch").onsubmit = e => { e.preventDefault(); $("#events").scrollIntoView(); };

/* ---------- Countdown ---------- */
// Countdown target: the next 1 January (e.g. 1 Jan 2027)
const now0 = new Date();
const target = new Date(now0.getFullYear() + 1, 0, 1, 0, 0, 0);
$("#nextTitle").textContent = `New Year ${target.getFullYear()}`;
$("#nextMeta").textContent = fmtDate(target);
$("#nextBtn").onclick = () => $("#events").scrollIntoView();
function tick() {
  let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
  const p = n => String(n).padStart(2, "0");
  $("#cd-d").textContent = p(Math.floor(s / 86400)); s %= 86400;
  $("#cd-h").textContent = p(Math.floor(s / 3600)); s %= 3600;
  $("#cd-m").textContent = p(Math.floor(s / 60));
  $("#cd-s").textContent = p(s % 60);
}
tick(); setInterval(tick, 1000);

/* ---------- Event dialog & form ---------- */
const dlg = $("#dlg"), form = $("#form");
function openEvent(id) {
  current = EVENTS.find(e => e.id === id);
  $("#dBanner").className = `banner c-${current.cat}`;
  $("#dBanner").innerHTML = banner(current, false);
  $("#dTitle").textContent = current.title;
  $("#dMeta").textContent = `${fmtDate(current.date)}, ${fmtTime(current.date)} · ${current.venue}`;
  $("#dDesc").textContent = current.desc;
  $("#fEvent").innerHTML = EVENTS.map(e => `<option value="${e.id}" ${seatsLeft(e) ? "" : "disabled"}>${e.title}${seatsLeft(e) ? "" : " (full)"}</option>`).join("");
  $("#fEvent").value = id;
  form.reset(); $("#fEvent").value = id;
  clearErrors(); updateSeats();
  form.hidden = false; $("#ok").hidden = true;
  dlg.showModal();
}
function updateSeats() {
  const e = EVENTS.find(x => x.id === +$("#fEvent").value) || current;
  const n = seatsLeft(e);
  $("#dSeats").textContent = n ? `${n} of ${e.seats} seats left` : "This event is full";
  $("#dSeats").style.color = n && n < 10 ? "var(--err)" : "";
}
$("#fEvent").onchange = () => { current = EVENTS.find(x => x.id === +$("#fEvent").value); openMeta(); updateSeats(); };
function openMeta() {
  $("#dBanner").className = `banner c-${current.cat}`;
  $("#dBanner").innerHTML = banner(current, false);
  $("#dTitle").textContent = current.title;
  $("#dMeta").textContent = `${fmtDate(current.date)}, ${fmtTime(current.date)} · ${current.venue}`;
  $("#dDesc").textContent = current.desc;
}
const closeDlg = () => dlg.close();
$("#dClose").onclick = closeDlg; $("#okClose").onclick = closeDlg;
dlg.addEventListener("click", e => { if (e.target === dlg) closeDlg(); });

const rules = {
  name: v => /^[A-Za-z][A-Za-z .'-]{1,49}$/.test(v.trim()) ? "" : "Enter your full name (letters only, at least 2 characters).",
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Enter a valid email address, like name@example.com.",
  phone: v => /^(\+?91)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, "")) ? "" : "Enter a valid 10-digit mobile number.",
  event: v => v ? "" : "Choose an event."
};
const fieldEl = k => ({ name: $("#fName"), email: $("#fEmail"), phone: $("#fPhone"), event: $("#fEvent") })[k];
function showErr(k, msg) {
  fieldEl(k).closest(".field").classList.toggle("bad", !!msg);
  fieldEl(k).setAttribute("aria-invalid", !!msg);
  $("#e" + k[0].toUpperCase() + k.slice(1)).textContent = msg;
}
function clearErrors() { Object.keys(rules).forEach(k => showErr(k, "")); }
Object.keys(rules).forEach(k => fieldEl(k).addEventListener("blur", () => showErr(k, rules[k](fieldEl(k).value))));

form.addEventListener("submit", e => {
  e.preventDefault();
  const data = { name: $("#fName").value, email: $("#fEmail").value, phone: $("#fPhone").value, event: $("#fEvent").value };
  let first = null;
  for (const k of Object.keys(rules)) {
    const m = rules[k](data[k]); showErr(k, m);
    if (m && !first) first = fieldEl(k);
  }
  const ev = EVENTS.find(x => x.id === +data.event);
  if (!first && ev && !seatsLeft(ev)) { showErr("event", "This event is full. Choose another one."); first = fieldEl("event"); }
  if (!first && regs.some(r => r.eventId === ev.id && r.email === data.email.trim().toLowerCase())) {
    showErr("email", "This email is already registered for this event."); first = fieldEl("email");
  }
  if (first) return first.focus();

  regs.push({ id: Date.now(), eventId: ev.id, name: data.name.trim(), email: data.email.trim().toLowerCase(), phone: data.phone.trim() });
  store.set("melaevent.regs", regs);
  $("#okText").textContent = `Thanks, ${data.name.trim().split(" ")[0]}. Your seat for “${ev.title}” on ${fmtDate(ev.date)} is confirmed. We've saved it under My registrations.`;
  form.hidden = true; $("#ok").hidden = false; $("#ok").focus();
  refresh();
});

/* ---------- My registrations ---------- */
function renderMine() {
  $("#regCount").textContent = regs.length;
  $("#myEmpty").hidden = regs.length > 0;
  $("#myList").innerHTML = regs.map(r => {
    const e = EVENTS.find(x => x.id === r.eventId);
    return `<li><div><strong>${e.title}</strong><br><span class="meta">${fmtDate(e.date)}, ${fmtTime(e.date)} · ${esc(r.name)} (${esc(r.email)})</span></div>
      <button class="link-btn" data-cancel="${r.id}">Cancel registration</button></li>`;
  }).join("");
}
$("#myList").onclick = ev => {
  const b = ev.target.closest("[data-cancel]"); if (!b) return;
  regs = regs.filter(r => r.id !== +b.dataset.cancel);
  store.set("melaevent.regs", regs); refresh();
};
function refresh() { renderGrid(); renderMine(); }

renderChips(); refresh();
