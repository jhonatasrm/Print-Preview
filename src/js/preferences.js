const contextMenuId = document.getElementById("contextMenu");
var success = document.getElementById("success");
var savePreferences = document.getElementById("save_preferences");
var promiseContextMenu;
var setSuccess;
var version = document.getElementById("version");
version.textContent = browser.runtime.getManifest().name + " (v"+ browser.runtime.getManifest().version + ")";

var backgroundPage = browser.runtime.getBackgroundPage();

backgroundPage.then(function(bgPage) {
  if (typeof bgPage.startContextMenu === 'function') {
      console.log("startContextMenu found and is a function");

      $(document).ready(function () {
          var contextMenuVal = localStorage.getItem('contextMenu');
          var removeElementsVal = localStorage.getItem('removeElements');

          $('input[name="contextMenu"]').each(function () {
              if ($(this).val() === contextMenuVal) {
                  $(this).prop("checked", true);
              }
          });
          $('input[name="removeElements"]').each(function () {
              if ($(this).val() === removeElementsVal) {
                  $(this).prop("checked", true);
              }
          });

          $('input[name="contextMenu"], input[name="removeElements"]').on('change', function () {
              localStorage.setItem($(this).attr('name'), $(this).val());
              bgPage.startContextMenu();  // Chama a função no background.js
          });
      });

  } else {
      console.error('startContextMenu is not defined in the background page');
  }
}).catch(function(error) {
  console.error('Error accessing background page: ', error);
});


// Display the extension version
var version = document.getElementById("version");
version.textContent = browser.runtime.getManifest().name + " (v" + browser.runtime.getManifest().version + ")";

// Function to save preferences in localStorage
function savePreferencesToLocalStorage() {
    var contextMenuVal = localStorage.getItem('contextMenu');
    var removeElementsVal = localStorage.getItem('removeElements');
    $('input[name="contextMenu"]').each(function () {
        if ($(this).val() === contextMenuVal) {
            $(this).prop("checked", true);
        }
    });

    $('input[name="removeElements"]').each(function () {
        if ($(this).val() === removeElementsVal) {
            $(this).prop("checked", true);
        }
    });
}

// Execute when the document is ready
$(document).ready(function () {
  savePreferencesToLocalStorage();
  $('input[name="contextMenu"], input[name="removeElements"]').on('change', function () {
      var prefName = $(this).attr('name');
      var prefValue = $(this).val();
      localStorage.setItem(prefName, prefValue);

      browser.runtime.getBackgroundPage().then(function(backgroundPage) {
          if (typeof backgroundPage.startContextMenu === 'function') {
              backgroundPage.startContextMenu();
          } else {
              console.error("startContextMenu is not defined in the background page");
          }
      }).catch(function(error) {
          console.error('Error accessing background page: ', error);
      });
  });
});

$(document).ready(function () {
  // Function to enable/disable removeElements
  function toggleRemoveElements(enabled) {
      const removeElementsRadioButtons = $('input[name="removeElements"]');
      if (enabled) {
          removeElementsRadioButtons.prop('disabled', false);
          removeElementsRadioButtons.closest('label').css('opacity', '1'); 
          removeElementsRadioButtons.closest('label').css('cursor', 'pointer'); 
      } else {
          removeElementsRadioButtons.prop('disabled', true); 
          removeElementsRadioButtons.closest('label').css('opacity', '0.5');  
          removeElementsRadioButtons.closest('label').css('cursor', 'not-allowed');

          // Set removeElements radio to 'false' when contextMenu is disabled
          $('input[name="removeElements"][value="false"]').prop('checked', true);
          localStorage.setItem('removeElements', 'false');  // Save as 'false' in localStorage
      }
  }

  // Get the current contextMenu value from localStorage
  var contextMenuVal = localStorage.getItem('contextMenu');
  
  // Check if it's 'true' or 'false' (as strings) and update removeElements accordingly
  if (contextMenuVal === 'true') {
      toggleRemoveElements(true);  
  } else {
      toggleRemoveElements(false); 
  }

  // Listener for changes in the contextMenu radio button
  $('input[name="contextMenu"]').on('change', function () {
      const contextMenuEnabled = $(this).val() === 'true'; 
      localStorage.setItem('contextMenu', contextMenuEnabled.toString());
      toggleRemoveElements(contextMenuEnabled);
  });

  // Listener for changes in the removeElements radio button
  $('input[name="removeElements"]').on('change', function () {
      localStorage.setItem('removeElements', $(this).val());
  });
});