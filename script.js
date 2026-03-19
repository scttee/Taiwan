const futureFields = [
  'photos',
  'daily note',
  'what I ate',
  'what I listened to',
  'distance ridden',
  'map pins'
];

const fallbackDays = [
  {
    id: '001',
    title: 'In transit',
    summary:
      'Before the road, there is transit. Terminal light, stale cabin air, the weight of the bike box, and that thin line between leaving and arriving.',
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
        eyebrow: 'Departure',
        caption: 'The city falls away slowly. My head is crowded, but the body keeps moving.'
      },
      {
        type: 'text',
        offset: 'left',
        text: 'Early light on the terminal glass. Coffee that barely touches the nerves. The bike box awkward against my legs. Nothing resolved. Just motion.'
      },
      {
        type: 'details',
        offset: 'right',
        story:
          'This day is all thresholds. Home behind me. Taiwan still ahead. I keep circling the same feeling: not fear exactly, not ease either. Just the strange quiet that comes when everything practical is done and there is nothing left but to go. The body knows it before the mind does. Shoulders tight. Breath shallow. Then, little by little, the space is opening.',
        details: [
          { label: 'What I listened to', value: 'Boarding calls, cabin air, a playlist low in my ears.' },
          { label: 'What I ate', value: 'Airport coffee, something warm, something easy.' },
          { label: 'Distance ridden', value: '0 km. Still here, not moving under my own power yet.' },
          { label: 'Map pins', value: 'Home. Airport. Arrival. Foundations, not mileage.' }
        ]
      },
      {
        type: 'image',
        variant: 'landscape',
        offset: 'left',
        image:
          'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1800&q=80',
        eyebrow: 'Arrival',
        caption: 'The air changes first. Then the light. Then the small sense that something has opened.'
      },
      {
        type: 'text',
        offset: 'narrow',
        text: 'By the end of the day I am carrying the same body into a different place. Not settled. Not clear. But pointed somewhere.'
      }
    ]
  }
];

function blockOffsetClass(offset) {
  if (offset === 'left') return 'story-panel--offset-left';
  if (offset === 'narrow') return 'story-panel--narrow';
  return 'story-panel--offset-right';
}

