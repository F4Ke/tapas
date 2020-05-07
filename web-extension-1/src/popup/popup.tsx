// Popup script
import { currentTabPromise } from '../interfaces/tab'

(() => {

  // fetch the current and active tab
  // from which the popup as called

  currentTabPromise().then(function(tabs) {
    console.log(tabs)
    if (tabs[0] !== undefined) {
      const tabId = tabs[0].id as number;
      browser.runtime.sendMessage({ active : true, tabId: tabs[0].id });
    }
  });

})();