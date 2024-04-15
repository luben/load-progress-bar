function saveOptions(e) {
  e.preventDefault();
  browser.storage.local.set({
    "color": document.querySelector("#color").value,
    "width": document.querySelector("#width").value,
    "isRainbow": document.querySelector("#isRainbow").checked,
    "rainbow_size": document.querySelector("#rainbow_size").value,
    "opacity": document.querySelector("#opacity").value,
    "place": document.querySelector("#place").value,
    "smooth": document.querySelector("#smooth").value
  });
}

function restoreOptions() {

  function updateSettings(result) {
    document.querySelector("#color").value = result.color;
    document.querySelector("#width").value = result.width;
    document.querySelector("#isRainbow").checked = result.isRainbow,
    document.querySelector("#rainbow_size").value = result.rainbow_size,
    document.querySelector("#opacity").value = result.opacity;
    document.querySelector("#place").value = result.place;
    document.querySelector("#smooth").value = result.smooth;
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  browser.storage.local.get({
      color: "#FF0000",
      isRainbow: true,
      rainbow_size: 3,
      width: "2",
      opacity: "0.75",
      place: "top",
      smooth: "no"
  }).then(updateSettings, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
document.querySelectorAll("select").forEach((i) => i.addEventListener("change", saveOptions));
document.querySelectorAll("input").forEach((i) => i.addEventListener("change", saveOptions));
