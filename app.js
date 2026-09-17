/* ==========================================================================
   SULFSENSE PORTFOLIO & DASHBOARD - INTERACTIVE SCRIPT (APP.JS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ===== 1. Sticky Header & Active Nav Link Highlight =====
  const header = document.getElementById('siteHeader');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id], main[id]');

  window.addEventListener('scroll', () => {
    // Header shadow on scroll
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Back to top button visibility
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }

    // Active Nav Highlight based on scroll position
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // ===== 2. Intersection Observer for Scroll Reveal =====
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach(el => revealObserver.observe(el));

  // ===== 3. 3D Tilt Animation for Team & Mentor Cards =====
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -8; // rotate up/down
      const rotateY = ((x - centerX) / centerX) * 8;   // rotate left/right

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
    });
  });

  // ===== 4. Animated Number Counter Helper =====
  function animateCounter(el, target, duration = 1400) {
    if (!el) return;
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ===== 5. Donut Risk Meter Animation =====
  function animateRiskGauge(targetPercent) {
    const circle = document.getElementById('riskArc');
    const percentEl = document.getElementById('riskPercent');
    if (!circle || !percentEl) return;

    const circumference = 389.6; // 2 * PI * 62
    const offset = circumference - (targetPercent / 100) * circumference;

    circle.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1)';
    requestAnimationFrame(() => {
      circle.style.strokeDashoffset = offset;
    });

    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / 1400);
      percentEl.textContent = Math.round(p * targetPercent) + '%';
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ===== 6. Trigger Dashboard Counters & Charts when Dashboard Visible =====
  let dashboardTriggered = false;
  const dashboardSection = document.getElementById('dashboard');

  if (dashboardSection) {
    const dashObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !dashboardTriggered) {
          dashboardTriggered = true;
          animateCounter(document.getElementById('counterIndex'), 72, 1400);
          animateCounter(document.getElementById('counterEvents'), 4, 1000);
          animateRiskGauge(68);
          drawTrendChart();
          drawRiskChart();
        }
      });
    }, { threshold: 0.2 });
    dashObserver.observe(dashboardSection);
  }

  // ===== 7. Canvas Utility Setup (Retina Display High DPI Support) =====
  function setupCanvas(canvas) {
    if (!canvas) return null;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const cssHeight = parseInt(canvas.getAttribute('height'), 10) || 200;
    
    canvas.width = rect.width * dpr;
    canvas.height = cssHeight * dpr;
    canvas.style.height = cssHeight + 'px';
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, w: rect.width, h: cssHeight };
  }

  // ===== 8. Draw Exposure Trend Chart =====
  function drawTrendChart() {
    const canvas = document.getElementById('trendChart');
    const res = setupCanvas(canvas);
    if (!res) return;
    const { ctx, w, h } = res;

    const data = [8, 12, 10, 18, 26, 22, 35, 48, 40, 55, 62, 58, 72, 65, 50, 38];
    const labels = ['06:00','','','09:00','','','12:00','','','15:00','','','18:00','','','21:00'];
    const pad = { l: 36, r: 16, t: 16, b: 26 };
    const max = 80;
    const plotW = w - pad.l - pad.r;
    const plotH = h - pad.t - pad.b;

    ctx.clearRect(0, 0, w, h);

    // Horizontal Grid lines & Y Axis labels
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + (plotH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(w - pad.r, y);
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(max - (max / 4) * i), pad.l - 8, y + 3);
    }

    const points = data.map((v, i) => ({
      x: pad.l + (plotW / (data.length - 1)) * i,
      y: pad.t + plotH - (v / max) * plotH
    }));

    // Area gradient under the trend line
    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + plotH);
    grad.addColorStop(0, 'rgba(37, 99, 235, 0.22)');
    grad.addColorStop(1, 'rgba(37, 99, 235, 0.0)');
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, pad.t + plotH);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, pad.t + plotH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line Path
    ctx.beginPath();
    points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Line Dots
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#2563EB';
      ctx.stroke();
    });

    // X Axis Labels
    ctx.fillStyle = '#64748B';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    labels.forEach((l, i) => {
      if (l) ctx.fillText(l, points[i].x, h - 6);
    });
  }

  // ===== 9. Draw Exposure Risk Over Time Chart =====
  function drawRiskChart() {
    const canvas = document.getElementById('riskChart');
    const res = setupCanvas(canvas);
    if (!res) return;
    const { ctx, w, h } = res;

    const data = [15, 22, 18, 30, 45, 55, 48, 68, 72, 60, 42, 30];
    const labels = ['08:00','','10:00','','12:00','','14:00','','16:00','','18:00',''];
    const pad = { l: 36, r: 16, t: 16, b: 26 };
    const max = 100;
    const plotW = w - pad.l - pad.r;
    const plotH = h - pad.t - pad.b;

    ctx.clearRect(0, 0, w, h);

    // Risk Zones Backgrounds: Safe (0-40), Caution (40-70), High (70-100)
    const zones = [
      { from: 0, to: 40, color: 'rgba(5, 150, 105, 0.08)' },
      { from: 40, to: 70, color: 'rgba(217, 119, 6, 0.08)' },
      { from: 70, to: 100, color: 'rgba(220, 38, 38, 0.08)' }
    ];

    zones.forEach(z => {
      const yTop = pad.t + plotH - (z.to / max) * plotH;
      const yBot = pad.t + plotH - (z.from / max) * plotH;
      ctx.fillStyle = z.color;
      ctx.fillRect(pad.l, yTop, plotW, yBot - yTop);
    });

    // Grid Lines & Y Axis Labels
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    [0, 40, 70, 100].forEach(v => {
      const y = pad.t + plotH - (v / max) * plotH;
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(w - pad.r, y);
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(v, pad.l - 8, y + 3);
    });

    const points = data.map((v, i) => ({
      x: pad.l + (plotW / (data.length - 1)) * i,
      y: pad.t + plotH - (v / max) * plotH
    }));

    // Risk Curve Line
    ctx.beginPath();
    points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#D97706';
      ctx.stroke();
    });

    // X Axis Labels
    ctx.fillStyle = '#64748B';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    labels.forEach((l, i) => {
      if (l) ctx.fillText(l, points[i].x, h - 6);
    });
  }

  window.addEventListener('resize', () => {
    if (dashboardTriggered) {
      drawTrendChart();
      drawRiskChart();
    }
  });

  // ===== 10. Filterable Exposure History Table =====
  const historyData = {
    today: [
      ['12 Sep', '09:30', 'Low', '8 min', 'safe', 'Continue monitoring'],
      ['12 Sep', '11:15', 'Moderate', '12 min', 'caution', 'Check ventilation'],
      ['12 Sep', '14:05', 'High', '4 min', 'high', 'Safety verification'],
      ['12 Sep', '16:40', 'Low', '6 min', 'safe', 'Continue monitoring']
    ],
    '7d': [
      ['06 Sep', '10:05', 'Moderate', '10 min', 'caution', 'Check ventilation'],
      ['08 Sep', '13:20', 'Low', '7 min', 'safe', 'Continue monitoring'],
      ['09 Sep', '15:50', 'High', '5 min', 'high', 'Safety verification'],
      ['10 Sep', '08:45', 'Moderate', '9 min', 'caution', 'Check ventilation'],
      ['12 Sep', '09:30', 'Low', '8 min', 'safe', 'Continue monitoring'],
      ['12 Sep', '14:05', 'High', '4 min', 'high', 'Safety verification']
    ],
    '30d': [
      ['18 Aug', '11:10', 'Low', '6 min', 'safe', 'Continue monitoring'],
      ['24 Aug', '09:40', 'High', '5 min', 'high', 'Safety verification'],
      ['29 Aug', '14:15', 'Moderate', '11 min', 'caution', 'Check ventilation'],
      ['03 Sep', '10:30', 'Low', '7 min', 'safe', 'Continue monitoring'],
      ['09 Sep', '15:50', 'High', '5 min', 'high', 'Safety verification'],
      ['12 Sep', '14:05', 'High', '4 min', 'high', 'Safety verification']
    ]
  };

  function riskLabelText(key) {
    return { safe: 'Safe', caution: 'Caution', high: 'High' }[key] || key;
  }

  function renderHistoryTable(range) {
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const rows = historyData[range] || historyData.today;
    rows.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row[0]}</td>
        <td>${row[1]}</td>
        <td>${row[2]}</td>
        <td>${row[3]}</td>
        <td><span class="badge-risk ${row[4]}">${riskLabelText(row[4])}</span></td>
        <td>${row[5]}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderHistoryTable(tab.dataset.range);
    });
  });

  renderHistoryTable('today');
});
