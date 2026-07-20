(function () {
  function ensureErrorContainer(fieldEl) {
    const existing = fieldEl.parentElement && fieldEl.parentElement.querySelector('.field-error');
    if (existing) return existing;
    const error = document.createElement('div');
    error.className = 'field-error';
    error.setAttribute('role', 'alert');
    error.style.display = 'none';
    const parent = fieldEl.closest('.field') || fieldEl.parentElement;
    if (!parent) return null;
    parent.appendChild(error);
    return error;
  }

  function setFieldError(fieldEl, message) {
    if (!fieldEl) return;
    const input = fieldEl;
    input.classList.add('input--invalid');
    const errorEl = ensureErrorContainer(input);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  }

  function clearFieldError(fieldEl) {
    if (!fieldEl) return;
    fieldEl.classList.remove('input--invalid');
    const errorEl = fieldEl.closest('.field')?.querySelector('.field-error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  }

  // Custom validation helpers
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
  }

  function isValidFullName(name) {
    const v = String(name || '').trim();
    if (v.length < 3) return false;
    const normalized = v.replace(/\s+/g, ' ');
    return /^[A-Za-z ]+$/.test(normalized);
  }

  function initContactFormValidation() {
    const contactForm = document.getElementById('contact-form') || document.querySelector('.contact-panel form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
      let ok = true;
      contactForm.querySelectorAll('.input--invalid').forEach((el) => el.classList.remove('input--invalid'));
      contactForm.querySelectorAll('.field-error').forEach((el) => { el.textContent = ''; el.style.display = 'none'; });

      const nameField = contactForm.querySelector('input[name="name"]');
      const emailField = contactForm.querySelector('input[type="email"][name="email"]');
      const topicField = contactForm.querySelector('select[name="topic"]');
      const preferredField = contactForm.querySelector('select[name="preferred"]');
      const messageField = contactForm.querySelector('textarea[name="message"]');

      if (!nameField || !isValidFullName(nameField.value)) { ok = false; setFieldError(nameField, 'Please enter a valid full name.'); }
      if (!emailField || !isValidEmail(emailField.value)) { ok = false; setFieldError(emailField, 'Please enter a valid email address.'); }
      if (!topicField || !topicField.value) { ok = false; setFieldError(topicField, 'Please select a topic.'); }
      if (!preferredField || !preferredField.value) { ok = false; setFieldError(preferredField, 'Please select your preferred contact method.'); }
      const msgVal = (messageField && messageField.value || '').trim();
      if (!messageField || msgVal.length < 10) { ok = false; setFieldError(messageField, 'Please enter a message (minimum 10 characters).'); }

      if (!ok) {
        e.preventDefault();
        e.stopPropagation();
        const firstInvalid = contactForm.querySelector('.input--invalid');
        if (firstInvalid && typeof firstInvalid.focus === 'function') firstInvalid.focus({ preventScroll: true });
        return;
      }
    });

    contactForm.addEventListener('input', (e) => {
      const t = e.target;
      if (!t) return;
      if (t.classList.contains('input--invalid')) {
        const name = (t.name || '').toLowerCase();
        let valid = false;
        if (t.type === 'text' && name === 'name') valid = isValidFullName(t.value);
        else if (t.type === 'email') valid = isValidEmail(t.value);
        else if (t.tagName === 'SELECT') valid = !!t.value;
        else if (t.tagName === 'TEXTAREA') valid = (t.value || '').trim().length >= 10;
        if (valid) clearFieldError(t);
      }
    });
  }

  // Allow core.js or HTML to initialize this
  window.initForms = function() {
    initContactFormValidation();
  };

})();
