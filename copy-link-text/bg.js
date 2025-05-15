"use strict";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "run",
    type: "normal",
    contexts: ["link"],
    title: "Copy link te&xt",
    documentUrlPatterns: ["*://*/*", "file://*/*"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  copyLinkText(info, tab);
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "copy-link-text") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const tab = tabs[0];
      const info = {
        frameId: null,
        linkUrl: null
      };
      copyLinkText(info, tab);
    });
  }
});

function copyLinkText(info, tab) {
  console.log("Context menu clicked", { info, tab });

  chrome.scripting
    .executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
      // injectImmediately: true, // TODO: Chrome 102
    })
    .then(() => {
      const message = { linkUrl: info.linkUrl };
      console.log("Content script executed, sending message:", message);
      chrome.tabs.sendMessage(tab.id, message);
    })
    .catch((error) => {
      console.error("Failed to execute content script", error);
    });
}
