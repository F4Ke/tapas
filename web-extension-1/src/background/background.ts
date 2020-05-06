import { Itab } from '../interfaces/tab'

let tabs:Itab[] = new Array<Itab>();

const setupBackground = async () => {
  console.log('setup background');
};

const findOrInitializeTab = (tab: Itab) : Itab  => {
  const tabId = tab.id as number; // because the ID can be undefined

  // find or insert the tab into our existing array
  let fTab = tabs.find(t => t.id === tabId);
  if (fTab) {
    return fTab;
  } else {
    tab.totalOpened = 0;
    // tab.port = browser.tabs.connect(
    //   tabId,
    //   { name: "content_script/lifecycle" }
    // );
    tabs.push(tab);
  }
  return tab;
}

const onError = (error: any) => {
  console.error(error);
}

const sendMessage = (tabId: number, msg: any, callback: any) => {
  // send the message to the tab
  // with the counrter inside
  browser.tabs.sendMessage(
     tabId,
     msg
   ).then(response => {
     callback();
   }).catch(onError);
}

const popupOpenedMsg = (tab: Itab) => {
  tab.totalOpened += 1;
  // now send the message
  sendMessage(tab.id as number, {counter: tab.totalOpened}, () => {
    // console.log("Update complete");
  })
}

// const popupOpenedPort = (tab: Itab) => {
//   tab.totalOpened += 1;
//   // now send the message
//   tab.port.postMessage({counter: tab.totalOpened});
// }

const tabInit = (tabId: number) => {
  // fetch the tab
  // to be sure of it's existence even if we have the ID
   browser.tabs.get(tabId).then(tab => {
    // tab exist
    // we send the popupOpenedMEssage to the content
    const currentTab = findOrInitializeTab(tab as Itab);
    popupOpenedMsg(currentTab);
    // popupOpenedPort(currentTab);
  })
}

browser.runtime.onInstalled.addListener(setupBackground);

browser.runtime.onMessage.addListener((data, s) => {
  const { tabId } = data;
  if (tabId) {
    // tabID is present -> It's means we have our information
    tabInit(tabId);
  }
  return Promise.resolve({response: 'ok'});
});
