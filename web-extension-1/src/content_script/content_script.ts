const port = browser.runtime.connect(browser.runtime.id, { name: 'content_script/lifecycle' });

// perform cleanup here
port.onDisconnect.addListener(() => {
  console.log('cleanup');
});

(() => {
  browser.runtime.sendMessage({
    action: 'open'
  })
});

const messageFormat = (counter: number) => {
  return `Popup opened ${counter} times on this tab`;
}