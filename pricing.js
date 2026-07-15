document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.pricing-card');
  if (!cards.length) return;

  cards.forEach((card) => {
    const link = card.querySelector('.pricing-cta-btn');

    const setFlipped = (flipped) => {
      card.classList.toggle('flipped', flipped);
      card.setAttribute('aria-pressed', String(flipped));
      if (link) link.tabIndex = flipped ? 0 : -1;
    };

    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return; // let the link navigate normally
      setFlipped(!card.classList.contains('flipped'));
    });

    card.addEventListener('keydown', (e) => {
      if (e.target !== card) return; // don't hijack Enter on the link itself
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setFlipped(!card.classList.contains('flipped'));
      } else if (e.key === 'Escape') {
        setFlipped(false);
      }
    });

    card.addEventListener('blur', (e) => {
      // Flip back once focus leaves the card entirely (not moving to its own link).
      if (!card.contains(e.relatedTarget)) setFlipped(false);
    });
  });

  // Tapping elsewhere on the page flips any open card back (nicer on touch).
  document.addEventListener('click', (e) => {
    if (e.target.closest('.pricing-card')) return;
    cards.forEach((card) => {
      if (!card.classList.contains('flipped')) return;
      card.classList.remove('flipped');
      card.setAttribute('aria-pressed', 'false');
      const link = card.querySelector('.pricing-cta-btn');
      if (link) link.tabIndex = -1;
    });
  });
});
