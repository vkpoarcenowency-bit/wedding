/* ============================================================
   ISABELLA & ALEXANDER — WEDDING INVITATION
   ------------------------------------------------------------
   WEDDING DATA lives in the object below. Edit it once and the
   countdown, the calendar file, and the footer all follow.
   ============================================================ */
const WEDDING = {
  bride: 'Isabella Marie Bennett',
  groom: 'Alexander James Carter',
  // The ceremony moment in Philippine time (UTC+8): 3:30 PM, June 20, 2027
  dateISO: '2027-06-20T15:30:00+08:00',
  dateLabel: 'June 20, 2027',
  city: 'Tagaytay City',
  venue: 'The Rosewood Estate'
};

/* ---------- 1. background music ----------
   Browsers block sound until the guest interacts with the page, so
   the track starts on the OPEN OUR INVITATION button (or the skip
   link) and fades in gently. The floating toggle pauses it.
   Change the track by editing MUSIC.src below. */
const MUSIC = {
  src: 'https://vkpoarcenowency-bit.github.io/index/bgmusic.mp3',
  volume: 0.4
};

const bgMusic = (function initMusic(){
  const audio = document.getElementById('bg-music');
  const toggle = document.getElementById('music-toggle');
  const label = document.getElementById('music-label');
  if (!audio || !toggle) return null;

  audio.src = MUSIC.src;
  audio.loop = true;
  audio.volume = 0;

  let playing = false;
  let fade = null;

  function fadeTo(target, done){
    window.clearInterval(fade);
    const step = (target - audio.volume) / 24;
    fade = window.setInterval(function(){
      let next = audio.volume + step;
      if ((step > 0 && next >= target) || (step < 0 && next <= target)){
        next = target;
        window.clearInterval(fade);
        if (done) done();
      }
      audio.volume = Math.max(0, Math.min(1, next));
    }, 40);
  }

  function setState(on){
    playing = on;
    toggle.classList.toggle('is-muted', !on);
    toggle.setAttribute('aria-pressed', String(on));
    toggle.setAttribute('aria-label', on ? 'Pause background music' : 'Play background music');
    toggle.setAttribute('title', on ? 'Pause background music' : 'Play background music');
    if (label) label.textContent = on ? 'Pause background music' : 'Play background music';
  }

  function start(){
    const attempt = audio.play();
    if (attempt && typeof attempt.then === 'function'){
      attempt.then(function(){
        setState(true);
        fadeTo(MUSIC.volume);
      }).catch(function(){
        // the browser refused or the file could not load — stay silent
        setState(false);
        toggle.classList.add('is-unavailable');
      });
    } else {
      setState(true);
      fadeTo(MUSIC.volume);
    }
  }

  toggle.addEventListener('click', function(){
    if (playing){
      fadeTo(0, function(){ audio.pause(); });
      setState(false);
    } else {
      start();
    }
  });

  // keep the button honest if playback stops for any other reason
  audio.addEventListener('pause', function(){ if (playing) setState(false); });

  return { start: start };
})();

/* ---------- 2. opening screen ---------- */
(function initIntro(){
  const intro = document.getElementById('intro');
  let gone = false;

  function dismiss(){
    if (gone) return;
    gone = true;
    if (bgMusic) bgMusic.start();
    intro.classList.add('is-leaving');
    document.body.classList.remove('is-locked');
    window.setTimeout(function(){ intro.style.display = 'none'; }, 1000);
  }

  window.scrollTo(0, 0);
  requestAnimationFrame(function(){ intro.classList.add('is-ready'); });

  document.getElementById('open-btn').addEventListener('click', dismiss);
  document.getElementById('skip-btn').addEventListener('click', dismiss);
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') dismiss();
  });
})();

/* ---------- 2. elegant placeholders for missing photos ----------
   A missing file never shows a broken image. The frame shows a
   quiet plum panel naming the file it is waiting for instead. */
function frameFor(img){
  return img.closest('.frame') || img.parentElement;
}
function flagMissing(img){
  const frame = frameFor(img);
  if (frame && frame.classList.contains('frame')) frame.classList.add('is-missing');
}
function checkImage(img){
  if (!img) return;
  img.addEventListener('error', function(){ flagMissing(img); });
  if (img.complete && img.naturalWidth === 0) flagMissing(img);
}
function checkAllImages(){
  document.querySelectorAll('img[data-placeholder]').forEach(function(img){
    if (img.complete && img.naturalWidth === 0) flagMissing(img);
  });
}
document.querySelectorAll('img[data-placeholder]').forEach(checkImage);
window.addEventListener('load', checkAllImages);

