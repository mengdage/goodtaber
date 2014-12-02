angular
  .module('GoodTaberApp', ['ui.sortable'])
  .controller('TabListCtrl', ['$scope', 'tabs', function($scope, tabs) {

    function getTabs(query) {
      tabs.getTabs(query).then(function(tabs) {
        $scope.$apply($scope.tabs = tabs);
      });
    }
    function getTabsByTime() {
      tabs.getTabsByTime().then(function(tabs) {
        $scope.$apply($scope.tabs = tabs);
      });
    }

    getTabs();

    $scope.$on('updateTabs', function() {
      getTabs();
    });

    $scope.sortTabOptions = {
      stop: function(e, ui) {
        tabs.reorder($scope.tabs);
      }
    };

    $scope.close = function(tab) {
      tabs.close(tab);
    };

    $scope.active = function(tab) {
      tabs.active(tab);
    };

    $scope.filter = function() {
      getTabs($scope.query);
    };

    $scope.tabTimeApiUsable = tabs.recentTimeApiEnabled();
    $scope.filterByTime = function() {
      getTabsByTime();
    };

  }])
  .factory('tabs', ['$rootScope', function($rootScope) {
    var Tabs = function() {
      this.background = chrome.extension.getBackgroundPage();
      chrome.runtime.onMessage.addListener(function() {
        $rootScope.$broadcast('updateTabs');
      });
    };
    Tabs.prototype.getTabs = function(query) {
      var self = this;
      var deferred = $.Deferred();
      chrome.windows.getCurrent({
        populate: false,
      }, function(window) {
        var tabs = self.background.queryTab(window.id, {
          contains: query
        });
        deferred.resolve(tabs);
      });
      return deferred.promise();
    };
    Tabs.prototype.getTabsByTime = function() {
      var self = this;
      var tabsPromise = this.getTabs();
      var recentTabsDeferred = $.Deferred();
      chrome.widget.getRecentTabs({id: 0}, function(tabIds) {
        recentTabsDeferred.resolve(tabIds);
      });
      var recentTabsPromise = recentTabsDeferred.promise();
      // tabsPromise.then(function(tabs) {
      //   recentTabsPromise.then(function(tabIds) {
      //     for (var i = 0; i < tabIds.length; ++i) {
      //       var tabId = tabIds[i];
      //       if (tabs[tabId]) {
      //         tabs[tabId].newIndex = i;
      //       }
      //     }
      //     self.background.reorderTab(tabs);
      //   });
      // });
      $.when(tabsPromise, recentTabsPromise)
        .then(function(tabs, tabIds) {
          for (var i = 0; i < tabIds.length; ++i) {
            var tabId = tabIds[i];
            if (tabs[tabId]) {
              tabs[tabId].newIndex = i;
            }
          }
          self.background.reorderTab(tabs);
          return self.getTabs();
        });
    };
    Tabs.prototype.close = function(tab) {
      this.background.removeTab(tab.id);
    };
    Tabs.prototype.active = function(tab) {
      this.background.activeTab(tab.id);
    };
    Tabs.prototype.reorder = function(tabs) {
      for (var i = 0; i < tabs.length; ++i) {
        tabs[i].newIndex = i;
      }
      this.background.reorderTab(tabs);
    };
    Tabs.prototype.recentTimeApiEnabled = function() {
      return !!chrome.widget && !!chrome.widget.getRecentTabs;
    };
    return new Tabs();
  }]);