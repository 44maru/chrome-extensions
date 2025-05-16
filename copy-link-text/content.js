"use strict";

let lastMousePosition = {x: 0, y: 0};

chrome.runtime.onMessage.addListener((request) => {
  console.log("Link URL:", request.linkUrl);

  try {
    copyLinkText(request.linkUrl);
  } catch (error) {
    console.error("Failed to copy link text:", error);
  }
});

document.addEventListener('mousemove', (event) => {
  lastMousePosition.x = event.clientX;
  lastMousePosition.y = event.clientY;
});

function copyLinkText(linkUrl) {
  console.log("Copying link text");
  let active;
  if (linkUrl) {
    active = findActiveElement();
  } else {
    console.log("linkUrl is null. get link url");
    active = document.elementFromPoint(lastMousePosition.x, lastMousePosition.y);
    linkUrl = active.href;
  }
  console.log("Active element: ", active);
  const link = findLinkElement(active, linkUrl);
  console.log("Link element: ", link);
  const text = link.innerText;
  writeClipboard(text);
}

function findLinkElement(activeElement, linkUrl) {
  if (activeElement.tagName === "A") {
    return activeElement;
  }

  // Happens in Jira, because of their super complex pages :)
  console.warn("Active element is not a link, finding element based on URL:", linkUrl);
  const links = Array.from(document.querySelectorAll("a"));
  const results = links.filter((link) => link.href === linkUrl);

  if (results.length === 0) throw new Error("Link element not found");

  if (results.length > 1) {
    console.warn("Multiple link elements found, returning first:", results);
  }

  if (!results[0]) throw new Error("Link results found, but first element is falsy");

  return results[0];
}

function findActiveElement() {
  let active;
  let root = document;
  const getRoot = chrome.dom?.openOrClosedShadowRoot;

  // Refactored version of the original fork's code... not sure if this is the best way.
  active = root.activeElement;
  while (active) {
    root = active.shadowRoot || (getRoot ? getRoot(active) : active.openOrClosedShadowRoot);
    if (!root) break;

    active = root.activeElement;
  }

  return active;
}

// The original fork had a hacky backup way of copying to the clipboard which was removed.
function writeClipboard(text) {
  console.log("Writing to clipboard: ", text);
  const { clipboard } = navigator;
  if (clipboard) {
    clipboard.writeText(text);
  } else {
    var area = document.createElement('textarea');
    area.style.position = 'absolute';
    area.style.left = '-9999px';
    area.innerText = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    document.body.removeChild(area);
  }

  showCopyNotification(text)
}

function showCopyNotification(text) {
    const notification = document.createElement("div");
    notification.textContent = `Copied: "${text}"`;
    notification.style.position = "fixed";
    notification.style.bottom = "20px";
    notification.style.right = "20px";
    notification.style.padding = "10px 15px";
    notification.style.backgroundColor = "#323232";
    notification.style.color = "#fff";
    notification.style.borderRadius = "5px";
    notification.style.fontSize = "14px";
    notification.style.zIndex = "9999";
    notification.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
    notification.style.opacity = "0";
    notification.style.transition = "opacity 0.3s";

    document.body.appendChild(notification);
    requestAnimationFrame(() => {
        notification.style.opacity = "1";
    });

    setTimeout(() => {
        notification.style.opacity = "0";
        notification.addEventListener("transitionend", () => {
            notification.remove();
        });
    }, 1000);
}

