# Query Client for WSDOT Bridge Vertical Clearance ArcGIS Map Service

Not ready for production. Work-in-progress. Instructions may not yet be functional.

## Install

```
npm install @wsdot/bridge-vc
```

## Use

This sample demonstrates using this code via [JavaScript Modules]. You can also use [Webpack] (or a similar tool) to bundle your code and the imported modules together [to be compatible with more browsers][JavaScript Modules].

`index.mjs`

This is the code for the demo page's [JavaScript Module][JavaScript Modules].

```javascript
// import functions
import { createControl, fetchCrossingInfo } from "./node_modules/@wsdot/bridge-vc/dist/esm/index.mjs";
// Get crossing location ID URL search parameter.
const urlSearchParams = new URLSearchParams(location.search);
const idString = urlSearchParams.get("id");
const crossingId = parseInt(idString);
// Write error message if ID is invalid.
if (isNaN(crossingId)) {
  const p = document.createElement("p");
  p.textContent = `invalid crossing id: ${idString}`;
  document.body.appendChild(p);
} else {
  // Query SOE for crossing location info,
  // then create control displaying that info.
  const mapServiceUrl =
    "https://www.example.com/arcgis/rest/services/Bridge/BridgeVerticalClearance/MapServer";
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
```

If using webpack and / or TypeScript, the import statement would be slightly different. Only the package name is used, instead of the path to the packages main module script file.

```javascript
import { createControl, fetchCrossingInfo } from "@wsdot/bridge-vc";
```

`index.html`

This is the index page that references the JavaScript Module defined above.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Demo</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="./node_modules/@wsdot/bridge-vc/verticalclearance.css" />
    <link
      href="https://fonts.googleapis.com/css?family=Lato|Overpass"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="index.css" />
  </head>
  <body>
    <script type="module" src="index.mjs"></script>
  </body>
</html>
```
[JavaScript Modules]:https://caniuse.com/#search=JavaScript%20Modules
[Webpack]:https://webpack.js.org/