const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
const PARTICLE_COUNT = Math.min(window.innerWidth / 15, 60); // Optimize count for mobile vs desktop
let isVisible = true;
let animationFrameId = null;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.z = Math.random() * 2;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.speedY = (Math.random() - 0.5) * 0.5;
    this.color = Math.random() > 0.5 ? '#38bdf8' : '#818cf8';
    this.opacity = Math.random() * 0.5 + 0.2;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;

    // parallax effect on mouse move
    if (mouseX !== null && mouseY !== null) {
      const dx = (mouseX - width / 2) * 0.005 * this.z;
      const dy = (mouseY - height / 2) * 0.005 * this.z;
      this.x -= dx;
      this.y -= dy;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function init() {
  resize();
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }
}

let mouseX = null;
let mouseY = null;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

window.addEventListener('mouseout', () => {
  mouseX = null;
  mouseY = null;
});

window.addEventListener('resize', () => {
  resize();
  init();
});

function animate() {
  if (!isVisible) return;

  ctx.clearRect(0, 0, width, height);

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  // Draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 120) {
        ctx.beginPath();
        ctx.strokeStyle = '#38bdf8';
        ctx.globalAlpha = (1 - dist / 120) * 0.15;
        ctx.lineWidth = 1;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }

  animationFrameId = requestAnimationFrame(animate);
}

// Performance: Only animate when canvas is in view
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    isVisible = entry.isIntersecting;
    if (isVisible && !animationFrameId) {
      animate();
    } else if (!isVisible && animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  });
}, { threshold: 0 });

if (canvas) {
  observer.observe(canvas);
}

init();
animate();
