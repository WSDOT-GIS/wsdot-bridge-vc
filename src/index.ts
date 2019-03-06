import ArcGisError from "./ArcGisError";
import { ICrossing } from "./interfaces";
export * from "./control";

const defaultMapServiceUrl =
  "https://data.wsdot.wa.gov/arcgis/rest/services/Bridge/BridgeVerticalClearance/MapServer";

const soePartialUrl = "exts/BridgeVC";

const imageEndpoint = `${soePartialUrl}/image`;
const crossingEndpoint = `${soePartialUrl}/crossing`;

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
    if (/^Document$/.test(key) && typeof value === "number") {
      return combineUrlParts(mapServerUrl, imageEndpoint, value.toString(10));
    }
    return value;
  }

  let responseObj: any;

  try {
    responseObj = JSON.parse(responseJsonText, reviver);
  } catch (err) {
    if (err instanceof SyntaxError) {
      const re = /Unexpected token (\S) in JSON at position (\d+)/gi;
      const match = err.message.match(re);
      if (match) {
        const msg = `Error parsing response from ${url}\n${responseJsonText}`;
        throw new SyntaxError(msg);
      }
    }
    throw err;
  }

  if (responseObj.hasOwnProperty("error")) {
    throw new ArcGisError(responseObj);
  }

  return responseObj;
}
