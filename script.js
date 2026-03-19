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
    <article class="story-panel story-panel--details ${blockOffsetClass(block.offset)}">
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
  return `
    <article
      class="story-panel story-panel--image story-panel--${block.variant} ${blockOffsetClass(block.offset)}"
      style="background-image: linear-gradient(180deg, rgba(8, 12, 12, 0.1), rgba(8, 12, 12, 0.74)), url('${block.image}')"
    >
      <div class="story-panel__overlay reveal">
        <p class="story-panel__eyebrow">${block.eyebrow}</p>
        <p class="story-panel__caption">${block.caption}</p>
      </div>
    </article>
  `;
}

function renderTextBlock(block) {
  return `
    <article class="story-panel story-panel--text ${blockOffsetClass(block.offset)} reveal">
      <p class="story-fragment">${block.text}</p>
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

function wireReveals() {
  if ('IntersectionObserver' in window) {
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
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
    document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
  }
}

async function loadDays() {
  try {
    const response = await fetch('content/day-001.json', { cache: 'no-store' });

    if (!response.ok) {
      return fallbackDays;
    }

    const day = await response.json();
    return [day];
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

    wireReveals();
  });

  wireHeroImage();
}