/* ---------- 3. navigation, drawer, active link, map buttons ---------- */
(function initNav(){
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const drawer = document.getElementById('drawer');
  const toTop = document.getElementById('totop');
  const links = Array.prototype.slice.call(document.querySelectorAll('#nav .navlinks a'));
  const watched = ['top', 'story', 'details', 'schedule', 'gallery', 'rsvp'];

  function onScroll(){
    const y = window.scrollY || window.pageYOffset;
    nav.classList.toggle('solid', y > 40);
    toTop.classList.toggle('show', y > 700);

    let current = 'top';
    for (let i = 0; i < watched.length; i++){
      const el = document.getElementById(watched[i]);
      if (el && el.getBoundingClientRect().top <= 140) current = watched[i];
    }
    links.forEach(function(a){
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setDrawer(open){
    drawer.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('is-locked', open);
  }
  burger.addEventListener('click', function(){ setDrawer(!drawer.classList.contains('open')); });
  drawer.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){ setDrawer(false); });
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && drawer.classList.contains('open')) setDrawer(false);
  });

  /* Venue buttons resolve to a clearly labelled map SEARCH, so no
     fictional address is ever presented as a verified real place. */
  document.querySelectorAll('[data-map]').forEach(function(btn){
    btn.setAttribute('href', 'https://www.google.com/maps/search/?api=1&query=' + btn.getAttribute('data-map'));
    btn.setAttribute('target', '_blank');
    btn.setAttribute('rel', 'noopener noreferrer');
  });

  toTop.addEventListener('click', function(){ window.scrollTo({ top: 0, behavior: 'smooth' }); });
  document.getElementById('back-top').addEventListener('click', function(){
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ---------- 4. scroll reveals ---------- */
(function initReveal(){
  const items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (!('IntersectionObserver' in window)){
    items.forEach(function(el){ el.classList.add('is-in'); });
    return;
  }
  const io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry, i){
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.style.transitionDelay = Math.min(i * 90, 320) + 'ms';
      el.classList.add('is-in');
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  items.forEach(function(el){ io.observe(el); });
})();

/* ---------- 5. countdown to forever ---------- */
(function initCountdown(){
  const section = document.getElementById('countdown');
  const target = new Date(WEDDING.dateISO).getTime();
  const out = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    minutes: document.getElementById('cd-minutes'),
    seconds: document.getElementById('cd-seconds')
  };

  function paint(el, value){
    const text = value < 10 ? '0' + value : String(value);
    if (el.textContent === text) return;
    el.classList.add('flip');
    window.setTimeout(function(){
      el.textContent = text;
      el.classList.remove('flip');
    }, 180);
  }

  function tick(){
    const diff = target - Date.now();
    if (diff <= 0){ section.classList.add('done'); return false; }
    const secs = Math.floor(diff / 1000);
    paint(out.days, Math.floor(secs / 86400));
    paint(out.hours, Math.floor((secs % 86400) / 3600));
    paint(out.minutes, Math.floor((secs % 3600) / 60));
    paint(out.seconds, secs % 60);
    return true;
  }

  if (!tick()) return;
  const timer = window.setInterval(function(){ if (!tick()) window.clearInterval(timer); }, 1000);
})();

/* ---------- 6. gallery lightbox ---------- */
(function initLightbox(){
  const box = document.getElementById('lightbox');
  const img = document.getElementById('lb-img');
  const cap = document.getElementById('lb-cap');
  const shots = Array.prototype.slice.call(document.querySelectorAll('img[data-gallery]'));
  let index = 0;
  let lastFocus = null;

  if (!shots.length) return;

  function placeholderFor(source){
    const frame = frameFor(source);
    return frame.classList.contains('is-missing');
  }

  function show(i){
    index = (i + shots.length) % shots.length;
    const source = shots[index];
    const missing = placeholderFor(source);
    img.style.display = missing ? 'none' : 'block';
    if (!missing) img.src = source.src;
    img.alt = source.alt || '';
    cap.textContent = source.getAttribute('data-caption') || '';
  }

  function open(i){
    lastFocus = document.activeElement;
    show(i);
    box.classList.add('open');
    document.body.classList.add('is-locked');
  }
  function close(){
    box.classList.remove('open');
    document.body.classList.remove('is-locked');
    if (lastFocus) lastFocus.focus();
  }

  shots.forEach(function(source, i){
    const clickable = source.closest('.frame').parentElement;
    clickable.setAttribute('tabindex', '0');
    clickable.setAttribute('role', 'button');
    clickable.addEventListener('click', function(){ open(i); });
    clickable.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(i); }
    });
  });

  document.getElementById('lb-close').addEventListener('click', close);
  document.getElementById('lb-prev').addEventListener('click', function(e){ e.stopPropagation(); show(index - 1); });
  document.getElementById('lb-next').addEventListener('click', function(e){ e.stopPropagation(); show(index + 1); });
  box.addEventListener('click', function(e){ if (e.target === box) close(); });
  document.addEventListener('keydown', function(e){
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
})();

