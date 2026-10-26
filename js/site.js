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

  // Optional media: a figure marked data-optional stays hidden until its video file exists.
  document.querySelectorAll('figure[data-optional] video').forEach(function (v) {
    var fig = v.closest('figure');
    v.addEventListener('loadeddata', function () { fig.hidden = false; });
    v.load();
  });

  // Resume buttons only show once resume.pdf is in the site folder.
  var resumeLinks = document.querySelectorAll('.resume-link');
  if (resumeLinks.length && window.fetch) {
    fetch('resume.pdf', { method: 'HEAD' }).then(function (r) {
      if (r.ok) resumeLinks.forEach(function (a) { a.hidden = false; });
    }).catch(function () {});
  }

  // Home: VTOL flies across the hero, behind the name, as the page scrolls.
  var hero = document.querySelector('.hero-band');
  var drone = document.querySelector('.flyer');
  if (hero && drone && !reduce) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var r = hero.getBoundingClientRect();
      var dist = Math.max(320, Math.min(640, r.height * 0.9));
      var p = Math.max(0, Math.min(1, -r.top / dist));
      var e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      var travel = drone.offsetLeft + drone.offsetWidth;
      drone.style.transform = 'translate(' + (-travel * e).toFixed(1) + 'px,' + (e * 40).toFixed(1) + 'px) rotate(' + (-e * 3).toFixed(2) + 'deg)';
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }
})();
