(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('video[autoplay]').forEach(function (v) {
    v.muted = true;
    if (reduce) { v.removeAttribute('autoplay'); v.pause(); v.controls = true; return; }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
          else v.pause();
        });
      }, { threshold: 0.15 }).observe(v);
    }
  });

  // Resume buttons only show once resume.pdf is in the site folder.
  var resumeLinks = document.querySelectorAll('.resume-link');
  if (resumeLinks.length && window.fetch) {
    fetch('resume.pdf', { method: 'HEAD' }).then(function (r) {
      if (r.ok) resumeLinks.forEach(function (a) { a.hidden = false; });
    }).catch(function () {});
  }

  // Home: VTOL flies off across the hero, trailing streaks, as soon as the page starts scrolling.
  var drone = document.querySelector('.flyer');
  if (drone && !reduce) {
    var flown = false;
    var check = function () {
      var down = window.scrollY > 8;
      if (down === flown) return;
      flown = down;
      if (down) drone.style.setProperty('--travel', -(drone.offsetLeft + drone.offsetWidth + 40) + 'px');
      drone.classList.remove('flying');
      void drone.offsetWidth;
      drone.classList.toggle('flown', down);
      if (down) drone.classList.add('flying');
    };
    window.addEventListener('scroll', check, { passive: true });
    check();
  }
})();