function renderDetailsBlock(block) {
  return `
    <article class="story-panel story-panel--details ${blockOffsetClass(block.offset)}" data-parallax>
      <div class="story-panel__card reveal">
        <article class="journal-card">
          <div class="journal-card__story">
            <p>${block.story}</p>
          </div>
          <div class="journal-card__meta">
            ${block.details
              .map(
                (detail) => `
                  <div class="meta-chip reveal">
                    <strong class="detail-label">${detail.label}</strong>
                    <span>${detail.value}</span>
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

function renderImageBlock(block) {
  const cascadeClass = block.cascade ? 'story-panel--cascade' : '';
  return `
    <article
      class="story-panel story-panel--image story-panel--${block.variant} ${blockOffsetClass(block.offset)} ${cascadeClass}"
      data-parallax
      style="background-image: linear-gradient(180deg, rgba(8, 12, 12, 0.1), rgba(8, 12, 12, 0.74)), url('${block.image}')"
    >
      <div class="story-panel__overlay reveal">
        <p class="story-panel__eyebrow">${block.eyebrow}</p>
        <p class="story-panel__caption write-on" data-full-text="${block.caption.replace(/"/g, '&quot;')}">${block.caption}</p>
      </div>
    </article>
  `;
}

function renderTextBlock(block) {
  return `
    <article class="story-panel story-panel--text ${blockOffsetClass(block.offset)} reveal" data-parallax>
      <p class="story-fragment write-on" data-full-text="${block.text.replace(/"/g, '&quot;')}">${block.text}</p>
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
    // fall through to the default hero asset
  }

  applyHeroImage('assets/hero-taipei.jpg');
}


function animateWriteOn(element) {
  if (!element || element.dataset.animated === 'true') return;

  const fullText = element.dataset.fullText || element.textContent || '';
  element.dataset.animated = 'true';

  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    element.textContent = fullText;
    return;
  }

  const fragments = fullText.match(/(\S+|\s+)/g) || [];
  const wordNodes = [];
  const fragmentRoot = document.createDocumentFragment();

  fragments.forEach((fragment) => {
    if (/^\s+$/.test(fragment)) {
      fragmentRoot.appendChild(document.createTextNode(fragment));
      return;
    }

    const token = document.createElement('span');
    token.className = 'write-on__token';
    token.textContent = fragment;
    fragmentRoot.appendChild(token);
    wordNodes.push(token);
  });

  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }

  element.appendChild(fragmentRoot);

  let index = 0;
  const tick = () => {
    if (index >= wordNodes.length) return;

    wordNodes[index].classList.add('is-visible');
    index += 1;

    if (index < wordNodes.length) {
      window.setTimeout(tick, 90);
    }
  };

  tick();
}

function animateWriteOnsWithin(root) {
  if (!root) return;

  if (root.classList && root.classList.contains('write-on')) {
    animateWriteOn(root);
  }

  if (typeof root.querySelectorAll !== 'function') return;

  root.querySelectorAll('.write-on').forEach((element) => animateWriteOn(element));
}

function wireReveals() {
  if ('IntersectionObserver' in window) {
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            animateWriteOnsWithin(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -8% 0px'
      }
    );

    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  } else {
    document.querySelectorAll('.reveal').forEach((element) => {
      element.classList.add('is-visible');
      animateWriteOnsWithin(element);
    });
  }
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

  if (titleNode && day?.title) {
    titleNode.textContent = day.title;
  }

  if (summaryNode && day?.summary) {
    summaryNode.textContent = day.summary;
  }
}

function animateCoordinates(day) {
  const coordinateNode = document.querySelector('#day-coordinates');
  if (!coordinateNode || !day || !day.coordinates) return;

  const targetLat = Number(day.coordinates.lat || 0);
  const targetLon = Number(day.coordinates.lon || 0);
  const duration = 1600;
  const scrambleDuration = 700;
  const start = performance.now();

  const randomNear = (value, spread) => value + (Math.random() * spread * 2 - spread);

  const frame = (now) => {
    const elapsed = now - start;
    const progress = Math.min(1, elapsed / duration);

    if (elapsed < scrambleDuration) {
      coordinateNode.textContent = `Lat ${randomNear(targetLat, 2.2).toFixed(4)}° · Lon ${randomNear(targetLon, 2.2).toFixed(4)}°`;
      window.requestAnimationFrame(frame);
      return;
    }

    const settleProgress = Math.min(1, (elapsed - scrambleDuration) / (duration - scrambleDuration));
    const eased = 1 - Math.pow(1 - settleProgress, 3);
    const currentLat = randomNear(targetLat, 0.4) * (1 - eased) + targetLat * eased;
    const currentLon = randomNear(targetLon, 0.4) * (1 - eased) + targetLon * eased;

    coordinateNode.textContent = `Lat ${currentLat.toFixed(4)}° · Lon ${currentLon.toFixed(4)}°`;

    if (progress < 1) {
      window.requestAnimationFrame(frame);
    } else {
      coordinateNode.textContent = `Lat ${targetLat.toFixed(4)}° · Lon ${targetLon.toFixed(4)}°`;
    }
  };

  window.requestAnimationFrame(frame);
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

async function loadDays() {
  try {
    const response = await fetch('content/day-001.json', { cache: 'no-store' });

    if (!response.ok) {
      return fallbackDays;
    }

    const day = await response.json();
    const localPhotos = await loadDayPhotos(day.id);
    return [hydrateDayWithPhotos(day, localPhotos)];
  } catch (error) {
    return fallbackDays;
  }
}

if (typeof window !== 'undefined') {
  window.taiwanAdventureConfig = {
    mode: 'editorial-landing',
    revealStrategy: 'day-by-day',
    futureFields,
    days: fallbackDays
  };

  const panelsRoot = document.querySelector('#day-panels-root');

  loadDays().then((days) => {
    window.taiwanAdventureConfig.days = days;

    const firstDay = days[0];
    if (panelsRoot && firstDay) {
      panelsRoot.innerHTML = renderDayBlocks(firstDay);
    }

    hydrateDayHeader(firstDay);
    animateCoordinates(firstDay);
    wireReveals();
    wireParallax();
  });

  wireHeroImage();
}
