const externalLinks = {
  wahoo: {
    href: 'https://www.wahoofitness.com/',
    label: 'Open Wahoo link',
    copy: 'Add your Wahoo route or live tracking link here so people can follow along from the landing page.'
  }
};

const fallbackDay = {
  id: '001',
  title: 'In transit',
  summary: 'Fallback day content shown because the live day JSON could not be loaded.',
  coordinates: {
    lat: 25.033,
    lon: 121.5654
  },
  blocks: [
    {
      type: 'image',
      variant: 'portrait',
      offset: 'right',
      image:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80',
      eyebrow: 'Fallback',
      caption: 'The saved local fallback is standing in until the main day content loads.'
    },
    {
      type: 'details',
      offset: 'right',
      story:
        'If you are seeing this, the page could not load content/day-001.json. The site shell is still working, but the richer story content is unavailable right now.',
      details: [
        { label: 'Status', value: 'Fallback content active.' },
        { label: 'Suggested check', value: 'Confirm the JSON file and local server are available.' }
      ]
    }
  ]
};

function escapeAttribute(value) {
  return String(value ?? '').replace(/"/g, '&quot;');
}

function blockOffsetClass(offset) {
  if (offset === 'left') return 'story-panel--offset-left';
  if (offset === 'narrow') return 'story-panel--narrow';
  return 'story-panel--offset-right';
}

function renderImageBlock(block) {
  const cascadeClass = block.cascade ? 'story-panel--cascade' : '';

  return `
    <article
      class="story-panel story-panel--image story-panel--${block.variant} ${blockOffsetClass(block.offset)} ${cascadeClass}"
      data-parallax
      style="background-image: linear-gradient(180deg, rgba(8, 12, 12, 0.1), rgba(8, 12, 12, 0.74)), url('${escapeAttribute(block.image)}')"
    >
      <div class="story-panel__overlay reveal">
        <p class="story-panel__eyebrow">${block.eyebrow || ''}</p>
        <p class="story-panel__caption">${block.caption || ''}</p>
      </div>
    </article>
  `;
}

function renderTextBlock(block) {
  return `
    <article class="story-panel story-panel--text ${blockOffsetClass(block.offset)} reveal" data-parallax>
      <p class="story-fragment">${block.text || ''}</p>
    </article>
  `;
}

function renderDetailsBlock(block) {
  const details = Array.isArray(block.details) ? block.details : [];

  return `
    <article class="story-panel story-panel--details ${blockOffsetClass(block.offset)}" data-parallax>
      <div class="story-panel__card reveal">
        <article class="journal-card">
          <div class="journal-card__story">
            <p>${block.story || ''}</p>
          </div>
          <div class="journal-card__meta">
            ${details
              .map(
                (detail) => `
                  <div class="meta-chip reveal">
                    <strong class="detail-label">${detail.label || ''}</strong>
                    <span>${detail.value || ''}</span>
                  </div>
                `
              )
              .join('')}
          </div>
        </article>
      </div>
    </article>
  `;
}

function renderDayBlocks(day) {
  return day.blocks
    .map((block) => {
      if (block.type === 'image') return renderImageBlock(block);
      if (block.type === 'details') return renderDetailsBlock(block);
      return renderTextBlock(block);
    })
    .join('');
}

function applyHeroImage(src) {
  const hero = document.querySelector('#hero');
  const photo = document.querySelector('#hero-photo');

  if (!hero || !photo || !src) return;

  const loader = new window.Image();
  loader.onload = () => {
    photo.src = src;
    photo.hidden = false;
    hero.classList.add('hero--custom-image');
  };
  loader.src = src;
}

async function wireHeroImage() {
  try {
    const response = await fetch('api/latest-upload', { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      if (data.path) {
        applyHeroImage(data.path);
        return;
      }
    }
  } catch (error) {
    // Use fallback image below.
  }

  applyHeroImage('assets/hero-taipei.jpg');
}

function hydrateExternalLinks() {
  const wahooLink = document.querySelector('#wahoo-link');
  const wahooCopy = document.querySelector('#wahoo-link-copy');
  const config = externalLinks.wahoo;

  if (wahooLink && config && config.href) {
    wahooLink.href = config.href;
  }

  if (wahooLink && config && config.label) {
    wahooLink.textContent = config.label;
  }

  if (wahooCopy && config && config.copy) {
    wahooCopy.textContent = config.copy;
  }
}

function wireReveals() {
  const revealNodes = Array.from(document.querySelectorAll('.reveal'));

  if (revealNodes.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    revealNodes.forEach((node) => node.classList.add('is-visible'));
    return;
  }

  const observer = new window.IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: '0px 0px -8% 0px'
    }
  );

  revealNodes.forEach((node) => observer.observe(node));
}

