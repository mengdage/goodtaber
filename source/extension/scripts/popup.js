angular
  .module('GoodTaberApp', ['ui.sortable'])
  .controller('TabListCtrl', ['$scope', 'tabs', function($scope, tabs) {
    var NUMBER_TAG_CLASSES = 5;

    $scope.tabs = tabs.getTabs();
    $scope.sortTabOptions = {
      stop: function(e, ui) {
        tabs.reorder();
        console.log(e);
        console.log(ui);
      },
      change: function() {
        var log = $scope.tabs.map(function(i) {
          return i.id;
        }).join(', ');
        console.log(log);
      }
    };

    $scope.active = function(tab) {
      chrome.tabs.update(tab.id, {
        active: true
      });
    };

    $scope.close = function(tab) {
      // chrome.tabs.remove(tab.id, function() {});
      tabs.close(tab);
    };

    $scope.sortByName = function() {
      tabs.sort(function(a, b) {
        return a.title.toLowerCase() > b.title.toLowerCase();
      });
    };

    $scope.filter = function() {
      if ($scope.query) {
        tabs.filter($scope.query);
      } else {
        tabs.clearFilters();
      }
    };

  }])
  .factory('tabs', ['$rootScope', function($rootScope) {
    var Tabs = function() {
      this.tabs = [];
      this.filteredTabs = [];
      this.index = lunr(function() {
        this.field('title');
        this.ref('id');
      });
      this.scanTabs();
    };
    Tabs.prototype.get = function(id) {
      for (var i = 0; i < this.tabs.length; ++i) {
        if (this.tabs[i].id == id)
          return this.tabs[i];
      }
    };
    Tabs.prototype.getTabs = function() {
      return this.filteredTabs;
    };
    Tabs.prototype.scanTabs = function() {
      var self = this;
      chrome.tabs.query({
        windowId: chrome.windows.WINDOW_ID_CURRENT
      }, function(tabs) {
        $rootScope.$apply(
          angular.forEach(tabs, function(tab) {
            var t = {
              id: tab.id,
              title: tab.title,
            };
            self.tabs.push(t);
            self.filteredTabs.push(t);
            self.index.add(t);
          })
        );
      });
    };
    Tabs.prototype.update = function(id, updates) {
      var tab = this.get(id);
      $.extend(tab, updates);
    };
    Tabs.prototype.sort = function(compareFunction) {
      compareFunction = compareFunction || function(a, b) {
        return a.id > b.id;
      };
      this.filteredTabs.sort(compareFunction);
    };
    Tabs.prototype.filter = function(query) {
      var result = this.index.search(query);
      if (result.length !== 0) {
        this.emptyFilteredTabs();
        for (var i = 0; i < result.length; ++i) {
          var tab = this.get(result[i].ref);
          this.pushFilteredTabs(tab);
        }
      }
    };
    Tabs.prototype.emptyFilteredTabs = function() {
      while (this.filteredTabs.length > 0) {
        this.filteredTabs.pop();
      }
    };
    Tabs.prototype.pushFilteredTabs = function(element) {
      this.filteredTabs.push(element);
    };
    Tabs.prototype.clearFilters = function() {
      this.emptyFilteredTabs();
      for (var i = 0; i < this.tabs.length; ++i) {
        this.pushFilteredTabs(this.tabs[i]);
      }
    };
    Tabs.prototype.reorder = function() {
      if (this.tabs.length !== this.filteredTabs.length) {
        throw new Error("Can't reorder now");
      }
      for (var i = 0; i < this.tabs.length; ++i) {
        var tab = this.tabs[i];
        var newIndex = this.filteredTabs.indexOf(tab);
        chrome.tabs.move(tab.id, {
          index: newIndex
        });
      }
      this.tabs = this.filteredTabs.slice();
    };
    Tabs.prototype.close = function(tab) {
      // this.tabs.indexOf(tab)
      this.tabs.pop(this.tabs.indexOf(tab));
      this.filteredTabs.pop(this.filteredTabs.indexOf(tab));
      chrome.tabs.remove(tab.id);
    };
    return new Tabs();
  }]);