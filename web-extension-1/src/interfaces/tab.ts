// TAB interface

// inherit from the native browser.tabs.Tab
// in order to keep it's informations (like ID etc.)
// totalOpened : number of popup opening
// port : port of the tab
interface Itab extends browser.tabs.Tab {
  totalOpened: number,
  port: browser.runtime.Port,
}

const currentTabPromise = () : Promise<any> => {
  return browser.tabs.query({ active:true, currentWindow:true });
}

export { Itab, currentTabPromise };
