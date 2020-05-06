(() => {

  // fetch the current and active tab
  // from which the popup as called

  browser.tabs.query({ active:true, currentWindow:true }).then(function(tabs) {
      if (tabs[0] !== undefined) {
        const tabId = tabs[0].id as number;
        browser.runtime.sendMessage({ active : true, tabId: tabs[0].id });
      }
  });

})();