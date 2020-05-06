interface Itab extends browser.tabs.Tab {
  totalOpened: number;
}

let tabs:Itab[] = new Array<Itab>();

const setupBackground = async () => {
  console.log('setup background');
};

const findOrAddTab = (tab: Itab) : Itab  => {
  let fTab = tabs.find(t => t.id === tab.id);
  if (fTab) {
    return fTab;
  } else {
    tab.totalOpened = 0;
    tabs.push(tab);
  }
  return tab;
}

const popupOpened = (data: any) => {
  // tied to the active Tab
  browser.tabs.query({active:true,currentWindow:true}).then(function(tabs){
      // 'tabs' will be an array with only one element: an Object describing the active tab
      // in the current window.
      var currentTab = findOrAddTab(tabs[0] as Itab);
      currentTab.totalOpened += 1;
  });
}

browser.runtime.onInstalled.addListener(setupBackground);
browser.runtime.onMessage.addListener(popupOpened)


// browser.notifications.create({
//   "type": "basic",
//   "title": "hello",
//   "message":"Opened"
// });

