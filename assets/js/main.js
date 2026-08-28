(function () {
  'use strict';

  var WPP = '5511983868212';

  /* ano do rodapé */
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* máscara de telefone */
  var tel = document.getElementById('telefone');
  if (tel) {
    tel.addEventListener('input', function () {
      var v = tel.value.replace(/\D/g, '').slice(0, 11);
      var out = v;
      if (v.length > 2) out = '(' + v.slice(0, 2) + ') ' + v.slice(2);
      if (v.length > 7) {
        out = v.length === 11
          ? '(' + v.slice(0, 2) + ') ' + v.slice(2, 3) + ' ' + v.slice(3, 7) + '-' + v.slice(7)
          : '(' + v.slice(0, 2) + ') ' + v.slice(2, 6) + '-' + v.slice(6);
      }
      tel.value = out;
      tel.setCustomValidity(v.length >= 10 ? '' : 'Telefone incompleto');
    });
  }

  /* validação + envio */
  var form = document.getElementById('formOrcamento');
  var btn = document.getElementById('btnEnviar');

  function checa() {
    if (!form || !btn) return;
    btn.disabled = !form.checkValidity();
  }

  if (form && btn) {
    form.addEventListener('input', checa);
    form.addEventListener('change', checa);
    checa();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { checa(); return; }

      var d = new FormData(form);
      var linhas = [
        'Olá! Vim pelo site e gostaria de um orçamento.',
        '',
        'Nome: ' + d.get('nome'),
        'WhatsApp: ' + d.get('telefone'),
        'Cidade/bairro: ' + d.get('cidade'),
        'Ambiente: ' + d.get('ambiente'),
        'Material: ' + d.get('material'),
        'Etapa da obra: ' + d.get('etapa')
      ];
      var msg = (d.get('mensagem') || '').trim();
      if (msg) linhas.push('Detalhes: ' + msg);

      if (window.dataLayer) {
        window.dataLayer.push({ event: 'gerar_lead', origem: 'formulario_orcamento' });
      }

      window.open('https://wa.me/' + WPP + '?text=' + encodeURIComponent(linhas.join('\n')), '_blank');
    });
  }

  /* eventos de clique nos CTAs */
  document.querySelectorAll('[data-cta]').forEach(function (el) {
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
        behavior: 'smooth'
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
