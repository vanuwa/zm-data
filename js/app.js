(function (window) {
  const document = window.document;
  const localStorage = window.localStorage;
  console.log('Welcome to Zen money explorer.');

  class RemoteDataSource {
    static async getData(server_ts = 0) {
      const request_body = {
        currentClientTimestamp:  (new Date()).getTime() / 1000,
        serverTimestamp: server_ts
      };

      console.log('[RemoteDataSource] Request body:', request_body);

      const response = await fetch('https://api.zenmoney.ru/v8/diff', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${window.ZEN_MONEY_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request_body)
      });

      console.log('[RemoteDataSource] Request sent');

      return await response.json();
    }

    static async readAll() {
      const data = await RemoteDataSource.getData(0);

      console.log('[RemoteDataSource][readAll] Response received');
      console.dir(data);

      return data;
    }

    static async readRecentUpdates(recent_server_timestamp) {
      const data = await RemoteDataSource.getData(recent_server_timestamp);

      console.log('[RemoteDataSource][readRecentUpdates] Response received');
      console.dir(data);

      return data;
    }
  }

  class Account {
    static appendDataToElement(collection, parent_element = document.getElementsByTagName('body')[0]) {
      const wrapper_el = document.createElement('div');

      wrapper_el.innerHTML = collection.map((item) => Account.renderOneHtml(item)).join('');

      parent_element.appendChild(wrapper_el);

      return wrapper_el;
    }

    static renderOneHtml(model) {
      return `<div><span>${model.title}</span>:&#9;&#9;<span><b>${model.balance}</b></span></div>`;
    }
  }

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

    const server_timestamp = parseInt(localStorage.getItem('server_timestamp') || 0, 10);
    const data = await RemoteDataSource.readRecentUpdates(server_timestamp);
    const { account, serverTimestamp, user, budget, merchant } = data;

    localStorage.setItem('serverTimestamp', JSON.stringify(serverTimestamp));
    localStorage.setItem('account', JSON.stringify(account));
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('budget', JSON.stringify(budget));
    localStorage.setItem('merchant', JSON.stringify(merchant));

    Account.appendDataToElement(account.filter(({ archive }) => !archive));
  }



})(window)
