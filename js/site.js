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

  // Schedule: draws bars from each row's dates and fills them in up to today.
  document.querySelectorAll('.gantt').forEach(function (g) {
    var day = 864e5;
    var parse = function (s) { var p = s.split('-'); return new Date(+p[0], p[1] - 1, +p[2]); };
    var t0 = parse(g.dataset.start), t1 = parse(g.dataset.end), span = t1 - t0;
    var now = new Date(); now.setHours(12, 0, 0, 0);
    var pct = function (d) { return Math.max(0, Math.min(100, (d - t0) / span * 100)); };
    var list = g.querySelector('.g-list');
    var fmt = function (d) { return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };

    var head = document.createElement('li');
    head.className = 'g-head';
    head.innerHTML = '<span class="g-name">Task</span><div class="g-track"><div class="g-months"></div></div>';
    var months = head.querySelector('.g-months');
    var grid = document.createElement('div');
    grid.className = 'g-grid';
    for (var m = new Date(t0.getFullYear(), t0.getMonth() + 1, 1); m < t1; m = new Date(m.getFullYear(), m.getMonth() + 1, 1)) {
      var label = document.createElement('span');
      label.style.left = pct(m) + '%';
      label.textContent = m.toLocaleDateString('en-US', { month: 'short' }) + (m.getMonth() === 0 || !months.children.length ? ' ' + m.getFullYear() : '');
      months.appendChild(label);
      var line = document.createElement('b');
      line.style.left = pct(m) + '%';
      grid.appendChild(line);
    }

    var nextMs = null;
    list.querySelectorAll('li').forEach(function (li) {
      var s = parse(li.dataset.start), e = new Date(parse(li.dataset.end).getTime() + day);
      var type = li.dataset.type || 'task';
      var name = document.createElement('span');
      name.className = 'g-name';
      while (li.firstChild) name.appendChild(li.firstChild);
      var track = document.createElement('div');
      track.className = 'g-track';
      li.appendChild(name);
      li.appendChild(track);
      li.title = fmt(s) + (type === 'milestone' && li.dataset.start === li.dataset.end ? '' : ' to ' + fmt(new Date(e - day)));
      if (type === 'milestone') {
        li.classList.add('is-ms');
        var d = document.createElement('i');
        d.className = 'g-ms' + (now >= e ? ' done' : '');
        d.style.left = pct(s) + '%';
        track.appendChild(d);
        if (now < s && (!nextMs || s < nextMs.date)) nextMs = { date: s, name: name.textContent };
      } else {
        var bar = document.createElement('div');
        var f = Math.max(0, Math.min(1, (now - s) / (e - s)));
        bar.className = 'g-bar' + (type === 'buffer' ? ' buf' : '') + (f > 0 && f < 1 ? ' prog' : '');
        bar.style.left = pct(s) + '%';
        bar.style.width = (pct(e) - pct(s)) + '%';
        bar.innerHTML = '<i style="width:' + (f * 100).toFixed(1) + '%"></i>';
        track.appendChild(bar);
      }
    });
    list.insertBefore(head, list.firstChild);
    list.appendChild(grid);

    if (now > t0 && now < t1) {
      var today = document.createElement('div');
      today.className = 'g-today';
      today.style.left = pct(now) + '%';
      today.innerHTML = '<span>Today</span>';
      grid.appendChild(today);
    }
    var summary = document.querySelector('.g-summary');
    if (summary) {
      var done = Math.round(pct(now));
      summary.textContent = now >= t1 ? 'Project complete' :
        done + '% through the schedule' + (nextMs ? '. Next milestone: ' + nextMs.name + ', ' + nextMs.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '');
    }
  });

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
