# Introduction #

GoodTaber works as a manager for you numerous chrome tabs. The goal is to make you navigation through tabs easily and efficiently.
![GUI](wiki/images/GoodTaber.png?raw=true "GoodTaber")
# Design #

GoodTaber consists of two components, the foreground popup and the background.

## Popup ##

The popup is responsible for the representation of tabs. When you open the extension by clicking or shortcut, the popup will find all the chrome tabs and present them to you. Then it will do different works according to your instructions, such as searching, sorting, and rearranging.

## Background ##

The background works silently. It monitors your activities in the browser and provide you useful information, such as the number of tabs.

# Integration #

GoodTaber is a browser action extension for Chrome. It has a main icon in the main Google Chrome toolbar, to the right of the address bar. It can be seen and opened anytime when Chrome is running. The installation and uninstallation of GoodTaber is under the Chrome extension management, so it's easy and safe.

# New API #

To record the sequence of tabs being used, we design a new API, chrome.widget.getRecentTabs. The API keeps a sequence of tab id and update the sequence every time a tab is activated or remove. There is a test version of GoddTaber that uses this API and provide a new sorting function. You can download the patch file and the extension in the downloads wiki page.

# Functions #

1. A concise view of all tabs in the way of  text

2. close or open tabs

3. Browser action icon with the number of tabs on it.

4. Rearrange tabs by dragging items in the extension’s  popup.

5. Instant search.

6. Sort tabs by Name, Time.

7. Keyboard shortcut support, like opening popup, opening tabs, scrolling up and down.

8. pin tab

## Function levels ##
Functions are divided into three levels, based on the criterion of importance level. The first two levels must completed before the deadline. The third level is optional according to time left after the first two levels.

**Level I**

1. A concise view of all tabs in the way of  text

2. close or open tabs.

3. Browser action icon with the number of tabs on it.

**Level II**

4. Rearrange tabs by dragging items in the extension’s  popup.

5. Instant search.

6. Sort tabs by Name, Time.

**Level III**

7. Keyboard shortcut support, like opening popup, opening tabs, scrolling up and down.

8. pin tab
