// TAB interface

// inherit from the native browser.tabs.Tab
// in order to keep it's informations (like ID etc.)

interface Itab extends browser.tabs.Tab {
  totalOpened: number,
  port: browser.runtime.Port,
}

export { Itab };
