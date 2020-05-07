const port = browser.runtime.connect(browser.runtime.id, { name: 'content_script/lifecycle' });

const messageFormat = (counter: number) => {
  return `<h4>Popup opened ${counter} times on this tab</h4>`;
}

const modifyPage = (data : any) => {
  const { counter } = data;
  if (counter) {
    // a little bit brutal
    document.body.innerHTML = messageFormat(counter);
  }
}

// setup the listener
// waiting in our case from the message using a counter variable
// (see function ` popupOpened ` in backgroung.ts )

const pageListener = (request : any) => {
  modifyPage(request)
  // return a promise as standard listener response
  return Promise.resolve({response: 'ok'});
}

port.onMessage.addListener(pageListener);

// perform cleanup here
port.onDisconnect.addListener(() => {
  port.postMessage({alive: false});
  // remove the listener
  port.onMessage.removeListener(pageListener)
  //
});