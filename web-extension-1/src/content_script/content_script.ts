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

const modifyPage = (data : any) => {
  const { counter } = data;
  if (counter) {
    document.body.innerHTML = messageFormat(counter);
  }
}

// setup the listener
// waiting in our case from the message using a counter variable
// (see function ` popupOpened ` in backgroung.ts )
browser.runtime.onMessage.addListener((request) => {
  modifyPage(request)
  return Promise.resolve({response: 'ok'});
});

// port.onMessage.addListener((request) => {
//   modifyPage(request)
//   return Promise.resolve({response: 'ok'});
// });