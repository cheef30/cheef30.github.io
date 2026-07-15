document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const WEB3FORMS_ACCESS_KEY = '5aae03ad-b247-44e8-9cbd-7bd2b84cea72';

  /* ---- Shoot-type pill selector (acts like a single-select) ---- */
  const pills = document.querySelectorAll('.pill-btn');
  const shootTypeInput = document.getElementById('shoot-type');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const alreadyActive = pill.classList.contains('active');
      pills.forEach(p => p.classList.remove('active'));
      if (!alreadyActive) {
        pill.classList.add('active');
        shootTypeInput.value = pill.textContent.trim();
      } else {
        shootTypeInput.value = '';
      }
    });
  });

  /* ---- Submit: send directly via Web3Forms, no email app required ---- */
  const submitBtn = form.querySelector('.btn-solid');
  const successMsg = document.getElementById('form-success');
  const errorMsg = document.getElementById('form-error');
  const submitBtnDefaultText = submitBtn.textContent;

  const currentLang = () => (document.documentElement.lang === 'sr' ? 'sr' : 'en');
  const sendingText = { en: 'SENDING...', sr: 'ŠALJEM...' };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    successMsg?.classList.remove('show');
    errorMsg?.classList.remove('show');
    submitBtn.disabled = true;
    submitBtn.textContent = sendingText[currentLang()];

    const formData = new FormData(form);
    formData.append('access_key', WEB3FORMS_ACCESS_KEY);
    formData.append('subject', `New inquiry from ${form.name.value.trim()}`);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        successMsg?.classList.add('show');
        form.reset();
        pills.forEach(p => p.classList.remove('active'));
        shootTypeInput.value = '';
      } else {
        errorMsg?.classList.add('show');
      }
    } catch (err) {
      errorMsg?.classList.add('show');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = submitBtnDefaultText;
    }
  });
});
