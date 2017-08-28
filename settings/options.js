function saveOptions(e) {
  e.preventDefault();
  browser.storage.local.set({
    "color": document.querySelector("#color").value,
    "width": document.querySelector("#width").value
  });
}

function restoreOptions() {

  function setColorChoice(result) {
    document.querySelector("#color").value = result.color || "#FF0000";
  }

  function setWidthChoice(result) {
    document.querySelector("#width").value = result.width || "1";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getColor = browser.storage.local.get("color").then(setColorChoice, onError);
  var getWidth = browser.storage.local.get("width").then(setWidthChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
