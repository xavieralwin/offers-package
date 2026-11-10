/*
 * Citi World Privileges Offers browser
 * - Plain JavaScript; works from file:// without fetch or a build step.
 * - All offer data is inserted via textContent/DOM attributes, never as raw HTML.
 * - Category filters update the URL hash; search and pagination run client-side.
 */
(function () {
  'use strict';

  const singaporeOffers = Array.isArray(window.OFFERS_DATA) ? window.OFFERS_DATA : [];
  let offers = singaporeOffers;
  const countrySelectEl = document.getElementById('countrySelect');
  const languageSelectEl = document.getElementById('languageSelect');
  const countryFlagEl = document.getElementById('countryFlag');
  const countryLabelEl = document.querySelector('label[for="countrySelect"]');
  const languageLabelEl = document.querySelector('label[for="languageSelect"]');
  const homeLogoLinkEl = document.getElementById('homeLogoLink');
  const countryStateFlagEl = document.getElementById('countryStateFlag');
  const countryDataStateEl = document.getElementById('countryDataState');
  const countryDataStateTitleEl = document.getElementById('countryDataStateTitle');
  const countryDataStateMessageEl = document.getElementById('countryDataStateMessage');
  const categoryNavEl = document.querySelector('.category-filter');
  const resultsToolbarEl = document.getElementById('resultsToolbar');
  const offersRegionEl = document.getElementById('offersRegion');
  const pageFooterEl = document.getElementById('footer');
  const footerPlayStoreLinkEl = document.getElementById('footerPlayStoreLink');
  const footerPlayStoreImgEl = document.getElementById('footerPlayStoreImg');
  const footerAppStoreLinkEl = document.getElementById('footerAppStoreLink');
  const footerAppStoreImgEl = document.getElementById('footerAppStoreImg');
  const footerTermsLinkEl = document.getElementById('footerTermsLink');
  const footerPrivacyLinkEl = document.getElementById('footerPrivacyLink');
  const pageHeadingTitleEl = document.getElementById('pageHeadingTitle');
  const pageIntroEl = document.getElementById('pageIntro');
  const emptyStateTitleEl = document.getElementById('emptyStateTitle');
  const emptyStateMessageEl = document.getElementById('emptyStateMessage');
  const searchLabelEl = document.querySelector('.search-wrap label');
  const filtersEl = document.getElementById('offerTypeTabs');
  const gridEl = document.getElementById('offerGrid');
  const countEl = document.getElementById('resultsCount');
  const emptyEl = document.getElementById('emptyState');
  const searchEl = document.getElementById('offerSearch');
  const paginationEl = document.getElementById('pagination');
  const loadMoreSentinelEl = document.getElementById('loadMoreSentinel');
  const dialogEl = document.getElementById('offerDialog');
  const dialogContentEl = document.getElementById('offerDialogContent');
  const dialogCloseEl = document.getElementById('offerDialogClose');
  const PAGE_SIZE = 15;
  const INITIAL_LOAD_COUNT = 9;
  const LOAD_MORE_COUNT = 6;
  const IMAGE_BASE = 'https://www.citiworldprivileges.com/data/images/offer_images/272x195/';

  let currentCountry = 'SG';
  let currentLanguage = 'EN';
  let hasOfferDataset = true;
  let activeType = '__all__';
  let searchQuery = '';
  let filterDefinitions = [];
  let currentPage = 1;
  let currentPageOffers = [];
  let currentFilteredCount = 0;
  let currentPageStart = 0;
  let visibleCount = 0;
  let loadMoreObserver = null;
  let isAppendingOffers = false;
  let hasUserScrolledSinceRender = false;
  let lastFocusedElement = null;

  const UI_COPY = {
    EN: {
      pageTitle: 'Citi World Privileges',
      pageIntro: 'Discover Great Deals with your Citi Card',
      searchLabel: 'Search by merchant or offer name',
      searchPlaceholder: 'Search merchant or offer name',
      allOffers: 'All Offers',
      noMatchingOffers: 'No matching offers',
      noMatchingMessage: 'Try another merchant or offer name, or select a different category.',
      countryPendingTitle: 'Hong Kong offers are being prepared',
      countryPendingMessage: 'Hong Kong offers will appear here once the English offer data is available.',
      loading: 'Loading offers…',
      viewOffer: 'View Offer',
      merchantMissing: 'Merchant not specified',
      offerNameMissing: 'Offer name not provided',
      offerTypeFallback: 'Offer',
      offerDetails: 'Offer Details',
      offerDescriptionTitle: 'Offer Descriptions:',
      offerTermsTitle: 'Terms and conditions',
      location: 'Location: ',
      descriptionMissing: 'Description not provided in the source document.',
      termsMissing: 'Terms and Conditions were not provided in the source document.',
      imageMissing: 'Offer image is not available in the source.',
      imageUnavailable: 'Offer image is currently unavailable.',
      validTill: 'Offer Valid till: ',
      validityFallback: 'Offer end date not provided',
      expired: 'Expired',
      endingSoon: 'Ending soon',
      closeOffer: 'Close offer details',
      showMore: 'Show More +',
      showLess: 'Show Less −',
      previous: '‹ Previous',
      next: 'Next ›',
      previousAria: 'Previous page',
      nextAria: 'Next page',
      page: 'Page ',
      noOffers: '0 offers found',
      showing: 'Showing ',
      of: ' of ',
      offers: ' offers',
      in: ' in ',
      matching: ' matching “',
      quoteEnd: '”',
      noDataTitle: 'Offer data could not be loaded',
      noDataMessage: 'Check that the Singapore offers data file is included in the package.'
    },
    CN: {
      pageTitle: 'Citi World Privileges',
      pageIntro: '探索合作商戶提供的優惠。',
      searchLabel: '按商戶或優惠名稱搜尋',
      searchPlaceholder: '搜尋商戶或優惠名稱',
      allOffers: '所有優惠',
      noMatchingOffers: '找不到符合條件的優惠',
      noMatchingMessage: '請嘗試其他商戶或優惠名稱，或選擇其他類別。',
      countryPendingTitle: '香港優惠即將推出',
      countryPendingMessage: '香港繁體中文優惠資料載入後，相關優惠便會顯示於此。',
      loading: '正在載入優惠…',
      viewOffer: '查看優惠',
      merchantMissing: '未有提供商戶名稱',
      offerNameMissing: '未有提供優惠名稱',
      offerTypeFallback: '優惠',
      offerDetails: '優惠詳情',
      offerDescriptionTitle: '優惠描述：',
      offerTermsTitle: '條款及細則',
      location: '地點：',
      descriptionMissing: '來源文件未有提供優惠描述。',
      termsMissing: '來源文件未有提供條款及細則。',
      imageMissing: '來源資料未有提供優惠圖片。',
      imageUnavailable: '暫時無法載入優惠圖片。',
      validTill: '優惠有效期至：',
      validityFallback: '未有提供優惠到期日期',
      expired: '已過期',
      endingSoon: '即將到期',
      closeOffer: '關閉優惠詳情',
      showMore: '顯示更多 +',
      showLess: '顯示較少 −',
      previous: '‹ 上一頁',
      next: '下一頁 ›',
      previousAria: '上一頁',
      nextAria: '下一頁',
      page: '第 ',
      noOffers: '找不到優惠',
      showing: '顯示第 ',
      of: ' 項，共 ',
      offers: ' 項優惠',
      in: '，類別：',
      matching: '，符合「',
      quoteEnd: '」',
      noDataTitle: '優惠資料未能載入',
      noDataMessage: '請確認新加坡優惠資料檔案已包含在套件內。'
    }
  };

  function ui() {
    return UI_COPY[currentLanguage] || UI_COPY.EN;
  }

  const CATEGORY_LABELS_CN = {
    Dining: '餐飲',
    Hotels: '酒店',
    Shopping: '購物',
    Lifestyle: '生活品味',
    Travel: '旅遊',
    Fuels: '燃油',
    Weddings: '婚禮'
  };

  function localizedOfferType(value) {
    const source = String(value == null ? '' : value).trim();
    if (currentLanguage === 'CN') return CATEGORY_LABELS_CN[source] || source;
    return source;
  }

  function getDecodedHash() {
    const rawHash = window.location.hash.replace(/^#/, '');
    try {
      return decodeURIComponent(rawHash);
    } catch (error) {
      // A malformed URL fragment must not prevent the offer interface from rendering.
      return '';
    }
  }

  function getUrlParams() {
    try { return new URLSearchParams(window.location.search); }
    catch (error) { return new URLSearchParams(); }
  }

  function updateLogoHomeLink() {
    if (!homeLogoLinkEl) return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('country', currentCountry);
      url.searchParams.set('language', currentLanguage);
      url.searchParams.delete('offer');
      url.hash = 'all-offers';
      homeLogoLinkEl.href = url.pathname + url.search + url.hash;
    } catch (error) {
      homeLogoLinkEl.href = '?country=' + encodeURIComponent(currentCountry) + '&language=' + encodeURIComponent(currentLanguage) + '#all-offers';
    }
  }

  function updateMarketUrl(clearOffer) {
    updateLogoHomeLink();
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('country', currentCountry);
      url.searchParams.set('language', currentLanguage);
      if (clearOffer) url.searchParams.delete('offer');
      url.hash = 'all-offers';
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch (error) {
      // URL updates are progressive enhancement; rendering remains available if history is restricted.
    }
  }

  function updateOfferUrl(offer) {
    const id = String(offer && offer.anchorId || '');
    if (!/^[a-z0-9-]{3,180}$/i.test(id)) return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('country', currentCountry);
      url.searchParams.set('language', currentLanguage);
      url.searchParams.set('offer', id);
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch (error) {
      // The dialog still opens even if URL state cannot be updated.
    }
  }

  function clearOfferUrl() {
    try {
      const url = new URL(window.location.href);
      if (!url.searchParams.has('offer')) return;
      url.searchParams.delete('offer');
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch (error) {
      // No functional dependency on removing the optional deep-link parameter.
    }
  }

  function openRequestedOfferFromUrl() {
    const requestedId = getUrlParams().get('offer');
    if (!requestedId || !hasOfferDataset || !/^[a-z0-9-]{3,180}$/i.test(requestedId)) return;
    const target = offers.find(function (offer) { return offer.anchorId === requestedId; });
    if (!target) return;
    // Direct links can resolve an expired offer for historical campaign links; it is
    // excluded from public listings and the dialog displays its Expired status badge.
    window.requestAnimationFrame(function () { openOfferDialog(target, null); });
  }

  function getSelectedDataset() {
    if (currentCountry === 'SG') return singaporeOffers;
    const selected = currentLanguage === 'CN' ? window.HK_OFFERS_CN : window.HK_OFFERS_EN;
    return Array.isArray(selected) && selected.length ? selected : [];
  }

  function setLanguageOptions(preferredLanguage) {
    const options = [{ value: 'EN', label: 'EN' }];
    if (currentCountry === 'HK') options.push({ value: 'CN', label: '繁體中文' });
    languageSelectEl.textContent = '';
    options.forEach(function (item) {
      const option = document.createElement('option');
      option.value = item.value;
      option.textContent = item.label;
      languageSelectEl.appendChild(option);
    });
    currentLanguage = currentCountry === 'HK' && preferredLanguage === 'CN' ? 'CN' : 'EN';
    languageSelectEl.value = currentLanguage;
  }

  function setMetaContent(attributeName, attributeValue, content) {
    const selector = 'meta[' + attributeName + '="' + attributeValue + '"]';
    const meta = document.querySelector(selector);
    if (meta) meta.setAttribute('content', content);
  }

  function setTextIfPresent(element, value) {
    if (element) element.textContent = value;
  }

  function setPropertyIfPresent(element, propertyName, value) {
    if (element) element[propertyName] = value;
  }

  function updateLocalizedShell() {
    const copy = ui();
    const isChinese = currentCountry === 'HK' && currentLanguage === 'CN';
    document.documentElement.lang = isChinese ? 'zh-HK' : 'en';
    const marketName = currentCountry === 'SG' ? 'Singapore' : 'Hong Kong';
    const seoTitle = isChinese
      ? 'Citi信用卡優惠及禮遇 | Citi World Privileges（香港）'
      : 'Citibank: Credit and Debit Cards - Offers and Benefits, ' + marketName + ' | Citi World Privileges';
    const seoDescription = isChinese
      ? '探索香港Citi信用卡、扣賬卡及商務卡專屬餐飲、旅遊、酒店、購物及生活優惠，查看優惠有效期、商戶詳情及條款及細則。'
      : 'Discover the latest dining, travel, shopping to leisure offers. Exclusively for Citi Cardmembers in ' + marketName + '.';
    const seoKeywords = isChinese
      ? 'Citi信用卡優惠, 香港信用卡優惠, 餐飲優惠, 旅遊優惠, 酒店優惠, 購物優惠, 生活優惠, Citi World Privileges'
      : 'credit card offers, debit card offers, restaurants in ' + marketName + ', shopping in ' + marketName + ', travel to ' + marketName + ', spa and health, sports in ' + marketName + ', special offers, latest offers';
    document.title = seoTitle;
    setMetaContent('name', 'title', seoTitle);
    setMetaContent('name', 'description', seoDescription);
    setMetaContent('name', 'keywords', seoKeywords);
    setMetaContent('property', 'og:title', seoTitle);
    setMetaContent('property', 'og:description', seoDescription);
    setMetaContent('property', 'og:site_name', 'Citi World Privileges');
    setMetaContent('property', 'og:url', 'https://www.citiworldprivileges.com');
    setMetaContent('name', 'twitter:card', 'summary_large_image');
    setMetaContent('name', 'twitter:title', seoTitle);
    setMetaContent('name', 'twitter:description', seoDescription);

    // The hero fallback and localization copy elements are optional in deployments
    // that use a reduced header/hero template. Update them only when present.
    setTextIfPresent(pageHeadingTitleEl, copy.pageTitle);
    setTextIfPresent(pageIntroEl, copy.pageIntro);
    setTextIfPresent(countryLabelEl, isChinese ? '國家／地區' : 'Country');
    setTextIfPresent(languageLabelEl, isChinese ? '語言' : 'Language');
    if (countrySelectEl) {
      countrySelectEl.setAttribute('aria-label', isChinese ? '國家／地區' : 'Country');
      Array.from(countrySelectEl.options).forEach(function (option) {
        if (option.value === 'SG') option.textContent = isChinese ? '新加坡' : 'Singapore';
        if (option.value === 'HK') option.textContent = isChinese ? '香港' : 'Hong Kong';
      });
    }
    if (languageSelectEl) languageSelectEl.setAttribute('aria-label', isChinese ? '語言' : 'Language');
    setTextIfPresent(searchLabelEl, copy.searchLabel);
    setPropertyIfPresent(searchEl, 'placeholder', copy.searchPlaceholder);
    setTextIfPresent(emptyStateTitleEl, copy.noMatchingOffers);
    setTextIfPresent(emptyStateMessageEl, copy.noMatchingMessage);
    setTextIfPresent(countryDataStateTitleEl, copy.countryPendingTitle);
    setTextIfPresent(countryDataStateMessageEl, copy.countryPendingMessage);
    const flagPath = currentCountry === 'SG' ? 'assets/flag-sg.svg' : 'assets/flag-hk.svg';
    setPropertyIfPresent(countryFlagEl, 'src', flagPath);
    setPropertyIfPresent(countryFlagEl, 'alt', '');
    setPropertyIfPresent(countryStateFlagEl, 'src', flagPath);
    setPropertyIfPresent(countryStateFlagEl, 'alt', '');
    updateFooterLinks();
  }

  const FOOTER_LINKS = {
    SG: {
      EN: {
        playStore: 'https://play.google.com/store/apps/details?id=com.citibank.mobile.sg&hl=en-SG',
        appStore: 'https://apps.apple.com/gb/app/citibank-sg/id370773317',
        playStoreTitle: 'Citibank SG - Apps on Google Play',
        appStoreTitle: 'Citibank SG on the App Store',
        terms: 'https://www.citibank.com.sg/gcb/static/products_tncs',
        privacy: 'https://www.citibank.com.sg/footer/privacy'
      }
    },
    HK: {
      EN: {
        playStore: 'https://play.google.com/store/apps/details?id=com.citibank.mobile.hk',
        appStore: 'https://apps.apple.com/hk/app/citibank-hk/id373717372?l=en-GB',
        playStoreTitle: 'Citibank HK - Apps on Google Play',
        appStoreTitle: 'Citibank HK on the App Store',
        terms: 'https://www.citibank.com.hk/english/info/disclaimer/?lid=HKENCBGGNFOTLTERMSCONDITIONS',
        privacy: 'https://www.citibank.com.hk/english/info/privacy/?lid=HKENCBGGNFOTLPRIVACY'
      },
      CN: {
        playStore: 'https://play.google.com/store/apps/details?id=com.citibank.mobile.hk&hl=zh-hk',
        appStore: 'https://apps.apple.com/hk/app/citibank-hk/id373717372',
        playStoreTitle: 'Citibank HK - Apps on Google Play',
        appStoreTitle: 'Citibank HK on the App Store',
        terms: 'https://www.citibank.com.hk/chinese/info/disclaimer/?lid=HKENCBGGNFOTLTERMSCONDITIONS',
        privacy: 'https://www.citibank.com.hk/chinese/info/privacy/?lid=HKENCBGGNFOTLPRIVACY'
      }
    }
  };

  function updateFooterLinks() {
    const marketLinks = (FOOTER_LINKS[currentCountry] && FOOTER_LINKS[currentCountry][currentLanguage]) ||
      (FOOTER_LINKS[currentCountry] && FOOTER_LINKS[currentCountry].EN) ||
      FOOTER_LINKS.SG.EN;

    if (footerPlayStoreLinkEl) {
      footerPlayStoreLinkEl.href = marketLinks.playStore;
      footerPlayStoreLinkEl.title = marketLinks.playStoreTitle;
    }
    if (footerPlayStoreImgEl) {
      footerPlayStoreImgEl.alt = marketLinks.playStoreTitle;
      footerPlayStoreImgEl.title = marketLinks.playStoreTitle;
    }
    if (footerAppStoreLinkEl) {
      footerAppStoreLinkEl.href = marketLinks.appStore;
      footerAppStoreLinkEl.title = marketLinks.appStoreTitle;
    }
    if (footerAppStoreImgEl) {
      footerAppStoreImgEl.alt = marketLinks.appStoreTitle;
      footerAppStoreImgEl.title = marketLinks.appStoreTitle;
    }
    if (footerTermsLinkEl) {
      footerTermsLinkEl.href = marketLinks.terms;
    }
    if (footerPrivacyLinkEl) {
      footerPrivacyLinkEl.href = marketLinks.privacy;
    }
  }

  function loadSelectedContext(resetHash) {
    offers = getSelectedDataset();
    hasOfferDataset = offers.length > 0;
    currentPage = 1;
    searchQuery = '';
    searchEl.value = '';
    activeType = '__all__';
    updateLocalizedShell();
    updateLogoHomeLink();

    // The approved shared footer is displayed consistently for both SG and HK.
    if (pageFooterEl) pageFooterEl.hidden = false;

    if (!hasOfferDataset) {
      filterDefinitions = [];
      gridEl.textContent = '';
      paginationEl.textContent = '';
      emptyEl.hidden = true;
      countEl.textContent = '';
      currentPageOffers = [];
      currentFilteredCount = 0;
      currentPageStart = 0;
      visibleCount = 0;
      if (loadMoreSentinelEl) loadMoreSentinelEl.hidden = true;
      if (loadMoreObserver && loadMoreSentinelEl) loadMoreObserver.unobserve(loadMoreSentinelEl);
      filtersEl.textContent = '';
      categoryNavEl.hidden = true;
      resultsToolbarEl.hidden = true;
      offersRegionEl.hidden = true;
      if (countryDataStateEl) countryDataStateEl.hidden = false;
      setTextIfPresent(countryDataStateTitleEl, currentCountry === 'SG' ? ui().noDataTitle : ui().countryPendingTitle);
      setTextIfPresent(countryDataStateMessageEl, currentCountry === 'SG' ? ui().noDataMessage : ui().countryPendingMessage);
      return;
    }

    if (countryDataStateEl) countryDataStateEl.hidden = true;
    categoryNavEl.hidden = false;
    resultsToolbarEl.hidden = false;
    offersRegionEl.hidden = false;
    buildFilters();
    chooseFilter('__all__', false);

    if (resetHash) {
      try {
        window.history.replaceState(null, '', window.location.pathname + window.location.search + '#all-offers');
      } catch (error) {
        window.location.hash = 'all-offers';
      }
    }
  }

  function normalSlug(value) {
    return String(value || '')
      .toLocaleLowerCase()
      .replace(/^'+/, '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'offer-type';
  }

  function buildFilters() {
    const uniqueTypes = [];
    const seenTypes = new Set();
    offers.filter(function (offer) { return !isOfferExpired(offer); }).forEach(function (offer) {
      const value = String(offer.offerType == null ? '' : offer.offerType).trim();
      if (value && !seenTypes.has(value)) {
        seenTypes.add(value);
        uniqueTypes.push(value);
      }
    });

    // Present the common Singapore categories in the order shown by the supplied UI
    // reference, then append any additional source categories without renaming them.
    const preferred = ['Dining', 'Travel', 'Shopping', 'Fuels', 'Weddings'];
    uniqueTypes.sort(function (a, b) {
      const ai = preferred.indexOf(a);
      const bi = preferred.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });

    const used = new Set(['all-offers', 'highlights']);
    filterDefinitions = [{ value: '__all__', label: ui().allOffers, hash: 'all-offers' }];
    uniqueTypes.forEach(function (value) {
      const base = normalSlug(value);
      let hash = base;
      let suffix = 2;
      while (used.has(hash)) {
        hash = base + '-' + suffix;
        suffix += 1;
      }
      used.add(hash);
      filterDefinitions.push({ value: value, label: localizedOfferType(value), hash: hash });
    });

    filtersEl.textContent = '';
    filterDefinitions.forEach(function (filter) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'category-filter__button';
      button.dataset.filterValue = filter.value;
      button.dataset.filterHash = filter.hash;
      appendCategoryIcon(button, filter.value, 'category-filter__icon');
      const label = document.createElement('span');
      label.className = 'category-filter__label';
      label.textContent = filter.label;
      button.appendChild(label);
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', function () {
        chooseFilter(filter.value, true);
      });
      filtersEl.appendChild(button);
    });
  }

  function chooseFilter(value, updateHash) {
    const filter = filterDefinitions.find(function (item) { return item.value === value; }) || filterDefinitions[0];
    activeType = filter.value;
    currentPage = 1;
    setActiveFilterVisual();
    renderOffers();

    if (updateHash) {
      const target = '#' + filter.hash;
      if (window.location.hash !== target) window.location.hash = filter.hash;
      // Put the selected category strip at the top of the viewport so the refreshed
      // offer cards are immediately visible below it.
      window.requestAnimationFrame(function () {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const top = window.scrollY + categoryNavEl.getBoundingClientRect().top - 12;
        window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion ? 'auto' : 'smooth' });
      });
    }
  }

  function setActiveFilterVisual() {
    Array.from(filtersEl.querySelectorAll('button[data-filter-value]')).forEach(function (button) {
      const selected = button.dataset.filterValue === activeType;
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');
      button.classList.toggle('is-active', selected);
    });
  }

  function syncFromHash() {
    if (!hasOfferDataset || !filterDefinitions.length) return;
    const rawHash = getDecodedHash();
    const filter = filterDefinitions.find(function (item) { return item.hash === rawHash; });
    // Backward compatibility with bookmarks from older packages.
    if (rawHash === 'all-offers' || rawHash === 'highlights') {
      // Keep old #highlights bookmarks working after relabelling the filter.
      chooseFilter('__all__', false);
    } else if (filter) {
      chooseFilter(filter.value, false);
    } else {
      chooseFilter('__all__', false);
    }
  }

  function parseIsoDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return null;
    const parts = value.split('-').map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    if (date.getFullYear() !== parts[0] || date.getMonth() !== parts[1] - 1 || date.getDate() !== parts[2]) return null;
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function isOfferExpired(offer) {
    const end = parseIsoDate(offer && offer.validTo);
    if (!end) return false; // Unknown/invalid expiry is retained until the source is corrected.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return end.getTime() < today.getTime();
  }

  function formatDate(value) {
    const date = parseIsoDate(value);
    if (!date) return '';
    if (currentLanguage === 'CN') {
      return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return String(date.getDate()).padStart(2, '0') + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
  }

  function formatValidity(offer) {
    const end = formatDate(offer.validTo);
    if (end) return ui().validTill + end;
    return ui().validityFallback;
  }

  function getStatus(offer) {
    const end = parseIsoDate(offer.validTo);
    const start = parseIsoDate(offer.validFrom);
    if (!end) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const difference = Math.round((end.getTime() - today.getTime()) / 86400000);
    if (difference < 0) return { label: ui().expired, className: 'status-badge--expired' };
    if (start && start <= today && difference <= 30) return { label: ui().endingSoon, className: 'status-badge--soon' };
    return null;
  }

  function addText(parent, tagName, className, value) {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    node.textContent = value == null ? '' : String(value);
    parent.appendChild(node);
    return node;
  }

  function addChip(parent, value, className) {
    const clean = String(value == null ? '' : value).trim();
    if (!clean || clean.toLocaleUpperCase() === 'NULL' || clean === '—') return;
    const chip = document.createElement('span');
    chip.className = className || 'offer-chip';
    chip.textContent = clean;
    parent.appendChild(chip);
  }

  const CATEGORY_ICON_FILES = {
    'all-offers': 'category-all-offers.svg',
    dining: 'category-dining.svg',
    travel: 'category-travel.svg',
    shopping: 'category-shopping.svg',
    fuels: 'category-fuels.svg',
    weddings: 'category-weddings.svg',
    hotels: 'category-hotels.svg',
    lifestyle: 'category-lifestyle.svg',
    generic: 'category-generic.svg'
  };

  function categoryIconFilename(value) {
    const key = value === '__all__' ? 'all-offers' : normalSlug(value);
    return CATEGORY_ICON_FILES[key] || CATEGORY_ICON_FILES.generic;
  }

  function appendCategoryIcon(parent, value, className) {
    const icon = document.createElement('img');
    icon.className = className || 'category-label__icon';
    icon.src = 'assets/' + categoryIconFilename(value);
    icon.alt = '';
    icon.setAttribute('aria-hidden', 'true');
    icon.decoding = 'async';
    parent.appendChild(icon);
    return icon;
  }

  function addCategoryLabel(parent, value, className, iconValue) {
    const label = document.createElement('p');
    label.className = className;
    appendCategoryIcon(label, iconValue == null ? value : iconValue, className + '-icon');
    const text = document.createElement('span');
    text.className = 'category-label__text';
    text.textContent = localizedOfferType(value || ui().offerTypeFallback);
    label.appendChild(text);
    parent.appendChild(label);
    return label;
  }

  function getImageFilename(offer) {
    const raw = String(offer.offerImage == null ? '' : offer.offerImage).trim();
    if (!raw || /^no$/i.test(raw) || /^filename\s+not\s+provided$/i.test(raw)) return '';
    const filename = raw.replace(/\s+/g, '').replace(/^\/+/, '');
    // The source field is intended to contain a filename, not a URL or path.
    if (!/^[A-Za-z0-9._-]+$/.test(filename) || filename === '.' || filename === '..') return '';
    return filename;
  }

  function addOfferImage(parent, offer, variant) {
    const filename = getImageFilename(offer);
    const figure = document.createElement('figure');
    figure.className = variant === 'modal' ? 'offer-modal__image-figure' : 'offer-card__image-figure';

    if (!filename) {
      figure.classList.add('is-unavailable');
      addText(figure, 'div', 'offer-image-unavailable', ui().imageMissing);
      parent.appendChild(figure);
      return null;
    }

    const image = document.createElement('img');
    image.className = variant === 'modal' ? 'offer-modal__image' : 'offer-card__image';
    image.src = IMAGE_BASE + filename;
    image.alt = (currentLanguage === 'CN' ? '優惠圖片：' : 'Offer image for ') + String(offer.merchantName || ui().merchantMissing) + ': ' + String(offer.offerName || ui().offerNameMissing);
    image.loading = 'lazy';
    image.decoding = 'async';
    image.addEventListener('error', function () {
      figure.textContent = '';
      figure.classList.add('is-unavailable');
      addText(figure, 'div', 'offer-image-unavailable', ui().imageUnavailable);
    }, { once: true });
    figure.appendChild(image);
    parent.appendChild(figure);
    return image;
  }

  function addDescription(parent, offer) {
    const descriptions = Array.isArray(offer.offerDescriptions) ? offer.offerDescriptions.filter(function (item) {
      const text = String(item == null ? '' : item).trim();
      return text !== '' && !isTermsApplyLine(text);
    }) : [];
    const blocks = Array.isArray(offer.offerDescriptionBlocks) ? offer.offerDescriptionBlocks : [];
    const useNumberedBlocks = blocks.some(function (block) {
      return block && block.type === 'numbered' && Array.isArray(block.items) && block.items.length;
    });

    if (!descriptions.length && !blocks.length) {
      addText(parent, 'p', 'empty-description', ui().descriptionMissing);
      return;
    }

    const participating = splitParticipatingRestaurantDescriptions(descriptions);
    if (participating) {
      participating.intro.forEach(function (text) {
        addRichText(parent, 'p', 'offer-modal__description-text offer-modal__description-intro', text);
      });
      addText(parent, 'h4', descriptionHeadingClass('Participating restaurants:'), 'Participating restaurants:');
      appendBulletList(parent, participating.restaurants, 'offer-modal__description-list');
      return;
    }

    if (useNumberedBlocks) {
      renderDescriptionBlocks(parent, blocks);
      return;
    }

    if (descriptions.length) {
      renderStructuredDescriptions(parent, descriptions);
      return;
    }

    renderDescriptionBlocks(parent, blocks);
  }

  function renderDescriptionBlocks(parent, blocks) {
    blocks.forEach(function (block) {
      if (!block || typeof block !== 'object') return;
      if (block.type === 'paragraph') {
        const text = String(block.text == null ? '' : block.text).trim();
        if (text && !isTermsApplyLine(text)) addRichText(parent, 'p', 'offer-modal__description-text offer-modal__description-intro', text);
        return;
      }
      if (block.type === 'heading') {
        const text = String(block.text == null ? '' : block.text).trim();
        if (text) addText(parent, 'h4', descriptionHeadingClass(text), text);
        return;
      }
      if (block.type === 'numbered' || block.type === 'bullets') {
        const items = Array.isArray(block.items) ? block.items.filter(function (item) {
          return String(item == null ? '' : item).trim() !== '';
        }) : [];
        if (!items.length) return;
        appendDescriptionList(parent, items, block.type === 'numbered' ? 'numbered' : 'bullets');
      }
    });
  }

  function renderStructuredDescriptions(parent, descriptions) {
    if (!descriptions.length) return;

    let buffer = [];
    let bufferType = null;

    function flush() {
      if (!buffer.length) return;
      appendDescriptionList(parent, buffer, bufferType || 'bullets');
      buffer = [];
      bufferType = null;
    }

    descriptions.forEach(function (raw) {
      const text = String(raw).trim();
      if (isDescriptionHeading(text)) {
        flush();
        addText(parent, 'h4', descriptionHeadingClass(text), text);
        return;
      }
      const numbered = /^\s*\d{1,2}[.)]\s+/.test(text);
      const itemText = text.replace(/^\s*\d{1,2}[.)]\s+/, '');
      const type = numbered ? 'numbered' : 'bullets';
      if (bufferType && bufferType !== type) flush();
      bufferType = type;
      buffer.push(itemText);
    });
    flush();
  }

  function isTermsApplyLine(text) {
    return /^terms and conditions apply\.?$/i.test(String(text || '').trim());
  }

  function isDescriptionHeading(text) {
    const t = String(text || '').trim();
    if (!t) return false;
    if (/^participating restaurants:?$/i.test(t)) return true;
    return /:$/.test(t) && t.length <= 60 && t.indexOf('.') === -1;
  }

  function descriptionHeadingClass(text) {
    const headingClass = 'offer-modal__description-heading';
    return /^participating restaurants:?$/i.test(String(text || '').trim())
      ? headingClass + ' offer-modal__description-heading--black'
      : headingClass;
  }

  function splitParticipatingRestaurantDescriptions(descriptions) {
    let headingIndex = -1;
    let introBeforeHeading = '';
    for (let i = 0; i < descriptions.length; i++) {
      const text = String(descriptions[i]).trim();
      if (/^participating restaurants:?$/i.test(text)) {
        headingIndex = i;
        break;
      }
      const mixed = text.match(/^(.*?)\s+Participating restaurants:?\s*$/i);
      if (mixed) {
        headingIndex = i;
        introBeforeHeading = mixed[1].trim();
        break;
      }
    }
    if (headingIndex < 0) return null;
    const intro = descriptions.slice(0, headingIndex).map(function (item) { return String(item).trim(); }).filter(Boolean);
    if (introBeforeHeading) intro.push(introBeforeHeading);
    const restaurants = descriptions.slice(headingIndex + 1).map(function (item) { return String(item).trim(); }).filter(Boolean);
    if (!restaurants.length) return null;
    return { intro: intro, restaurants: restaurants };
  }

  function appendBulletList(parent, items, className) {
    appendDescriptionList(parent, items, 'bullets', className);
  }

  function appendDescriptionList(parent, items, type, className) {
    const numbered = type === 'numbered';
    const list = document.createElement(numbered ? 'ol' : 'ul');
    list.className = className || ('offer-modal__description-list' + (numbered ? ' offer-modal__description-list--numbered' : ''));
    items.forEach(function (item) {
      const li = document.createElement('li');
      li.textContent = String(item).replace(/^\s*\d{1,2}[.)]\s+/, '');
      list.appendChild(li);
    });
    parent.appendChild(list);
  }

  function createOfferCard(offer) {
    const article = document.createElement('article');
    article.className = 'offer-card';

    // The image acts as a second entry point to the same accessible offer dialog.
    // Use an anchor because it can validly contain the figure/image markup.
    const imageLink = document.createElement('a');
    imageLink.className = 'offer-card__image-link';
    imageLink.href = '#offer-details';
    imageLink.setAttribute('aria-haspopup', 'dialog');
    imageLink.setAttribute('aria-label', ui().viewOffer + ': ' + String(offer.merchantName || ui().merchantMissing));
    imageLink.addEventListener('click', function (event) {
      event.preventDefault();
      openOfferDialog(offer, imageLink);
    });
    addOfferImage(imageLink, offer, 'card');
    article.appendChild(imageLink);

    const body = document.createElement('div');
    body.className = 'offer-card__body';
    article.appendChild(body);

    addCategoryLabel(body, offer.offerType || ui().offerTypeFallback, 'offer-card__category', offer.offerType || 'generic');
    addText(body, 'h2', 'offer-card__merchant', offer.merchantName || ui().merchantMissing);
    addText(body, 'p', 'offer-card__offer-name', offer.offerName || ui().offerNameMissing);

    const validityRow = document.createElement('div');
    validityRow.className = 'offer-card__validity-row';
    const validity = addText(validityRow, 'p', 'offer-card__validity', formatValidity(offer));
    const status = getStatus(offer);
    if (status) addText(validityRow, 'span', 'status-badge ' + status.className, status.label);
    body.appendChild(validityRow);

    const chips = document.createElement('div');
    chips.className = 'offer-card__chips';
    addChip(chips, offer.offerSubType);
    String(offer.offerTagName || '').split(',').forEach(function (tag) { addChip(chips, tag); });
    if (chips.childElementCount) body.appendChild(chips);

    const spacer = document.createElement('div');
    spacer.className = 'offer-card__spacer';
    spacer.setAttribute('aria-hidden', 'true');
    body.appendChild(spacer);

    const actions = document.createElement('div');
    actions.className = 'offer-card__actions';
    const button = addText(actions, 'button', 'view-offer-button', ui().viewOffer);
    button.type = 'button';
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-label', ui().viewOffer + ': ' + String(offer.merchantName || ui().merchantMissing));
    button.addEventListener('click', function () { openOfferDialog(offer, button); });
    const arrow = document.createElement('span');
    arrow.className = 'view-offer-button__arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';
    button.appendChild(arrow);
    actions.appendChild(button);
    body.appendChild(actions);

    return article;
  }

  function buildModalChips(parent, offer) {
    const row = document.createElement('div');
    row.className = 'offer-modal__chips';
    addChip(row, offer.offerSubType, 'offer-modal__chip');
    String(offer.offerTagName || '').split(',').forEach(function (tag) { addChip(row, tag, 'offer-modal__chip'); });
    if (row.childElementCount) parent.appendChild(row);
  }

  function addRichText(parent, tagName, className, value) {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    node.textContent = value == null ? '' : String(value);
    parent.appendChild(node);
    return node;
  }

  function formatTermForBullets(term) {
    let text = String(term == null ? '' : term).trim();
    if (!text) return '';

    // The source may split numbering onto a separate row (for example, "1." or "1)").
    // Drop marker-only rows rather than creating empty bullets.
    if (/^(?:\d{1,2}[.)]|[ivxlcdm]{1,6}\.|[a-z][.)])$/i.test(text)) return '';

    // Strip leading clause/list labels without mistaking decimal values such as 20.88% for numbering.
    text = text.replace(/^\d{1,2}[.)](?=\s|[^\d.])\s*/, '').trim();
    text = text.replace(/^[ivxlcdm]{1,6}\.(?=\s|[^\d.])\s*/i, '').trim();
    text = text.replace(/^\([a-z]\)\s+/i, '').trim();
    text = text.replace(/^[a-z][.)]\s+(?=[A-Z(“"'])/i, '').trim();
    text = text.replace(/^o\s+(?=[A-Z(“"'])/, '').trim();
    return text;
  }

  function buildModalTerms(parent, offer) {
    const section = document.createElement('section');
    section.className = 'offer-modal__terms';
    addText(section, 'h3', 'offer-modal__section-title', ui().offerTermsTitle);

    const terms = Array.isArray(offer.offerTermsAndConditions) ? offer.offerTermsAndConditions.map(formatTermForBullets).filter(function (term) {
      return term !== '';
    }) : [];
    if (!terms.length) {
      addText(section, 'p', 'empty-description', ui().termsMissing);
      parent.appendChild(section);
      return;
    }

    const list = document.createElement('ul');
    list.className = 'offer-modal__terms-list';
    list.id = 'offerModalTermsList';
    terms.forEach(function (term, index) {
      const li = document.createElement('li');
      li.textContent = term;
      if (index >= 5) li.hidden = true;
      list.appendChild(li);
    });
    section.appendChild(list);

    if (terms.length > 5) {
      const toggle = addText(section, 'button', 'show-terms-button', ui().showMore);
      toggle.type = 'button';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', list.id);
      toggle.addEventListener('click', function () {
        const expanded = toggle.getAttribute('aria-expanded') !== 'true';
        Array.from(list.children).forEach(function (item, index) {
          if (index >= 5) item.hidden = !expanded;
        });
        toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        toggle.textContent = expanded ? ui().showLess : ui().showMore;
      });
      section.appendChild(toggle);
    }
    parent.appendChild(section);
  }

  function openOfferDialog(offer, trigger) {
    lastFocusedElement = trigger || document.activeElement;
    updateOfferUrl(offer);
    dialogContentEl.textContent = '';

    const closeLabel = ui().closeOffer;
    dialogCloseEl.setAttribute('aria-label', closeLabel);

    const content = document.createElement('div');
    content.className = 'offer-modal__content';

    const topGrid = document.createElement('div');
    topGrid.className = 'offer-modal__top-grid';
    const imageColumn = document.createElement('div');
    imageColumn.className = 'offer-modal__image-column';
    addOfferImage(imageColumn, offer, 'modal');
    topGrid.appendChild(imageColumn);

    const detailColumn = document.createElement('div');
    detailColumn.className = 'offer-modal__detail-column';
    addCategoryLabel(detailColumn, offer.offerType || ui().offerDetails, 'offer-modal__eyebrow', offer.offerType || 'generic');
    const title = addText(detailColumn, 'h2', 'offer-modal__merchant', offer.merchantName || ui().merchantMissing);
    title.id = 'offerModalTitle';
    addText(detailColumn, 'p', 'offer-modal__offer-name', offer.offerName || ui().offerNameMissing);

    const validityBlock = document.createElement('div');
    validityBlock.className = 'offer-modal__validity-block';
    const modalEndDate = formatDate(offer.validTo);
    addText(validityBlock, 'p', 'offer-modal__validity', modalEndDate ? ui().validTill + modalEndDate : ui().validityFallback);
    const status = getStatus(offer);
    if (status) addText(validityBlock, 'span', 'status-badge ' + status.className, status.label);
    detailColumn.appendChild(validityBlock);

    const rawLocation = String(offer.location || '').trim();
    const location = currentLanguage === 'CN' && rawLocation === 'Hong Kong' ? '香港' : rawLocation;
    if (location) {
      const locationLine = document.createElement('p');
      locationLine.className = 'offer-modal__location';
      const locationLabel = document.createElement('strong');
      locationLabel.textContent = ui().location;
      locationLine.appendChild(locationLabel);
      locationLine.appendChild(document.createTextNode(location));
      detailColumn.appendChild(locationLine);
    }
    buildModalChips(detailColumn, offer);
    addText(detailColumn, 'h3', 'offer-modal__section-title', ui().offerDescriptionTitle);
    const descriptionBlock = document.createElement('div');
    descriptionBlock.className = 'offer-modal__description';
    addDescription(descriptionBlock, offer);
    detailColumn.appendChild(descriptionBlock);
    topGrid.appendChild(detailColumn);
    content.appendChild(topGrid);

    buildModalTerms(content, offer);
    dialogContentEl.appendChild(content);

    if (typeof dialogEl.showModal === 'function') {
      if (!dialogEl.open) dialogEl.showModal();
    } else {
      dialogEl.setAttribute('open', '');
      dialogEl.classList.add('is-open');
      document.body.classList.add('modal-open-fallback');
    }
    dialogCloseEl.focus();
  }

  function closeOfferDialog() {
    clearOfferUrl();
    if (typeof dialogEl.close === 'function' && dialogEl.open) {
      dialogEl.close();
    } else {
      dialogEl.removeAttribute('open');
      dialogEl.classList.remove('is-open');
      document.body.classList.remove('modal-open-fallback');
      restoreDialogFocus();
    }
  }

  function restoreDialogFocus() {
    if (lastFocusedElement && document.contains(lastFocusedElement)) lastFocusedElement.focus();
    lastFocusedElement = null;
  }

  function renderPagination(totalItems) {
    paginationEl.textContent = '';
    const pageCount = Math.ceil(totalItems / PAGE_SIZE);
    if (pageCount <= 1) {
      paginationEl.hidden = true;
      return;
    }
    paginationEl.hidden = false;

    const nav = document.createElement('div');
    nav.className = 'pagination__inner';

    function addPageButton(label, page, options) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'pagination__button' + (options && options.current ? ' is-current' : '');
      button.textContent = label;
      button.disabled = Boolean(options && options.disabled);
      if (options && options.current) button.setAttribute('aria-current', 'page');
      if (options && options.ariaLabel) button.setAttribute('aria-label', options.ariaLabel);
      if (!button.disabled && !(options && options.current)) {
        button.addEventListener('click', function () {
          currentPage = page;
          renderOffers();
          const region = document.getElementById('offersRegion');
          if (region) region.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        });
      }
      nav.appendChild(button);
    }

    addPageButton(ui().previous, Math.max(1, currentPage - 1), { disabled: currentPage === 1, ariaLabel: ui().previousAria });

    let pageList = [];
    if (pageCount <= 7) {
      for (let page = 1; page <= pageCount; page += 1) pageList.push(page);
    } else {
      pageList = [1];
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(pageCount - 1, currentPage + 1);
      if (start > 2) pageList.push('…');
      for (let page = start; page <= end; page += 1) pageList.push(page);
      if (end < pageCount - 1) pageList.push('…');
      pageList.push(pageCount);
    }

    pageList.forEach(function (page) {
      if (page === '…') {
        const span = addText(nav, 'span', 'pagination__ellipsis', '…');
        span.setAttribute('aria-hidden', 'true');
      } else {
        addPageButton(String(page), page, { current: page === currentPage, ariaLabel: ui().page + page });
      }
    });

    addPageButton(ui().next, Math.min(pageCount, currentPage + 1), { disabled: currentPage === pageCount, ariaLabel: ui().nextAria });
    paginationEl.appendChild(nav);
  }

  function updateResultsCount() {
    if (currentFilteredCount) {
      const first = currentPageStart + 1;
      const last = Math.min(currentPageStart + visibleCount, currentFilteredCount);
      const selectedLabel = (filterDefinitions.find(function (item) { return item.value === activeType; }) || filterDefinitions[0]).label;
      countEl.textContent = ui().showing + first + '–' + last + ui().of + currentFilteredCount + ui().offers +
        (searchQuery.trim() ? ui().matching + searchQuery.trim() + ui().quoteEnd : '') + ui().in + selectedLabel;
    } else {
      countEl.textContent = ui().noOffers + (searchQuery.trim() ? ui().matching + searchQuery.trim() + ui().quoteEnd : '') + '.';
    }
  }

  function syncLoadMoreState() {
    if (!loadMoreSentinelEl) return;
    const hasMore = hasOfferDataset && visibleCount < currentPageOffers.length;
    loadMoreSentinelEl.hidden = !hasMore;
    if (loadMoreObserver) {
      loadMoreObserver.unobserve(loadMoreSentinelEl);
      if (hasMore) loadMoreObserver.observe(loadMoreSentinelEl);
    }
    // Keep page navigation after the current 15-item page has been loaded (or all
    // remaining items for a shorter final/filter result page), not between batches.
    paginationEl.hidden = hasMore || Math.ceil(currentFilteredCount / PAGE_SIZE) <= 1;
  }

  function appendMoreOffers() {
    if (!hasOfferDataset || isAppendingOffers || visibleCount >= currentPageOffers.length) return;
    isAppendingOffers = true;
    const nextCount = Math.min(visibleCount + LOAD_MORE_COUNT, currentPageOffers.length);
    const fragment = document.createDocumentFragment();
    for (let index = visibleCount; index < nextCount; index += 1) {
      fragment.appendChild(createOfferCard(currentPageOffers[index]));
    }
    gridEl.appendChild(fragment);
    visibleCount = nextCount;
    isAppendingOffers = false;
    updateResultsCount();
    renderPagination(currentFilteredCount);
    syncLoadMoreState();
  }

  function renderOffers() {
    const query = searchQuery.trim().toLocaleLowerCase();
    const availableOffers = offers.filter(function (offer) { return !isOfferExpired(offer); });
    const selectedOffers = availableOffers.filter(function (offer) {
      return activeType === '__all__' || String(offer.offerType == null ? '' : offer.offerType).trim() === activeType;
    });
    const filtered = selectedOffers.filter(function (offer) {
      if (!query) return true;
      const haystack = String(offer.merchantName || '') + ' ' + String(offer.offerName || '');
      return haystack.toLocaleLowerCase().includes(query);
    });

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (currentPage > pageCount) currentPage = pageCount;
    currentPageStart = (currentPage - 1) * PAGE_SIZE;
    currentFilteredCount = filtered.length;
    currentPageOffers = filtered.slice(currentPageStart, currentPageStart + PAGE_SIZE);
    visibleCount = Math.min(INITIAL_LOAD_COUNT, currentPageOffers.length);
    hasUserScrolledSinceRender = false;

    gridEl.textContent = '';
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < visibleCount; index += 1) {
      fragment.appendChild(createOfferCard(currentPageOffers[index]));
    }
    gridEl.appendChild(fragment);
    emptyEl.hidden = filtered.length !== 0;
    gridEl.hidden = filtered.length === 0;

    updateResultsCount();
    renderPagination(filtered.length);
    syncLoadMoreState();
  }

  let expiryRefreshTimer = null;

  function scheduleExpiryRefresh() {
    if (expiryRefreshTimer !== null) window.clearTimeout(expiryRefreshTimer);
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1, 0);
    const delay = Math.max(1000, nextMidnight.getTime() - now.getTime());
    expiryRefreshTimer = window.setTimeout(function () {
      if (hasOfferDataset) {
        buildFilters();
        if (!filterDefinitions.some(function (filter) { return filter.value === activeType; })) {
          activeType = '__all__';
        }
        currentPage = 1;
        setActiveFilterVisual();
        renderOffers();
      }
      scheduleExpiryRefresh();
    }, delay);
  }

  function init() {
    const requiredElements = [
      ['countrySelect', countrySelectEl],
      ['languageSelect', languageSelectEl],
      ['category-filter', categoryNavEl],
      ['resultsToolbar', resultsToolbarEl],
      ['offersRegion', offersRegionEl],
      ['offerTypeTabs', filtersEl],
      ['offerGrid', gridEl],
      ['resultsCount', countEl],
      ['emptyState', emptyEl],
      ['offerSearch', searchEl],
      ['pagination', paginationEl],
      ['offerDialog', dialogEl],
      ['offerDialogContent', dialogContentEl],
      ['offerDialogClose', dialogCloseEl]
    ];
    const missingElements = requiredElements.filter(function (item) { return !item[1]; }).map(function (item) { return item[0]; });
    if (missingElements.length) {
      console.error('CWP offers page initialization stopped. Missing required HTML elements: ' + missingElements.join(', '));
      return;
    }

    if ('IntersectionObserver' in window && loadMoreSentinelEl) {
      loadMoreObserver = new IntersectionObserver(function (entries) {
        if (hasUserScrolledSinceRender && entries.some(function (entry) { return entry.isIntersecting; })) appendMoreOffers();
      }, { root: null, rootMargin: '100px 0px', threshold: 0 });
      // Do not fill the page automatically on first paint. User scrolling unlocks the next batch.
      let scrollCheckPending = false;
      const unlockLazyLoad = function () {
        hasUserScrolledSinceRender = true;
        if (scrollCheckPending) return;
        scrollCheckPending = true;
        window.requestAnimationFrame(function () {
          scrollCheckPending = false;
          if (!loadMoreSentinelEl.hidden) {
            const rect = loadMoreSentinelEl.getBoundingClientRect();
            if (rect.top <= window.innerHeight + 100 && rect.bottom >= -100) appendMoreOffers();
          }
        });
      };
      window.addEventListener('scroll', unlockLazyLoad, { passive: true });
    } else if (loadMoreSentinelEl) {
      let scrollCheckPending = false;
      const checkLoadMore = function (isUserScroll) {
        if (isUserScroll) hasUserScrolledSinceRender = true;
        if (!hasUserScrolledSinceRender || scrollCheckPending) return;
        scrollCheckPending = true;
        window.requestAnimationFrame(function () {
          scrollCheckPending = false;
          if (loadMoreSentinelEl.hidden) return;
          const rect = loadMoreSentinelEl.getBoundingClientRect();
          if (rect.top <= window.innerHeight + 100) appendMoreOffers();
        });
      };
      window.addEventListener('scroll', function () { checkLoadMore(true); }, { passive: true });
      window.addEventListener('resize', function () { checkLoadMore(false); });
    }

    if (!countrySelectEl || !languageSelectEl) {
      countEl.textContent = 'Country and language selectors could not be initialised.';
      return;
    }

    countrySelectEl.addEventListener('change', function () {
      currentCountry = countrySelectEl.value === 'HK' ? 'HK' : 'SG';
      setLanguageOptions('EN');
      updateMarketUrl(true);
      loadSelectedContext(false);
    });

    languageSelectEl.addEventListener('change', function () {
      currentLanguage = currentCountry === 'HK' && languageSelectEl.value === 'CN' ? 'CN' : 'EN';
      updateMarketUrl(true);
      loadSelectedContext(false);
    });

    const initialParams = getUrlParams();
    const initialCountry = initialParams.get('country');
    const initialLanguage = initialParams.get('language');
    if (initialCountry === 'SG' || initialCountry === 'HK') countrySelectEl.value = initialCountry;

    currentCountry = countrySelectEl.value === 'HK' ? 'HK' : 'SG';
    setLanguageOptions(initialLanguage);
    currentLanguage = languageSelectEl.value;
    updateLocalizedShell();
    loadSelectedContext(false);

    searchEl.addEventListener('input', function () {
      if (!hasOfferDataset) return;
      searchQuery = searchEl.value || '';
      currentPage = 1;
      renderOffers();
    });
    window.addEventListener('hashchange', syncFromHash);

    dialogCloseEl.addEventListener('click', closeOfferDialog);
    dialogEl.addEventListener('click', function (event) {
      // Clicking the backdrop area closes the dialog; clicks within the white surface do not.
      if (event.target === dialogEl) closeOfferDialog();
    });
    dialogEl.addEventListener('close', restoreDialogFocus);

    // Apply a category bookmark only when the selected country has an available dataset.
    if (hasOfferDataset) {
      const hash = getDecodedHash();
      const initialFilter = filterDefinitions.find(function (item) { return item.hash === hash; });
      if (initialFilter) {
        chooseFilter(initialFilter.value, false);
      } else if (hash === 'all-offers' || hash === 'highlights') {
        chooseFilter('__all__', false);
      } else {
        chooseFilter('__all__', false);
        if (!window.location.hash) {
          try { window.history.replaceState(null, '', window.location.pathname + window.location.search + '#all-offers'); }
          catch (error) { window.location.hash = 'all-offers'; }
        }
      }
    }

    // Deep-link query handling is applied after the selected market has been loaded.
    openRequestedOfferFromUrl();
    // Keep expiry state fresh even if a page remains open across local midnight.
    scheduleExpiryRefresh();
  }
  init();
})();
