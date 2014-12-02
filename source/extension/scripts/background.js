function updataBadgeText(a){
  chrome.browserAction.setBadgeText({text: ""+a});
}
function reportNumTabs() {
  chrome.windows.getAll({populate:!0}, function(a) {
    var b = 0;
    a.forEach(function(a) {
      a.tabs&&(b+=a.tabs.length)
    }
    );
    updataBadgeText(b);
  });
}
reportNumTabs();
chrome.tabs.onCreated.addListener(function (a) {
  reportNumTabs();
});
chrome.tabs.onRemoved.addListener(function (a) {
  reportNumTabs();
});
// chrome.commands.onCommand.addListener(function(command) {
//  alert('command: ' + command);
// });



var Tabs = function() {};
Tabs.init = function() {
  return this.scanTabs();
};
Tabs.scanTabs = function() {
  // console.log('scanTabs');
  this.tabs = {};
  var self = this;
  var deferred = $.Deferred();
  chrome.tabs.query({}, function(tabs) {
    deferred.resolve(tabs);
  });
  deferred.then(function(tabs) {
    tabs.forEach(function(tab) {
      self.updateTab(tab);
    });

    return $.when('ok');
  });
  return deferred.promise();
};
Tabs.getTabWindow = function(windowId) {
  if (!this.tabs[windowId]) {
    this.tabs[windowId] = {};
  }
  return this.tabs[windowId];
};
Tabs.updateTab = function(tab) {
  var tabWindow = this.getTabWindow(tab.windowId);
  tabWindow[tab.id] = {
    id: tab.id,
    title: tab.title,
    originalTab: tab,
  };
};
Tabs.getTabsForWindow = function(windowId) {
  // console.log(windowId);
  // console.log(this.tabs);
  return this.tabs[windowId] || {};
};
Tabs.removeTab = function(windowId, tabId) {
  var tabWindow = this.getTabWindow(windowId);
  delete tabWindow[tabId];
};
Tabs.init();

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  // console.log('onUpdated handler');
  Tabs.updateTab(tab);
  notifyUpdate();
});
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  Tabs.removeTab(removeInfo.windowId, tabId);
  notifyUpdate();
});

function notifyUpdate() {
  chrome.runtime.sendMessage({
    method: 'updateTabs'
  });
}
function queryTab(windowId, queryOptions) {
  queryOptions = $.extend({}, queryOptions);
  var tabs = Tabs.getTabsForWindow(windowId);
  var result = [];
  for (var key in tabs) {
    if (tabs.hasOwnProperty(key)) {
      var tab = tabs[key];
      if (queryOptions.contains) {
        if (tab.title.indexOf(queryOptions.contains) > -1) {
          result.push(tab);
        }
      } else {
        result.push(tab);
      }
    }
  }
  result.sort(function(a, b) {
    return a.originalTab.index - b.originalTab.index;
  });
  return result;
}
function removeTab(tabId) {
  chrome.tabs.remove(tabId);
}
function activeTab(tabId) {
  chrome.tabs.update(tabId, {
    active: true,
  });
}
function reorderTab(tabs) {
  tabs = tabs.slice();
  tabs.sort(function(a, b) {
    return a.newIndex - b.newIndex;
  });
  for (var i = 0; i < tabs.length; ++i) {
    chrome.tabs.move(tabs[i].id, {
      index: i,
    });
  }
}

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
	chrome.widget.getRecentTabs({id:(-1*tabId)}, function(rtabs){});
});
chrome.tabs.onActiveChanged.addListener(function (tabId, selectInfo) {
	chrome.widget.getRecentTabs({id:tabId}, function(rtabs){});
	alert(tabId);
	//chrome.widget.record(tabId);
});
