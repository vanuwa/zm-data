(function (window) {
  const document = window.document;
  const localStorage = window.localStorage;
  console.log('Welcome to Zen money explorer.');

  const token_form = document.getElementById('zm-token-form');
  const eventTarget = initializeEventTarget();

  if (!window.ZEN_MONEY_TOKEN) {
    const form_data = collectFormData(token_form);
    window.ZEN_MONEY_TOKEN = localStorage.getItem(Object.keys(form_data)[0]);

    window.ZEN_MONEY_TOKEN && eventTarget.dispatchEvent(new Event('request-info'));
  }

  console.log(`ZEN_MONEY_TOKEN: ${window.ZEN_MONEY_TOKEN}`);

  token_form.addEventListener('submit', (event) => {
    event.stopPropagation();
    event.preventDefault();

    console.log(event);

    const data = collectFormData(token_form);

    console.log(data);

    Object.entries(data).forEach(([key, value]) => localStorage.setItem(key, value.toString()));

    token_form.elements[0].value = '';

    eventTarget.dispatchEvent(new Event('request-info'));

    return false;
  });

  function collectFormData(form_element) {
    if (!(form_element || {}).elements) {
      return {};
    }

    return Object.values(form_element.elements).reduce((accumulator, field) => {
      accumulator[field.name] = field.value;

      return accumulator;
    }, {});
  }

  function initializeEventTarget() {
    const eventTarget = new EventTarget();

    eventTarget.addEventListener('request-info', handleRequestInfo);

    return eventTarget;
  }

  async function handleRequestInfo(event) {
    console.log('eventTarget:request-info');
    console.log(event);

    const request_body = {
      currentClientTimestamp:  (new Date()).getTime() / 1000,
      serverTimestamp: 0
    };

    console.log('request body:', request_body);

    const response = await fetch('https://api.zenmoney.ru/v8/diff', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${window.ZEN_MONEY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request_body)
    });
    const data = await response.json();

    console.log('waiting for json');
    console.dir(data);

  }

  window.testMe = collectFormData;
})(window)
