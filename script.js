const futureFields = [
  'photos',
  'daily note',
  'what I ate',
  'what I listened to',
  'distance ridden',
  'map pins'
];

const days = [
  {
    id: '001',
    title: 'Flying journey',
    summary:
      'First movement, not first miles. Airports, transit, bike bags, anticipation, and the soft start before the road really begins.',
    blocks: [
      {
        type: 'image',
        variant: 'portrait',
        offset: 'right',
        image:
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80',
        eyebrow: 'Departure',
        caption: 'The trip starts in the in-between.'
      },
      {
        type: 'text',
        offset: 'left',
        text: 'You leave home before the adventure has a shape. It’s still just tickets, nerves, and possibility.'
      },
      {
        type: 'details',
        offset: 'right',
        story:
          'A placeholder for the travel day itself: the airport blur, the boxed bike, coffee before boarding, playlists through the long haul, and that suspended feeling where the adventure has started even if the riding has not.',
        details: [
          { label: 'What I listened to', value: 'Departure playlists, cabin hum, and whatever matched the pre-ride nerves.' },
          { label: 'What I ate', value: 'Airport coffee, plane snacks, and something simple after landing.' },
          { label: 'Distance ridden', value: '0 km — only the journey in.' },
          { label: 'Map pins', value: 'Home → airport → Taiwan arrival.' }
        ]
      },
      {
        type: 'image',
        variant: 'landscape',
        offset: 'left',
        image:
          'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1800&q=80',
        eyebrow: 'Arrival',
        caption: 'New light, new air, new map to unfold.'
      },
      {
        type: 'text',
        offset: 'narrow',
        text: 'Then the first quiet moment lands: the bike is here, you are here, and tomorrow becomes real.'
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

if (typeof window !== 'undefined') {
  window.taiwanAdventureConfig = {
    mode: 'editorial-landing',
    revealStrategy: 'day-by-day',
    futureFields,
    days
  };

  const firstDay = days[0];
  const panelsRoot = document.querySelector('#day-panels-root');

  if (panelsRoot && firstDay) {
    panelsRoot.innerHTML = renderDayBlocks(firstDay);
  }

  wireReveals();
}
