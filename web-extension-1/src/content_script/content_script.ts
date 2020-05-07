// import { Itab } from '../interfaces/tab'

const port = browser.runtime.connect(browser.runtime.id, { name: 'content_script/lifecycle' });

// perform cleanup here
port.onDisconnect.addListener(() => {
  browser.runtime.onMessage.removeListener((any) => {})
  //
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

port.onMessage.addListener((request:any) => {
  modifyPage(request)
  // return a promise as standard listener response
  return Promise.resolve({response: 'ok'});
});
