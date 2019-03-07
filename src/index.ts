import ArcGisError from "./ArcGisError";
import { ICrossing } from "./interfaces";

export * from "./CollapsablePanel";
export * from "./control";
export * from "./conversion";
export * from "./interfaces";
export * from "./LaneVCTable";
export * from "./Tabs";

export { ArcGisError };

const defaultMapServiceUrl =
  "https://data.wsdot.wa.gov/arcgis/rest/services/Bridge/BridgeVerticalClearance/MapServer";

const soePartialUrl = "exts/BridgeVC";

const imageEndpoint = `${soePartialUrl}/image`;
const crossingEndpoint = `${soePartialUrl}/crossing`;

/**
 * Combines the parts of a URL.
 * @param root URL root
 * @param parts parts to add to the root. Omit leading or trailing slashes.
 */
function combineUrlParts(root: string, ...parts: string[]) {
  let tail = parts.join("/");
  tail = tail.replace(/\/{2,}/, "/");
  return root.replace(/\/?$/, `/${tail}`);
}

/**
 * Uses fetch API go retrieve info about a crossing location
 * using the Bridge Vertical Clearance REST SOE.
 * @param crossingLocationId Unique identifying integer of a crossing location.
 * @param mapServerUrl URL of the map service that will be queried.
 */
export async function fetchCrossingInfo(
  crossingLocationId: number,
  mapServerUrl: string = defaultMapServiceUrl
): Promise<ICrossing> {
  const url =
    combineUrlParts(
      mapServerUrl,
      crossingEndpoint,
      crossingLocationId.toString(10)
    ) + "?f=json";
  const response = await fetch(url);
  const responseJsonText = await response.text();

  /**
   * Custom JSON parsing function that handles date conversion and
   * converts document ID to full document URL.
   * @param key - Property name
   * @param value - property value
   */
  function reviver(key: string, value: any) {
    if (/Date$/i.test(key) && typeof value === "string") {
      return new Date(value);
    }
    if (/^document$/.test(key) && typeof value === "number") {
      return combineUrlParts(mapServerUrl, imageEndpoint, value.toString(10));
    }
    return value;
  }

  // Try to parse the response from the REST endpoint.
  let responseObj: any;
  try {
    responseObj = JSON.parse(responseJsonText, reviver);
  } catch (err) {
    // When attempting to parse JSON, a SyntaxError will be thrown
    // if the response isn't actually JSON.
    if (err instanceof SyntaxError) {
      const re = /Unexpected token (\S) in JSON at position (\d+)/gi;
      const match = err.message.match(re);
      if (match) {
        const msg = `Error parsing response from ${url}\n${responseJsonText}`;
        throw new SyntaxError(msg);
      }
    }
    // Rethrow the original error if it is different from expected situations.
    throw err;
  }

  // When an ArcGIS Server request returns an error, it still uses HTTP status
  // code 200 (OK) instead of one of the HTTP status codes that indicates an error.
  // Detect this situation and throw an error if it occurs.
  if (responseObj.hasOwnProperty("error")) {
    throw new ArcGisError(responseObj);
  }

  // Return the parsed JSON response. This object is expected to match the
  // ICrossing interface.
  return responseObj;
}
