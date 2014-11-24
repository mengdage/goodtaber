angular
  .module('GoodTaberApp', ['ui.sortable'])
  .controller('TabListCtrl', ['$scope', 'tabs', function($scope, tabs) {
    var NUMBER_TAG_CLASSES = 5;

    $scope.tabs = tabs.getTabs();
    // $scope.tabs = [{
    //   id:1,
    //   title: 'a'
    // }, {
    //   id: 2,
    //   title: 'b'
    // }];
    $scope.sortableOptions = {
      update: function(e, ui) {
        console.log($scope.tabs);
      },
      stop: function(e, ui) {
        console.log($scope.tabs);
      }
    };

    $scope.tagClicked = function(id) {
      tabs.update(id, {
        class: 'tag-2'
      });
    };

    $scope.sortByName = function() {
      tabs.sort(function(a, b) {
        return a.title.toLowerCase() > b.title.toLowerCase();
      });
    };

    $scope.filter = function() {
      tabs.filter($scope.query);
      
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
      chrome.tabs.query({}, function(tabs) {
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
    // Tabs.prototype.extendFilteredTabs = function(array) {
    //   for (var i = 0; i < array.length; ++i) {
    //     this.filteredTabs.push(array[i]);
    //   }
    // };
    return new Tabs();
  }]);