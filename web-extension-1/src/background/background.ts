import { Itab, currentTabPromise, IPopupEvent, IPortDisconnected } from '../interfaces/tab'

let tabs:Itab[] = new Array<Itab>();

// set the port OR reset the port when we refresh the page
const resetPort = (tab: Itab, port: browser.runtime.Port) : Itab => {
  tab.port = port;
  return tab;
}

const findOrInitializeTab = (tab: Itab, port: browser.runtime.Port) : Itab  => {
  const tabId = tab.id as number; // because the ID can be undefined

  // find or insert the tab into our existing array
  const fTab = tabs.find(t => t.id === tabId);
  if (fTab) {
    return resetPort(fTab, port);
  } else {
    tab.totalOpened = 0;
    tabs.push(resetPort(tab, port));
  }
  return tab;
}

const onError = (error: any) => {
  console.error(error);
}

const popupOpenedPort = (tadId : number) => {
  // retrieve the port
  const tab = tabs.find(t => t.id === tadId) as Itab;
  if (tab?.port === null) {
    return ;
  }
  tab.totalOpened += 1;
  // now send the message via the port
  tab.port.postMessage({counter: tab.totalOpened});
}

// Custom tab object init
const tabInit = (tabId: number, port: browser.runtime.Port) => {
  // fetch the tab
  // to be sure of it's existence even if we have the ID
   browser.tabs.get(tabId).then(tab => {
    // tab exist for sure
    // we send the popupOpenedMEssage to the content
    const currentTab = findOrInitializeTab(tab as Itab, port);
  })
}

// port connected
// init our tab data and listen to it's deconnection
const connected = (port : browser.runtime.Port) => {
  // we get the tab ID
  const currentTabId = port?.sender?.tab?.id as number;
  // we can now init - or fetch - our custom tab
  tabInit(currentTabId, port);
  port.onMessage.addListener( ({ alive } : IPortDisconnected) => {
    // cleaning the tabs object is alive == false
    if (!alive) {
      tabs = tabs.filter(tab => tab.id !== currentTabId)
    }

  });
}

const popupHasOpen = ({ active, tabId } : IPopupEvent) => {
  if (tabId && active) {
    // tabID is present -> It's means we have our information
    popupOpenedPort(tabId);
  }
  // return a promise as standard listener response
  return Promise.resolve({response: 'ok'});
}

// Listeners

// receive the message from the popup
browser.runtime.onMessage.addListener(popupHasOpen);

// Port connection listen
browser.runtime.onConnect.addListener(connected);

