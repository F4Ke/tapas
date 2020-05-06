import { Itab } from '../interfaces/tab'

const port = browser.runtime.connect(browser.runtime.id, { name: 'content_script/lifecycle' });

// perform cleanup here
port.onDisconnect.addListener(() => {
  console.log('cleanup');
  // browser.runtime.onMessage.removeListener ...
});

const messageFormat = (counter: number) => {
  return `Popup opened ${counter} times on this tab`;
}

// setup the listener
// waiting in our case from the message using a counter variable
// (see function ` popupOpened ` in backgroung.ts )
browser.runtime.onMessage.addListener((request) => {
  if (request.counter) {
    document.body.innerHTML = messageFormat(request.counter);
  }
  return Promise.resolve({response: 'ok'});
});