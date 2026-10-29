/* Portfolio interactions — keep this file beside index.html and style.css. */
(() => {
  'use strict';

  const ready = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  };

  ready(() => {
    // Mobile navigation
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    const closeMenu = () => {
      if (!menuToggle || !navLinks) return;
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.textContent = '☰';
    };

    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.textContent = isOpen ? '×' : '☰';
      });

      navLinks.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', closeMenu);
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth > 1000) closeMenu();
      });
    }

    // Highlight the navigation link for the section currently in view
    const sections = Array.from(document.querySelectorAll('main section[id]'));
    const sectionLinks = Array.from(document.querySelectorAll('#navLinks a[href^="#"]'));
    if ('IntersectionObserver' in window && sections.length && sectionLinks.length) {
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          sectionLinks.forEach((link) => {
            const active = link.getAttribute('href') === `#${entry.target.id}`;
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
          });
        });
      }, { rootMargin: '-25% 0px -65% 0px', threshold: 0 });
      sections.forEach((section) => sectionObserver.observe(section));
    }

    // Project carousel controls
    const projectTrack = document.getElementById('projectsCarousel');
    if (projectTrack) {
      const projectCards = Array.from(projectTrack.querySelectorAll('.project-card'));
      const previousButton = document.getElementById('projectPrev');
      const nextButton = document.getElementById('projectNext');
      const counter = document.getElementById('projectSlideCount');
      let activeProject = 0;

      const getClosestProject = () => {
        if (!projectCards.length) return 0;
        const trackRect = projectTrack.getBoundingClientRect();
        let closestIndex = 0;
        let closestDistance = Infinity;
        projectCards.forEach((card, index) => {
          const distance = Math.abs(card.getBoundingClientRect().left - trackRect.left);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });
        return closestIndex;
      };

      const updateCarousel = (index = getClosestProject()) => {
        if (!projectCards.length) return;
        activeProject = Math.max(0, Math.min(index, projectCards.length - 1));
        if (counter) counter.textContent = `Project ${activeProject + 1} of ${projectCards.length}`;
        if (previousButton) previousButton.disabled = activeProject === 0;
        if (nextButton) nextButton.disabled = activeProject === projectCards.length - 1;
      };

      const goToProject = (index) => {
        if (!projectCards.length) return;
        const targetIndex = Math.max(0, Math.min(index, projectCards.length - 1));
        projectCards[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        updateCarousel(targetIndex);
      };

      if (previousButton) previousButton.addEventListener('click', () => goToProject(getClosestProject() - 1));
      if (nextButton) nextButton.addEventListener('click', () => goToProject(getClosestProject() + 1));
      projectTrack.addEventListener('scroll', () => window.requestAnimationFrame(() => updateCarousel()));
      projectTrack.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') { event.preventDefault(); goToProject(getClosestProject() + 1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); goToProject(getClosestProject() - 1); }
      });
      updateCarousel(0);
    }

    // Certificate lightbox
    const lightbox = document.getElementById('certificateLightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');
    let previouslyFocused = null;

    const closeLightbox = () => {
      if (!lightbox) return;
      lightbox.classList.remove('active', 'is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') previouslyFocused.focus();
    };

    document.querySelectorAll('.certificate-card').forEach((card) => {
      card.addEventListener('click', () => {
        const image = card.querySelector('img');
        if (!image || !lightbox || !lightboxImage) return;
        previouslyFocused = card;
        lightboxImage.src = image.currentSrc || image.src;
        lightboxImage.alt = image.alt || 'Certificate preview';
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (lightboxClose) lightboxClose.focus();
      });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeLightbox();
    });

    // Local mock-interview video preview
    const videoInput = document.getElementById('mockInterviewUpload');
    const video = document.getElementById('mockInterviewVideo');
    const videoSource = document.getElementById('mockInterviewSource');
    const videoPlaceholder = document.getElementById('mockVideoPlaceholder');
    const videoStatus = document.getElementById('mockVideoStatus');
    let currentVideoUrl = null;

    if (videoInput && video && videoPlaceholder && videoStatus) {
      videoInput.addEventListener('change', () => {
        const file = videoInput.files && videoInput.files[0];
        if (!file) return;
        if (!file.type.startsWith('video/')) {
          videoStatus.textContent = 'Please choose a valid video file.';
          videoInput.value = '';
          return;
        }
        if (currentVideoUrl) URL.revokeObjectURL(currentVideoUrl);
        currentVideoUrl = URL.createObjectURL(file);
        if (videoSource) videoSource.removeAttribute('src');
        video.src = currentVideoUrl;
        video.load();
        video.style.display = 'block';
        videoPlaceholder.style.display = 'none';
        videoStatus.textContent = `Selected: ${file.name}. This preview is local to your browser and is not uploaded to the website.`;
      });

      window.addEventListener('beforeunload', () => {
        if (currentVideoUrl) URL.revokeObjectURL(currentVideoUrl);
      });
    }

    // Small reveal animation for elements marked with .reveal (optional)
    const revealItems = document.querySelectorAll('.reveal');
    if (revealItems.length && 'IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealItems.forEach((item) => revealObserver.observe(item));
    }
  });
})();
