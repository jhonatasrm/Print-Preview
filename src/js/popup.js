// Access the background page
browser.runtime.getBackgroundPage().then(function(backgroundPage) {

    // Helper function to get the active tab
    function getActiveTab() {
        return browser.tabs.query({ active: true, currentWindow: true });
    }

    // Print Preview button action
    document.getElementById('print-preview-btn').addEventListener('click', () => {
        backgroundPage.startPrintPreview();  // Call the print preview function from background.js
    });

    // Remove Element button action
    document.getElementById('remove-element-btn').addEventListener('click', () => {
        getActiveTab().then(tabs => {
            backgroundPage.startRemoveElementMode(tabs[0]);  // Call the remove element function from background.js
        });
    });

    // Undo Remove Element button action
    document.getElementById('undo-remove-btn').addEventListener('click', () => {
        getActiveTab().then(tabs => {
            backgroundPage.undoRemoveElement(tabs[0]);  // Call the undo remove element function from background.js
        });
    });

}).catch(function(error) {
    console.error('Error accessing background page: ', error);
});

document.addEventListener("DOMContentLoaded", function () {
    const errorMessageElement = document.getElementById('error-message');

    // Function to show an error message for 1 second
    function showError(message) {
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = 'block';

        // Hide the error message after 1 second
        setTimeout(() => {
            errorMessageElement.style.display = 'none';
        }, 1000); // 1000 milliseconds = 1 second
    }

    // Function to clear the error message
    function clearError() {
        errorMessageElement.textContent = '';
        errorMessageElement.style.display = 'none';
    }

    // Function to handle permissions error
    function handlePermissionError() {
        showError('Permission error: Missing host permission for this tab.');
    }

    // Handle the "Remove Element" action
    document.getElementById('remove-element-btn').addEventListener('click', () => {
        clearError(); // Clear any previous error messages

        browser.tabs.executeScript({
            code: `
                // Simulate element removal action
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

                        // Remove the element
                        element.remove();

                        // Restore the default cursor and remove click listeners
                        document.body.style.cursor = 'default';
                        document.removeEventListener('click', clickHandler);
                        document.removeEventListener('mouseover', highlightElement);
                    }

                    document.addEventListener('click', clickHandler);
                    document.addEventListener('mouseover', highlightElement);
                })();
            `  // Script that tries to remove an element
        }).then(() => {
        }).catch((error) => {
            if (browser.runtime.lastError && browser.runtime.lastError.message.includes("Missing host permission")) {
                handlePermissionError();
            } else if (browser.runtime.lastError) {
                showError(browser.runtime.lastError.message);
            } else {
                showError('Missing host permission for the tab.');
            }
        });
    });

    // Handle the "Undo Remove Element" action
    document.getElementById('undo-remove-btn').addEventListener('click', () => {
        clearError();

        browser.tabs.executeScript({
            code: `
                // Simulate undo element removal action
                (function() {
                    if (window.removedElement && window.originalParent) {
                        window.originalParent.insertBefore(window.removedElement, window.originalSibling);
                        window.removedElement = null;
                        window.originalParent = null;
                        window.originalSibling = null;
                    } else {
                        console.log('No element to restore');
                    }
                })();
            `  // Script that tries to undo the removal
        }).then(() => {
        }).catch((error) => {
            if (browser.runtime.lastError && browser.runtime.lastError.message.includes("Missing host permission")) {
                handlePermissionError();
            } else if (browser.runtime.lastError) {
                showError(browser.runtime.lastError.message);
            } else {
                showError('Missing host permission for the tab.');
            }
        });
    });

    // Handle the "Print Preview" action
    document.getElementById('print-preview-btn').addEventListener('click', () => {
        clearError();

        // Print Preview action with permission check
        browser.tabs.executeScript({
            code: 'window.print();'  // Just prints the page
        }).catch((error) => {
            if (browser.runtime.lastError && browser.runtime.lastError.message.includes("Missing host permission")) {
                handlePermissionError();
            } else if (browser.runtime.lastError) {
                showError(browser.runtime.lastError.message);
            } else {
                showError('Missing host permission for the tab.');
            }
        });
    });
});