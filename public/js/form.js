const requestForm = document.querySelector('#request-form');

if (requestForm) {
  const message = document.querySelector('#request-form-message');
  const submitButton = requestForm.querySelector('button[type="submit"]');

  requestForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    submitButton.disabled = true;
    message.textContent = 'Отправляем заявку...';

    const formData = new FormData(requestForm);
    const request = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Не удалось отправить заявку.');
      }

      requestForm.reset();
      message.textContent = 'Заявка отправлена. Мы скоро с вами свяжемся.';
    } catch (error) {
      message.textContent = error.message || 'Ошибка отправки. Попробуйте ещё раз.';
    } finally {
      submitButton.disabled = false;
    }
  });
}