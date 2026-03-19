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
    title: 'Flying journey.',
    story:
      'Placeholder for the travel day itself: airport energy, boxed bike nerves, snacks grabbed in transit, playlists on repeat, and that feeling that the real adventure is just about to begin.',
    details: [
      { label: 'What I listened to', value: 'In-flight headphones and anticipation.' },
      { label: 'What I ate', value: 'Airport coffee, plane snacks, something comforting on arrival.' },
      { label: 'Distance ridden', value: '0 km — just the journey in.' },
      { label: 'Best note', value: 'Today is for arriving, adjusting, and beginning.' }
    ]
  }
];

if (typeof window !== 'undefined') {
  window.taiwanAdventureConfig = {
    mode: 'landing-plus-day-001',
    revealStrategy: 'day-by-day',
    futureFields,
    days
  };

  const root = document.querySelector('#day-preview-root');
  const firstDay = days[0];

  if (root && firstDay) {
    root.innerHTML = `
      <article class="journal-card">
        <div class="journal-card__grid">
          <div class="journal-card__story">
            <p>${firstDay.story}</p>
          </div>
          <div class="journal-card__meta">
            ${firstDay.details
              .map(
                (detail) => `
                  <div class="meta-chip">
                    <strong>${detail.label}</strong>
                    <span>${detail.value}</span>
                  </div>
                `
              )
              .join('')}
          </div>
        </div>
      </article>
    `;
  }
}
