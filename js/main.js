/* =============================================
   NEURAL NETWORK CANVAS ANIMATION
   ============================================= */
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, nodes, animFrame;
  const NODE_COUNT = 80;
  const MAX_DIST = 160;
  const SPEED = 0.35;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createNodes() {
    nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
      r: Math.random() * 2 + 1,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // update positions
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });

    // draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.5;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // draw nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 229, 255, 0.6)';
      ctx.fill();
    });

    animFrame = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    resize();
    createNodes();
  });

  resize();
  createNodes();
  draw();
})();

/* =============================================
   TYPING ANIMATION
   ============================================= */
(function () {
  const el = document.getElementById('typing-text');
  if (!el) return;

  const phrases = [
    '脑癌诊断研究员',
    'Brain Tumor AI Researcher',
    '智能体开发者',
    'AI Agent Developer',
    '复旦大学大数据学院',
    'Fudan University · Data Science',
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;
  let pauseFrames = 0;

  function type() {
    const current = phrases[phraseIdx];

    if (pauseFrames > 0) {
      pauseFrames--;
      setTimeout(type, 80);
      return;
    }

    if (!deleting) {
      el.textContent = current.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        deleting = true;
        pauseFrames = 25;
      }
      setTimeout(type, 80);
    } else {
      el.textContent = current.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        pauseFrames = 8;
      }
      setTimeout(type, 45);
    }
  }

  type();
})();

/* =============================================
   SCROLL FADE-IN OBSERVER
   ============================================= */
(function () {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  elements.forEach(el => observer.observe(el));
})();

/* =============================================
   MOBILE NAV TOGGLE
   ============================================= */
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    const spans = toggle.querySelectorAll('span');
    if (links.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close on nav link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      const spans = toggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });
})();

/* =============================================
   ACTIVE NAV LINK
   ============================================= */
(function () {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();
