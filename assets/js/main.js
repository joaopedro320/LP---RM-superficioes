(function () {
  'use strict';

  var WPP = '5511983868212';

  /* ano do rodapé */
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* eventos de clique nos CTAs */
  document.querySelectorAll('a[href*="wa.me"][data-cta]').forEach(function (el) {
    el.addEventListener('click', function () {
      if (window.dataLayer) {
        window.dataLayer.push({ event: 'clique_whatsapp', origem: el.getAttribute('data-cta') });
      }
    });
  });

  /* carrossel de projetos */
  var track = document.getElementById('track');
  if (track) {
    var slides = Array.prototype.slice.call(track.querySelectorAll('.slide'));
    var dots = document.getElementById('dots');
    var prev = document.getElementById('prev');
    var next = document.getElementById('next');

    slides.forEach(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'dot' + (i === 0 ? ' is-on' : '');
      b.setAttribute('aria-label', 'Ir para o projeto ' + (i + 1));
      b.addEventListener('click', function () { irPara(i); });
      dots.appendChild(b);
    });

    function irPara(i) {
      var s = slides[i];
      if (!s) return;
      track.scrollTo({
        left: s.offsetLeft - (track.clientWidth - s.clientWidth) / 2,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
    }

    function atual() {
      var meio = track.scrollLeft + track.clientWidth / 2;
      var idx = 0, menor = Infinity;
      slides.forEach(function (s, i) {
        var d = Math.abs(s.offsetLeft + s.clientWidth / 2 - meio);
        if (d < menor) { menor = d; idx = i; }
      });
      return idx;
    }

    var tick;
    track.addEventListener('scroll', function () {
      clearTimeout(tick);
      tick = setTimeout(function () {
        var i = atual();
        dots.querySelectorAll('.dot').forEach(function (d, k) {
          d.classList.toggle('is-on', k === i);
        });
      }, 90);
    }, { passive: true });

    if (prev) prev.addEventListener('click', function () { irPara(Math.max(0, atual() - 1)); });
    if (next) next.addEventListener('click', function () { irPara(Math.min(slides.length - 1, atual() + 1)); });
  }

  /* Ampliação acessível das fotografias, com navegação por teclado. */
  var dialog = document.getElementById('lightbox');
  var photos = Array.from(document.querySelectorAll('.slide img, .card__photo, .service-photo, .split__img img, .hero__img img'));
  var activePhoto = 0;
  var lastTrigger;
  function showPhoto(index) {
    activePhoto = (index + photos.length) % photos.length;
    var source = photos[activePhoto];
    dialog.querySelector('img').src = source.src;
    dialog.querySelector('img').alt = source.alt;
  }
  if (dialog && typeof dialog.showModal === 'function') {
    photos.forEach(function (photo, index) {
      var trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'image-trigger';
      trigger.setAttribute('aria-label', 'Ampliar imagem: ' + photo.alt);
      trigger.setAttribute('aria-haspopup', 'dialog');
      if (photo.classList.contains('card__photo')) {
        photo.classList.remove('card__photo');
        trigger.classList.add('card__photo');
      }
      photo.parentNode.insertBefore(trigger, photo);
      trigger.appendChild(photo);
      trigger.addEventListener('click', function () {
        lastTrigger = trigger;
        showPhoto(index);
        dialog.showModal();
        document.body.classList.add('has-lightbox');
      });
    });
    dialog.querySelector('.lightbox__close').addEventListener('click', function () { dialog.close(); });
    document.getElementById('lightbox-prev').addEventListener('click', function () { showPhoto(activePhoto - 1); });
    document.getElementById('lightbox-next').addEventListener('click', function () { showPhoto(activePhoto + 1); });
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); showPhoto(activePhoto - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); showPhoto(activePhoto + 1); }
    });
    dialog.addEventListener('click', function (e) {
      var rect = dialog.getBoundingClientRect();
      if (e.target === dialog && (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom)) dialog.close();
    });
    dialog.addEventListener('close', function () {
      document.body.classList.remove('has-lightbox');
      if (lastTrigger) lastTrigger.focus({ preventScroll: true });
    });
  }

  /* reveal no scroll */
  var alvos = document.querySelectorAll('.section .wrap, .hero__text, .hero__img');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    alvos.forEach(function (el) { el.classList.add('rv'); io.observe(el); });
  }
})();