/* ---------- 7. FAQ accordion ---------- */
(function initFaq(){
  const items = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));
  items.forEach(function(item){
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', function(){
      const wasOpen = item.classList.contains('open');
      items.forEach(function(other){
        other.classList.remove('open');
        other.querySelector('.faq-a').style.maxHeight = '0px';
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen){
        item.classList.add('open');
        a.style.maxHeight = (a.scrollHeight + 40) + 'px';
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();

/* ---------- 8. radio pill styling ---------- */
(function initRadios(){
  document.querySelectorAll('.radios input').forEach(function(input){
    input.addEventListener('change', function(){
      document.querySelectorAll('.radios label').forEach(function(label){
        label.classList.toggle('on', label.querySelector('input').checked);
      });
    });
  });
})();

/* ---------- 9. RSVP form (demonstration — nothing is sent) ---------- */
(function initRsvp(){
  const form = document.getElementById('rsvp-form');
  const hint = document.getElementById('rsvp-hint');
  const success = document.getElementById('rsvp-success');
  const head = document.getElementById('rsvp-head');
  const text = document.getElementById('rsvp-text');

  function fail(message, fields){
    hint.textContent = message;
    hint.classList.add('show');
    (fields || []).forEach(function(f){ f.classList.add('err'); });
  }

  form.querySelectorAll('input, select, textarea').forEach(function(f){
    f.addEventListener('input', function(){ f.classList.remove('err'); });
    f.addEventListener('change', function(){ f.classList.remove('err'); });
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    hint.classList.remove('show');
    form.querySelectorAll('.err').forEach(function(f){ f.classList.remove('err'); });

    const name = document.getElementById('r-name');
    const email = document.getElementById('r-email');
    const attending = form.querySelector('input[name="attending"]:checked');

    if (!name.value.trim()){ fail('Kindly add your full name so we know who is coming.', [name]); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())){
      fail('Please enter a valid email address so we can reach you.', [email]); return;
    }

    const yes = attending && attending.value === 'Joyfully accepts';
    head.textContent = yes ? 'You\u2019ve made our hearts happy' : 'We will miss you dearly';
    text.textContent = yes
      ? '\u201CThank you for being part of our story. We cannot wait to celebrate this beautiful day with you.\u201D'
      : '\u201CThank you for letting us know. You will be in our thoughts on the day, and we will save you a dance at the next celebration.\u201D';

    form.style.display = 'none';
    success.classList.add('show');
    success.focus();
  });

  document.getElementById('rsvp-again').addEventListener('click', function(){
    form.reset();
    form.querySelectorAll('.radios input').forEach(function(input, i){
      input.checked = i === 0;
      input.closest('label').classList.toggle('on', i === 0);
    });
    hint.classList.remove('show');
    success.classList.remove('show');
    form.style.display = '';
    window.scrollTo({
      top: document.getElementById('rsvp').offsetTop + 120,
      behavior: 'smooth'
    });
  });
})();

/* ---------- 10. guestbook (demonstration — nothing is saved) ---------- */
(function initGuestbook(){
  const form = document.getElementById('gb-form');
  const hint = document.getElementById('gb-hint');
  const success = document.getElementById('gb-success');
  const name = document.getElementById('g-name');
  const msg = document.getElementById('g-msg');

  [name, msg].forEach(function(f){
    f.addEventListener('input', function(){ f.classList.remove('err'); hint.classList.remove('show'); });
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    hint.classList.remove('show');
    form.querySelectorAll('.err').forEach(function(f){ f.classList.remove('err'); });

    if (!name.value.trim()){ hint.textContent = 'Kindly add your name so we know who to thank.'; hint.classList.add('show'); name.classList.add('err'); return; }
    if (!msg.value.trim()){ hint.textContent = 'Your message is empty \u2014 a wish or a memory is all we need.'; hint.classList.add('show'); msg.classList.add('err'); return; }

    form.style.display = 'none';
    success.classList.add('show');
  });
})();

/* ---------- 11. "Save the date" calendar file ----------
   Built in the browser, so the .ics always matches WEDDING above. */
(function initCalendar(){
  const link = document.querySelector('a[href$=".ics"]');
  if (!link) return;

  function stamp(iso){
    return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  const start = stamp(WEDDING.dateISO);
  const end = stamp(new Date(new Date(WEDDING.dateISO).getTime() + 5 * 3600 * 1000).toISOString());

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Invitation//Isabella and Alexander//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'UID:' + start + '-isabella-alexander@wedding',
    'DTSTAMP:' + start,
    'DTSTART:' + start,
    'DTEND:' + end,
    'SUMMARY:The Wedding of ' + WEDDING.bride + ' and ' + WEDDING.groom,
    'LOCATION:' + WEDDING.venue + ', ' + WEDDING.city + ', Philippines',
    'DESCRIPTION:Ceremony at 3:30 PM and reception at 5:30 PM. We cannot wait to celebrate with you.',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  link.setAttribute('href', URL.createObjectURL(blob));
  link.setAttribute('download', 'isabella-and-alexander.ics');
})();
