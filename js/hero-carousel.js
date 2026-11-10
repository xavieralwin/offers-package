(function () {
  'use strict';

  const countrySelect = document.getElementById('countrySelect');
  const languageSelect = document.getElementById('languageSelect');
  const carousel = document.getElementById('heroCarousel');
  const fallback = document.getElementById('heroFallback');
  const slideEls = Array.from(document.querySelectorAll('.hero-slide'));
  const contentEl = document.getElementById('heroCarouselContent');
  const titleEl = document.getElementById('heroSlideTitle');
  const subtitleEl = document.getElementById('heroSlideSubtitle');
  const dots = Array.from(document.querySelectorAll('[data-slide-to]'));
  const prev = document.getElementById('heroPrev');
  const next = document.getElementById('heroNext');

  if (!countrySelect || !languageSelect || !carousel || !fallback || slideEls.length !== 4 || !contentEl || !titleEl || !subtitleEl) return;

  const MARKET_SLIDES = {
    SG: {
      EN: [
        {
          title: 'Shop Smart with Citi',
          subtitle: 'Shop smart, save big! Elevate your shopping with Citi Cards.',
          image: 'https://www.citiworldprivileges.com/data/images/hpg_banners/5_SG_en.jpg',
          position: 'center 49%'
        },
        {
          title: 'Where to next with Citi?',
          subtitle: 'Explore more for less! Discover incredible travel deals with Citi Cards.',
          image: 'https://www.citiworldprivileges.com/data/images/hpg_banners/6_SG_en.jpg',
          position: 'center 52%'
        },
        {
          title: 'Citi Gourmet Pleasures',
          subtitle: 'Delicious deals for every craving. Indulge more with Citi Cards.',
          image: 'https://www.citiworldprivileges.com/data/images/hpg_banners/7_SG_en.jpg',
          position: 'center 47%'
        },
        {
          title: 'Wedding Privileges',
          subtitle: 'Say "I Do" to incredible value! Enjoy exclusive wedding deals with Citi Cards.',
          image: 'https://www.citiworldprivileges.com/data/images/hpg_banners/8_SG_en.jpg',
          position: 'center 50%'
        }
      ]
    },
    HK: {
      EN: [
        {
          title: 'Enjoy Everyday Dining Deals',
          subtitle: '',
          image: 'https://www.citiworldprivileges.com/data/images/hpg_banners/13_HK_en.jpg',
          position: 'center center'
        },
        {
          title: 'Citi World Privileges',
          subtitle: 'Discover Great Deals with your Citi Card',
          image: 'https://www.citiworldprivileges.com/data/images/hpg_banners/9_HK_en.jpg',
          position: 'center center'
        },
        {
          title: 'Notebook Ownership Program',
          subtitle: 'Get exclusive institutional deals with Citi',
          image: 'https://www.citiworldprivileges.com/data/images/hpg_banners/14_HK_en.jpg',
          position: 'center center'
        },
        {
          title: 'Reimagine Journeys with Citi',
          subtitle: 'Explore Citi Travel Privileges',
          image: 'https://www.citiworldprivileges.com/data/images/hpg_banners/11_HK_en.jpg',
          position: 'center center'
        }
      ],
      CN: [
        {
          title: '每日賞餐飲優惠',
          subtitle: '',
          image: 'https://www.citiworldprivileges.com/data/images/hpg_banners/13_HK_en.jpg',
          position: 'center center'
        },
        {
          title: 'Citi環球禮遇',
          subtitle: '憑Citi信用卡盡享不同禮遇',
          image: 'https://www.citiworldprivileges.com/data/images/hpg_banners/9_HK_en.jpg',
          position: 'center center'
        },
        {
          title: '大學手提電腦優惠計劃',
          subtitle: '盡享Citi專屬學界優惠',
          image: 'https://www.citiworldprivileges.com/data/images/hpg_banners/14_HK_en.jpg',
          position: 'center center'
        },
        {
          title: '與Citi開啟旅遊新視角',
          subtitle: '盡享Citi旅遊禮遇',
          image: 'https://www.citiworldprivileges.com/data/images/hpg_banners/11_HK_en.jpg',
          position: 'center center'
        }
      ]
    }
  };

  const ROTATION_INTERVAL_MS = 3000;
  let activeSlides = MARKET_SLIDES.SG.EN;
  let imageReady = [false, false, false, false];
  let activeIndex = -1;
  let pendingIndex = 0;
  let timerId = null;
  let marketLoadToken = 0;

  function stopTimer() {
    if (timerId !== null) {
      window.clearTimeout(timerId);
      timerId = null;
    }
  }

  function updateDots(index) {
    dots.forEach(function (element, dotIndex) {
      const active = dotIndex === index;
      element.classList.toggle('is-active', active);
      if (active) element.setAttribute('aria-current', 'true');
      else element.removeAttribute('aria-current');
    });
  }

  function animateTextAfterPaint() {
    contentEl.classList.remove('is-text-visible');
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        contentEl.classList.add('is-text-visible');
      });
    });
  }

  function scheduleNext() {
    stopTimer();
    if (document.hidden || activeIndex < 0) return;
    timerId = window.setTimeout(function () {
      requestSlide(activeIndex + 1);
    }, ROTATION_INTERVAL_MS);
  }

  function activateSlide(index) {
    activeIndex = index;
    pendingIndex = -1;
    const slide = activeSlides[index];
    titleEl.textContent = slide.title;
    subtitleEl.textContent = slide.subtitle;
    subtitleEl.hidden = !slide.subtitle;

    slideEls.forEach(function (element, slideIndex) {
      const active = slideIndex === index;
      element.classList.toggle('is-active', active);
      element.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    updateDots(index);
    animateTextAfterPaint();
    scheduleNext();
  }

  function requestSlide(index) {
    const target = ((index % activeSlides.length) + activeSlides.length) % activeSlides.length;
    stopTimer();
    pendingIndex = target;
    if (imageReady[target]) activateSlide(target);
  }

  function preloadMarketSlides(country, language) {
    const token = ++marketLoadToken;
    stopTimer();
    const selectedCountry = country === 'HK' ? 'HK' : 'SG';
    const selectedLanguage = selectedCountry === 'HK' && language === 'CN' ? 'CN' : 'EN';
    activeSlides = MARKET_SLIDES[selectedCountry][selectedLanguage];
    imageReady = [false, false, false, false];
    activeIndex = -1;
    pendingIndex = 0;
    contentEl.classList.remove('is-text-visible');
    titleEl.textContent = '';
    subtitleEl.textContent = '';
    subtitleEl.hidden = true;
    slideEls.forEach(function (element, index) {
      const slide = activeSlides[index];
      element.style.backgroundImage = 'linear-gradient(90deg, rgba(0, 0, 0, .72) 0%, rgba(0, 0, 0, .48) 38%, rgba(0, 0, 0, .08) 80%), url("' + slide.image + '")';
      element.style.backgroundPosition = slide.position;
      element.classList.remove('hero-slide--image-unavailable');
      element.classList.toggle('is-active', index === 0);
      element.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
    });
    updateDots(0);

    activeSlides.forEach(function (slide, index) {
      const image = new Image();
      function ready(loaded) {
        if (token !== marketLoadToken) return;
        imageReady[index] = true;
        if (!loaded) slideEls[index].classList.add('hero-slide--image-unavailable');
        if (pendingIndex === index) activateSlide(index);
      }
      image.onload = function () { ready(true); };
      image.onerror = function () { ready(false); };
      image.src = slide.image;
      if (image.complete) ready(image.naturalWidth > 0);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      const requested = Number(dot.getAttribute('data-slide-to'));
      requestSlide(Number.isInteger(requested) ? requested : 0);
    });
  });
  if (prev) prev.addEventListener('click', function () { requestSlide(activeIndex <= 0 ? activeSlides.length - 1 : activeIndex - 1); });
  if (next) next.addEventListener('click', function () { requestSlide(activeIndex < 0 ? 0 : activeIndex + 1); });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopTimer();
    else scheduleNext();
  });
  countrySelect.addEventListener('change', function () {
    preloadMarketSlides(countrySelect.value, languageSelect.value);
  });
  languageSelect.addEventListener('change', function () {
    preloadMarketSlides(countrySelect.value, languageSelect.value);
  });

  contentEl.classList.remove('is-text-visible');
  preloadMarketSlides(countrySelect.value, languageSelect.value);
})();
