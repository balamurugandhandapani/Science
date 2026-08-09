/* ==============================
   Cyber Background Script
============================== */
const canvas = document.getElementById('cyber-bg');
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

const nodes = [];
const nodeCount = 80;

for (let i = 0; i < nodeCount; i++) {
  nodes.push({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5
  });
}

function draw() {
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < nodeCount; i++) {
    let node = nodes[i];
    ctx.fillStyle = "#003d3d";
    ctx.beginPath();
    ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
    ctx.fill();

    for (let j = i + 1; j < nodeCount; j++) {
      let node2 = nodes[j];
      let dist = Math.hypot(node.x - node2.x, node.y - node2.y);
      if (dist < 120) {
        ctx.strokeStyle = `rgba(0,61,61,${1 - dist / 120})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(node2.x, node2.y);
        ctx.stroke();
      }
    }

    node.x += node.vx;
    node.y += node.vy;

    if (node.x < 0 || node.x > width) node.vx *= -1;
    if (node.y < 0 || node.y > height) node.vy *= -1;
  }

  requestAnimationFrame(draw);
}
draw();

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

function toggleMenu() {
  const nav = document.getElementById('mainNav');
  nav.classList.toggle('show');
}

/* ==============================
   Image protection
   Disables right-click "Save Image As" and drag-to-save on every
   image on the page.
============================== */
document.addEventListener('contextmenu', function(e){
  if (e.target.tagName === 'IMG') e.preventDefault();
});
document.addEventListener('dragstart', function(e){
  if (e.target.tagName === 'IMG') e.preventDefault();
});

document.addEventListener('contextmenu', function(e){
  e.preventDefault();
});
/* ==============================
   Disable text copying / selection
============================== */
/* document.addEventListener('copy', function(e){ e.preventDefault(); });
document.addEventListener('cut', function(e){ e.preventDefault(); });
document.addEventListener('selectstart', function(e){ e.preventDefault(); });
document.addEventListener('contextmenu', function(e){ e.preventDefault(); });
*/

/* ==============================
   Deter developer tools access
   (Easily bypassed by determined users — deterrent only)
============================== */
document.addEventListener('keydown', function(e){
  if (e.key === 'F12') e.preventDefault();
  if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) e.preventDefault();
  if (e.ctrlKey && e.key === 'u') e.preventDefault();
});

/* ==============================
   Right click disable warning message
============================== */
document.addEventListener('contextmenu', function(e){
  e.preventDefault();
  showSecurityNotice();
});

function showSecurityNotice(){
  const notice = document.getElementById('securityNotice');
  if (!notice) return;
  notice.classList.add('show');
  clearTimeout(window._noticeTimeout);
  window._noticeTimeout = setTimeout(() => {
    notice.classList.remove('show');
  }, 2200);
}

document.body.appendChild(document.getElementById('securityNotice'));

/* ==============================
   Self-contained "prove you're human" gate
   No external service, no registration needed — a simple
   math challenge generated in the browser, plus a timing
   check: answers submitted too fast (under 2 seconds) are
   treated as suspicious and get a fresh question instead of
   passing, even if the math was correct.
============================== */
(function(){
  if (sessionStorage.getItem('humanVerified') === 'true') return;

  let a, b, answer, startTime;

  function newQuestion(){
    a = Math.floor(Math.random() * 8) + 1;
    b = Math.floor(Math.random() * 8) + 1;
    answer = a + b;
    startTime = Date.now();
    document.getElementById('humanGateQuestion').textContent = `What is ${a} + ${b}?`;
    document.getElementById('humanGateInput').value = '';
  }

  const gate = document.createElement('div');
  gate.id = 'humanGate';
  gate.innerHTML = `
    <div class="human-gate-box">
      <img src="img/logo.png" alt="Logo" class="human-gate-logo">
      <p class="human-gate-title">Quick check before you continue</p>
      <p class="human-gate-question" id="humanGateQuestion"></p>
      <input type="number" id="humanGateInput" class="human-gate-input" autofocus>
      <button id="humanGateBtn" class="human-gate-btn">Verify</button>
      <p id="humanGateError" class="human-gate-error"></p>
    </div>
  `;
  document.body.appendChild(gate);
  newQuestion();

  function tryVerify(){
    const val = parseInt(document.getElementById('humanGateInput').value, 10);
    const elapsed = Date.now() - startTime;

    if (elapsed < 2000) {
      document.getElementById('humanGateError').textContent = 'Too fast — please try again.';
      newQuestion();
      return;
    }
    if (val === answer) {
      sessionStorage.setItem('humanVerified', 'true');
      gate.remove();
    } else {
      document.getElementById('humanGateError').textContent = 'That\'s not correct — try again.';
      newQuestion();
    }
  }

  document.getElementById('humanGateBtn').addEventListener('click', tryVerify);
  document.getElementById('humanGateInput').addEventListener('keydown', function(e){
    if (e.key === 'Enter') tryVerify();
  });
})();