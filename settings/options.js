function saveOptions(e) {
  e.preventDefault();
  browser.storage.local.set({
    "color": document.querySelector("#color").value,
    "width": document.querySelector("#width").value,
    "place": document.querySelector("#place").value
  });
}

function restoreOptions() {

  function setColorChoice(result) {
    document.querySelector("#color").value = result.color || "#FF0000";
  }

  function setWidthChoice(result) {
    document.querySelector("#width").value = result.width || "2";
  }

  function setPlaceChoice(result) {
    document.querySelector("#place").value = result.place || "top";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  browser.storage.local.get("color").then(setColorChoice, onError);
  browser.storage.local.get("width").then(setWidthChoice, onError);
  browser.storage.local.get("place").then(setPlaceChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
