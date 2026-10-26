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

  // Home: VTOL lifts off near the Hokie Bird and climbs behind the name as the page scrolls.
  // It flies along the render's own nose heading (about 18 degrees nose-up), so the flight path and trail line up with the airframe.
  var hero = document.querySelector('.hero-band');
  var drone = document.querySelector('.flyer');
  var bird = document.querySelector('.hero-bird img');
  var name = document.querySelector('.hero-name');
  if (hero && drone && bird && name) {
    var trail = drone.querySelector('.trail');
    var heading = 17.8 * Math.PI / 180;
    var cosH = Math.cos(heading), tanH = Math.tan(heading);
    var ticking = false;
    var place = function () {
      ticking = false;
      var hr = hero.getBoundingClientRect();
      var br = bird.getBoundingClientRect();
      var nr = name.getBoundingClientRect();
      var W = drone.offsetWidth, H = drone.offsetHeight;
      var nTop = nr.top - hr.top, nBot = nr.bottom - hr.top, nLeft = nr.left - hr.left, nRight = nr.right - hr.left;
      var target = { x: nLeft + (nRight - nLeft) * 0.62, y: nTop + (nBot - nTop) * 0.7 };
      var birdBesideName = br.top - nr.bottom < 300;
      var x0 = birdBesideName ? br.left - hr.left - W * 0.05 : hr.width + W * 0.6;
      var y0 = target.y + (x0 - target.x) * tanH;
      var xEnd = -W * 0.7;
      var length = (x0 - xEnd) / cosH;
      var scrolled = Math.max(0, -hr.top);
      var dist = Math.max(360, Math.min(560, window.innerHeight * 0.6));
      var p = reduce ? 0 : Math.min(1, scrolled / dist);
      var travel = p * length;
      var x = x0 - travel * cosH;
      var y = y0 - travel * Math.sin(heading);
      var s = 0.42 + 0.73 * p;
      drone.style.transform = 'translate(' + (x - W / 2).toFixed(1) + 'px,' + (y - H / 2).toFixed(1) + 'px) scale(' + s.toFixed(3) + ')';
      if (trail) trail.style.opacity = (Math.min(1, p * 6) * (1 - Math.max(0, p - 0.75) * 4) * 0.9).toFixed(2);
      drone.classList.add('ready');
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(place); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('load', place);
    if (bird.complete) place(); else bird.addEventListener('load', place);
  }
})();
