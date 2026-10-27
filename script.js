const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.textContent = isOpen ? '✕' : '☰';
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = '☰';
  });
});


// Click a certificate to open an animated full-size preview.
document.addEventListener("DOMContentLoaded", function () {
  const lightbox = document.getElementById("certificateLightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const closeButton = document.getElementById("lightboxClose");
  let lastTrigger = null;
  if (!lightbox || !lightboxImage || !closeButton) return;
  function openPreview(button) {
    lastTrigger = button;
    lightboxImage.src = button.dataset.certificate;
    const thumb = button.querySelector("img");
    lightboxImage.alt = thumb ? thumb.alt : "Expanded certificate";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-active");
    closeButton.focus();
  }
  function closePreview() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-active");
    lightboxImage.src = "";
    if (lastTrigger) lastTrigger.focus();
  }
  document.querySelectorAll(".certificate-card").forEach(function (button) {
    button.addEventListener("click", function () { openPreview(button); });
  });
  closeButton.addEventListener("click", closePreview);
  lightbox.addEventListener("click", function (event) { if (event.target === lightbox) closePreview(); });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) closePreview();
  });
});

// Portfolio motion system: scroll reveals, reading progress, and subtle pointer depth.
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header');
  const progress = document.createElement('div');
  progress.className = 'motion-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  const updateScrollUI = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    progress.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  updateScrollUI();
  window.addEventListener('scroll', updateScrollUI, { passive: true });
  window.addEventListener('resize', updateScrollUI, { passive: true });

  if (reduceMotion) return;
  document.documentElement.classList.add('motion-ready');

  const revealTargets = document.querySelectorAll(
    '.section .container > .eyebrow, .section .container > h2, .section-intro, .two-col > *, .skill-card, .project-card:not(.project-portal-showcase), .project-portal-showcase .project-content > *, .cases details, .interview-card, .resume-document, .resume-actions, .certificate-card'
  );
  revealTargets.forEach((element, index) => {
    element.classList.add('reveal-on-scroll');
    if (element.matches('.two-col > *:first-child')) element.classList.add('reveal-left');
    if (element.matches('.two-col > *:last-child')) element.classList.add('reveal-right');
    if (element.matches('.skill-card, .certificate-card, .cases details')) {
      element.style.setProperty('--reveal-delay', `${(index % 3) * 85}ms`);
    }
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealTargets.forEach(element => observer.observe(element));
  } else {
    revealTargets.forEach(element => element.classList.add('is-visible'));
  }

  // Add a gentle spotlight that follows the pointer on the featured portal card.
  const featuredProject = document.querySelector('.project-portal-showcase');
  if (featuredProject && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    featuredProject.addEventListener('pointermove', event => {
      const rect = featuredProject.getBoundingClientRect();
      featuredProject.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
      featuredProject.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
    });
  }
});


// Repeating typewriter effect for the portfolio owner's name.
document.addEventListener('DOMContentLoaded', () => {
  const nameElement = document.getElementById('typedName');
  if (nameElement) {
    const fullName = nameElement.dataset.text || nameElement.textContent.trim();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reducedMotion) {
      let index = 0, deleting = false;
      const typeNext = () => {
        if (!deleting) {
          index++; nameElement.textContent = fullName.slice(0, index);
          if (index >= fullName.length) { deleting = true; window.setTimeout(typeNext, 1450); return; }
          window.setTimeout(typeNext, 105);
        } else {
          index--; nameElement.textContent = fullName.slice(0, index);
          if (index <= 0) { deleting = false; window.setTimeout(typeNext, 420); return; }
          window.setTimeout(typeNext, 48);
        }
      };
      nameElement.textContent = ''; window.setTimeout(typeNext, 550);
    } else nameElement.textContent = fullName;
  }
  // Swipeable project showcase: keep neighboring cards visible and sync controls/count.
  const projectTrack = document.getElementById('projectsCarousel');
  if (projectTrack) {
    const projectCards = Array.from(projectTrack.querySelectorAll('.project-card'));
    const count = document.getElementById('projectSlideCount');
    const prev = document.getElementById('projectPrev');
    const next = document.getElementById('projectNext');
    const updateProjects = () => {
      const center = projectTrack.scrollLeft + projectTrack.clientWidth / 2;
      let active = 0, best = Infinity;
      projectCards.forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - center);
        if (distance < best) { best = distance; active = i; }
      });
      projectCards.forEach((card, i) => card.classList.toggle('is-active', i === active));
      if (count) count.textContent = `Project ${active + 1} of ${projectCards.length}`;
    };
    const goToProject = (step) => {
      const center = projectTrack.scrollLeft + projectTrack.clientWidth / 2;
      let active = 0, best = Infinity;
      projectCards.forEach((card, i) => { const d = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center); if (d < best) { best=d; active=i; } });
      const target = projectCards[Math.max(0, Math.min(projectCards.length - 1, active + step))];
      if (target) projectTrack.scrollTo({left: target.offsetLeft - (projectTrack.clientWidth-target.offsetWidth)/2, behavior:'smooth'});
    };
    prev?.addEventListener('click', () => goToProject(-1));
    next?.addEventListener('click', () => goToProject(1));
    projectTrack.addEventListener('scroll', updateProjects, {passive:true});
    window.addEventListener('resize', updateProjects);
    updateProjects();
  }
  // Click/tap the hanging ID card to make it swing like a real lanyard.
  const idHanger = document.getElementById('idHanger');
  if (idHanger) {
    idHanger.addEventListener('click', () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      idHanger.classList.remove('is-swaying'); idHanger.setAttribute('aria-pressed', 'true');
      void idHanger.offsetWidth; idHanger.classList.add('is-swaying');
    });
    idHanger.addEventListener('animationend', event => {
      if (event.animationName === 'id-sway') { idHanger.classList.remove('is-swaying'); idHanger.setAttribute('aria-pressed', 'false'); }
    });
  }
});
