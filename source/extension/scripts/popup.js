angular
  .module('GoodTaberApp', ['ui.sortable'])
  .controller('TabListCtrl', TabListCtrl)
  .factory('TabsService', TabsService);

TabListCtrl.$inject = ['$scope', 'TabsService'];
function TabListCtrl($scope, TabsService) {
  console.log(TabsService);

  $scope.tabs = [];
  $scope.query = "";

  function getTabs(query) {
    TabsService.getTabs(query).then(function(tabs) {
      console.log(tabs);
      $scope.$apply($scope.tabs = tabs);
    });
  }

  function getTabsByTime() {
    TabsService.getTabsByTime().then(function(tabs) {
      $scope.$apply($scope.tabs = tabs);
    });
  }

  function getTabsByName() {
    TabsService.getTabsByName().then(function(tabs) {
      $scope.$apply($scope.tabs = tabs);
    });
  }

  getTabs();

  $scope.$on('updateTabs', function() {
    getTabs();
  });

  $scope.sortTabOptions = {
    stop: function(e, ui) {
      TabsService.reorder($scope.tabs);
    }
  };

  $scope.close = function(tab) {
    TabsService.close(tab);
    console.log($scope.tabs.length);
  };

  $scope.active = function(tab) {
    TabsService.active(tab);
  };

  $scope.filter = function() {
    getTabs($scope.query);
  };

  $scope.tabTimeApiUsable = TabsService.recentTimeApiEnabled();
  $scope.filterByTime = function() {
    getTabsByTime();
  };

  $scope.filterByName = function() {
    getTabsByName();
  };

};

TabsService.$inject = ['$rootScope'];
function TabsService($rootScope) {
  var Tabs = function() {
    chrome.runtime.onMessage.addListener(function() {
      $rootScope.$broadcast('updateTabs');
    });

    this.background = chrome.extension.getBackgroundPage();
    this.getTabs = function(query) {
      var self = this;
      var deferred = $.Deferred();
      chrome.windows.getCurrent({ populate: false, }, function(window) {
        var tabs = self.background.queryTab(window.id, { contains: query });
        deferred.resolve(tabs);
      });
      return deferred.promise();
    };

    this.getTabsByTime = function() {
      var self = this;
      var tabsPromise = this.getTabs();
      var recentTabsDeferred = $.Deferred();
      chrome.widget.getRecentTabs({id: 0}, function(tabIds) {
        recentTabsDeferred.resolve(tabIds);
      });
      var recentTabsPromise = recentTabsDeferred.promise();
      return $.when(tabsPromise, recentTabsPromise)
        .then(function(tabs, tabIds) {
          var result = [];
          for (var i = 0; i < tabIds.length; ++i) {
            for (var j = 0; j < tabs.length; ++j) {
              if (tabs[j].id === tabIds[i].id) {
                result.push(tabs[j]);
                break;
              }
            }
          }
          return result;
        });
    };
    this.getTabsByName = function() {
      var self = this;
      var tabsPromise = this.getTabs();
      return tabsPromise.then(function(tabs) {
        return tabs.sort(function(a, b) {
          return a.title > b.title;
        });
      });
    };
    this.close = function(tab) {
      this.background.removeTab(tab.id);
    };
    this.active = function(tab) {
      this.background.activeTab(tab.id);
    };
    this.reorder = function(tabs) {
      for (var i = 0; i < tabs.length; ++i) {
        tabs[i].newIndex = i;
      }
      this.background.reorderTab(tabs);
    };
    this.recentTimeApiEnabled = function() {
      return !!chrome.widget && !!chrome.widget.getRecentTabs;
    };

  };
  return new Tabs();
}
