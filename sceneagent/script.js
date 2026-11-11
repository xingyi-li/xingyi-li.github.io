(() => {
  const config = window.SCENEAGENT_CONFIG || {};
  const validUrl = (value) => {
    try { return ['https:', 'http:'].includes(new URL(value).protocol); }
    catch { return false; }
  };
  const youtubeId = /^[a-zA-Z0-9_-]{11}$/.test(config.youtubeId || '') ? config.youtubeId : '';
  const container = document.getElementById('video-container');
  let youtubeFrame = container.querySelector('iframe');
  const showYoutube = (start = 0, autoplay = false) => {
    if (!youtubeFrame) {
      youtubeFrame = document.createElement('iframe');
      youtubeFrame.title = 'SceneAgent project video';
      youtubeFrame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      youtubeFrame.allowFullscreen = true;
      container.replaceChildren(youtubeFrame);
    }
    youtubeFrame.src = `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&start=${start}&autoplay=${autoplay ? 1 : 0}`;
  };
  if (youtubeId) showYoutube();
  if (validUrl(config.paperUrl)) {
    document.querySelectorAll('a[href="assets/sceneagent-paper.pdf"]').forEach(link => { link.href = config.paperUrl; });
  }
  if (validUrl(config.codeUrl)) {
    const link = document.getElementById('code-link');
    link.href = config.codeUrl;
    link.target = '_blank';
    link.rel = 'noopener';
    document.getElementById('code-label').textContent = 'Code';
    link.hidden = false;
  }
  document.querySelectorAll('[data-time]').forEach(button => {
    button.addEventListener('click', () => {
      const seconds = Number(button.dataset.time);
      if (youtubeId) showYoutube(seconds, true);
      else {
        const video = document.getElementById('project-video');
        const seek = () => {
          video.currentTime = seconds;
          video.play().catch(() => {});
        };
        if (video.readyState >= 1) seek();
        else { video.addEventListener('loadedmetadata', seek, {once: true}); video.load(); }
      }
      container.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    });
  });
  // Reveal only after the observer is active; content stays visible without JS.
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.section-heading, .intro, .scene, .engine-pair, .method-figure, .method-steps, .results-layout').forEach(element => {
      // Elements already on screen do not animate or shift during initial load.
      if (element.getBoundingClientRect().top > window.innerHeight) {
        element.classList.add('reveal'); observer.observe(element);
      }
    });
  }
  const dialog = document.getElementById('image-dialog');
  document.querySelectorAll('[data-image]').forEach(button => {
    button.addEventListener('click', () => {
      const image = document.getElementById('dialog-image');
      image.src = button.dataset.image;
      image.alt = button.dataset.caption;
      document.getElementById('dialog-caption').textContent = button.dataset.caption;
      dialog.showModal();
      document.body.classList.add('dialog-open');
    });
  });
  document.getElementById('close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
  document.getElementById('copy-citation').addEventListener('click', async () => {
    const status = document.getElementById('copy-status');
    try {
      await navigator.clipboard.writeText(document.getElementById('bibtex').textContent);
      status.textContent = 'BibTeX copied.';
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(document.getElementById('bibtex'));
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Citation selected. Press Ctrl+C or ⌘C to copy.';
    }
  });
})();
