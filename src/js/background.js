// Add listener for the extension button
browser.browserAction.onClicked.addListener(() => {
  browser.tabs.printPreview();
});


// Initial setup for contextMenu, if not already defined
if (localStorage.getItem('contextMenu') === 'undefined' || localStorage.getItem('contextMenu') === null) {
  localStorage.setItem('contextMenu', 'false');
}
if (localStorage.getItem('removeElements') === 'undefined' || localStorage.getItem('removeElements') === null) {
  localStorage.setItem('removeElements', 'false');
}

// Variables to store the removed element and its original position
let removedElement = null;
let originalParent = null;
let originalSibling = null;

// Start the context menu
startContextMenu();

// Function to start print preview
function startPrintPreview() {
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    browser.tabs.executeScript(tabs[0].id, { code: 'window.print();' });
  });
}

// Function to activate the element removal mode (waits for user click)
function startRemoveElementMode(tab) {
  const code = `
        (function() {
            document.body.style.cursor = 'crosshair';  // Change cursor to indicate selection mode
            let highlightedElement = null;

            function highlightElement(event) {
                if (highlightedElement) {
                    highlightedElement.style.outline = '';  // Remove previous highlight
                }
                highlightedElement = event.target;
                highlightedElement.style.outline = '2px solid #1ad3c2';  // Highlight the new element
            }

            function clickHandler(event) {
                event.preventDefault();  // Prevent default click actions
                const element = event.target;

                // Save the removed element and its original position
                window.removedElement = element.cloneNode(true);
                window.originalParent = element.parentNode;
                window.originalSibling = element.nextSibling;

                // Remove the highlight and the element
                element.style.outline = '';  // Remove the highlight
                element.remove();

                // Restore the default cursor and remove click listeners
                document.body.style.cursor = 'default';
                document.removeEventListener('click', clickHandler);
                document.removeEventListener('mouseover', highlightElement);
            }

            // Add listener to capture user click
            document.addEventListener('click', clickHandler);
            document.addEventListener('mouseover', highlightElement);  // Highlight element on mouseover
        })();
    `;
  // Execute the removal code in the current tab
  browser.tabs.executeScript(tab.id, { code: code });
}

// Function to undo the removal of the element
function undoRemoveElement(tab) {
  const code = `
      (function() {
          if (window.removedElement && window.originalParent) {
              window.originalParent.insertBefore(window.removedElement, window.originalSibling);
              
              // Remove the highlight (outline) from the restored element
              window.removedElement.style.outline = '';
              
              // Clear the variables
              window.removedElement = null;
              window.originalParent = null;
              window.originalSibling = null;
          } else {
              console.log("No element to restore");
          }
      })();
  `;
  // Execute the restore code in the current tab
  browser.tabs.executeScript(tab.id, { code: code });
}

// Function to set up the context menu
function startContextMenu() {
  browser.menus.removeAll(() => {
    const isContextMenuEnabled = localStorage.getItem('contextMenu') === 'true';
    const isRemoveElementsEnabled = localStorage.getItem('removeElements') === 'true';

    if (isContextMenuEnabled) {
      browser.menus.create({
        id: "print-preview",
        title: "Print Preview",
        contexts: ["all"]
      }, onCreated);

      if (isRemoveElementsEnabled) {
        browser.menus.create({
          id: "remove-element",
          title: browser.i18n.getMessage("remove"),
          contexts: ["all"]
        }, onCreated);

        browser.menus.create({
          id: "undo-remove-element",
          title: browser.i18n.getMessage("unremove"),
          contexts: ["all"]
        }, onCreated);
      }
    }
  });
}

window.startContextMenu = startContextMenu;

function onCreated() {
  if (browser.runtime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`);
  }
}


// Listener for context menu actions
browser.menus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case "print-preview":
      startPreview();
      break;
    case "remove-element":
      startRemoveElementMode(tab);
      break;
    case "undo-remove-element":
      undoRemoveElement(tab);
      break;
  }
});

// Function to start print preview
function startPreview() {
  browser.tabs.printPreview();
}

// Retrieve all commands (shortcuts)
let gettingAllCommands = browser.commands.getAll();

// Listener for commands (shortcuts)
browser.commands.onCommand.addListener((command) => {
  startPreview();
});