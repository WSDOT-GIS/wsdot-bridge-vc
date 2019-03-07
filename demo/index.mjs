// import functions
import { createControl, fetchCrossingInfo } from "../dist/esm/index.mjs";
// Get crossing location ID URL search parameter.
const urlSearchParams = new URLSearchParams(location.search);
const idString = urlSearchParams.get("id");
const crossingId = parseInt(idString, 10);
// Write error message if ID is invalid.
if (isNaN(crossingId)) {
  const p = document.createElement("p");
  p.textContent = `invalid crossing id: ${idString}`;
  document.body.appendChild(p);
} else {
  // Query SOE for crossing location info,
  // then create control displaying that info.
  const mapServiceUrl =
    "https://localhost:6443/arcgis/rest/services/Bridge/BridgeVerticalClearance/MapServer";
  fetchCrossingInfo(crossingId, mapServiceUrl).then(
    result => {
      const control = createControl(result);
      document.body.appendChild(control);
    },
    error => {
      const p = document.createElement("p");
      p.textContent = error.message;
      document.body.appendChild(p);
    }
  );
}
