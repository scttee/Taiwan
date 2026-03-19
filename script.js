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
    story:
      'A placeholder for the travel day itself: the airport blur, the boxed bike, coffee before boarding, playlists through the long haul, and that suspended feeling where the adventure has started even if the riding has not.',
    details: [
      { label: 'What I listened to', value: 'Departure playlists, cabin hum, and whatever matched the pre-ride nerves.' },
      { label: 'What I ate', value: 'Airport coffee, plane snacks, and something simple after landing.' },
      { label: 'Distance ridden', value: '0 km — only the journey in.' },
      { label: 'Map pins', value: 'Home → airport → Taiwan arrival.' }
    ]
  }
];

if (typeof window !== 'undefined') {
  window.taiwanAdventureConfig = {
    mode: 'editorial-landing',
    revealStrategy: 'day-by-day',
    futureFields,
    days
  };

  const root = document.querySelector('#day-preview-root');
  const firstDay = days[0];

  if (root && firstDay) {
    root.innerHTML = `
      <article class="journal-card">
        <div class="journal-card__story">
          <p>${firstDay.story}</p>
        </div>
        <div class="journal-card__meta">
          ${firstDay.details
            .map(
              (detail) => `
                <div class="meta-chip">
                  <strong class="detail-label">${detail.label}</strong>
                  <span>${detail.value}</span>
                </div>
              `
            )
            .join('')}
        </div>
      </article>
    `;
  }
}