function wireParallax() {
  const parallaxNodes = Array.from(document.querySelectorAll('[data-parallax]'));

  if (parallaxNodes.length === 0) return;

  const update = () => {
    const viewportHeight = window.innerHeight || 1;

    parallaxNodes.forEach((node) => {
      const rect = node.getBoundingClientRect();
      const progress = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
      const offset = Math.max(-24, Math.min(24, progress * -18));
      node.style.setProperty('--parallax-offset', `${offset}px`);
    });
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}

function hydrateDayHeader(day) {
  const titleNode = document.querySelector('#day-title');
  const summaryNode = document.querySelector('#day-summary');

  if (titleNode && day && day.title) {
    titleNode.textContent = day.title;
  }

  if (summaryNode && day && day.summary) {
    summaryNode.textContent = day.summary;
  }
}

function animateCoordinates(day) {
  const coordinateNode = document.querySelector('#day-coordinates');

  if (!coordinateNode || !day || !day.coordinates) return;

  const lat = Number(day.coordinates.lat || 0).toFixed(4);
  const lon = Number(day.coordinates.lon || 0).toFixed(4);
  coordinateNode.textContent = `Lat ${lat}° · Lon ${lon}°`;
}

async function loadDayPhotos(dayId) {
  try {
    const response = await fetch(`api/day-photos?day=day-${dayId}`, { cache: 'no-store' });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data.photos) ? data.photos : [];
  } catch (error) {
    return [];
  }
}

function hydrateDayWithPhotos(day, localPhotos) {
  if (!Array.isArray(localPhotos) || localPhotos.length === 0) {
    return day;
  }

  let photoIndex = 0;
  const blocks = day.blocks.map((block) => {
    if (block.type !== 'image') {
      return block;
    }

    const localPhoto = localPhotos[photoIndex];
    photoIndex += 1;

    return {
      ...block,
      image: localPhoto || block.image
    };
  });

  const extraPhotos = localPhotos.slice(photoIndex).map((photo, extraIndex) => ({
    type: 'image',
    variant: extraIndex % 2 === 0 ? 'portrait' : 'landscape',
    offset: extraIndex % 2 === 0 ? 'right' : 'left',
    cascade: extraIndex % 2 === 1,
    image: photo,
    eyebrow: `Photo ${String(photoIndex + extraIndex + 1).padStart(2, '0')}`,
    caption: 'Still here. Another fragment from the day.'
  }));

  return {
    ...day,
    blocks: [...blocks, ...extraPhotos]
  };
}

async function loadDay() {
  try {
    const response = await fetch('content/day-001.json', { cache: 'no-store' });

    if (!response.ok) {
      return fallbackDay;
    }

    const day = await response.json();
    const localPhotos = await loadDayPhotos(day.id);
    return hydrateDayWithPhotos(day, localPhotos);
  } catch (error) {
    return fallbackDay;
  }
}

async function initializeApp() {
  const panelsRoot = document.querySelector('#day-panels-root');
  const day = await loadDay();

  if (panelsRoot) {
    panelsRoot.innerHTML = renderDayBlocks(day);
  }

  hydrateDayHeader(day);
  animateCoordinates(day);
  wireReveals();
  wireParallax();
  wireHeroImage();
  hydrateExternalLinks();
}

if (typeof window !== 'undefined') {
  initializeApp();
}
