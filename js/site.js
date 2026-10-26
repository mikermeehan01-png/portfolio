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

  // Home: VTOL lifts off near the Hokie Bird and climbs across the name as the page scrolls.
  // On desktop the hero is pinned for a short stretch so the flight plays out before the page moves on.
  var hero = document.querySelector('.hero-band');
  var drone = document.querySelector('.flyer');
  var bird = document.querySelector('.hero-bird img');
  var name = document.querySelector('.hero-name');
  var wrap = document.querySelector('.hero-pin');
  var space = document.querySelector('.pin-space');
  if (hero && drone && bird && name) {
    var trail = drone.querySelector('.trail');
    var ticking = false;
    var place = function () {
      ticking = false;
      var hr = hero.getBoundingClientRect();
      var br = bird.getBoundingClientRect();
      var nr = name.getBoundingClientRect();
      var W = drone.offsetWidth, H = drone.offsetHeight;
      var bx = br.left - hr.left, by = br.top - hr.top;
      var nTop = nr.top - hr.top, nBot = nr.bottom - hr.top, nRight = nr.right - hr.left;
      var p0 = { x: bx - W * 0.05, y: by - H * 0.15 };
      var p1 = { x: nRight * 0.9, y: nBot - (nBot - nTop) * 0.2 };
      var p2 = { x: -W * 0.75, y: nTop - H * 0.8 };
      var pin = space ? space.offsetHeight : 0;
      var scrolled, dist, follow;
      if (pin > 0) {
        var off = Math.max(0, hero.offsetHeight - window.innerHeight);
        hero.style.top = -off + 'px';
        scrolled = Math.max(0, -wrap.getBoundingClientRect().top - off);
        dist = pin;
        follow = 0;
      } else {
        hero.style.top = '';
        scrolled = Math.max(0, -hr.top);
        dist = Math.max(280, Math.min(420, hr.height * 0.4));
        follow = 0.5;
      }
      var p = reduce ? 0 : Math.min(1, scrolled / dist);
      var e = p * p * (3 - 2 * p);
      var u = 1 - e;
      var x = u * u * p0.x + 2 * u * e * p1.x + e * e * p2.x;
      var y = u * u * p0.y + 2 * u * e * p1.y + e * e * p2.y + Math.min(scrolled, dist) * follow * u;
      var dx = 2 * u * (p1.x - p0.x) + 2 * e * (p2.x - p1.x);
      var dy = 2 * u * (p1.y - p0.y) + 2 * e * (p2.y - p1.y);
      var climb = Math.atan2(-dy, -dx) * 180 / Math.PI;
      var tilt = e > 0 ? Math.max(-4, Math.min(14, climb * 0.5)) : 0;
      var s = 0.42 + 0.78 * e;
      drone.style.transform = 'translate(' + (x - W / 2).toFixed(1) + 'px,' + (y - H / 2).toFixed(1) + 'px) rotate(' + tilt.toFixed(2) + 'deg) scale(' + s.toFixed(3) + ')';
      if (trail) trail.style.opacity = (Math.sin(Math.PI * Math.min(1, e * 1.15)) * 0.95).toFixed(2);
      drone.classList.add('ready');
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(place); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('load', place);
    if (bird.complete) place(); else bird.addEventListener('load', place);
  }
})();
