import ArcGisError from "./ArcGisError";

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

export type Direction = "I" | "D" | "B";

export type ABIndicator = "B";

export type OnUnderCode = "ON" | "UNDER";

/**
 * A collection of data related to a crossing location
 * for a specific direction.
 */
export interface IDirectionalRelatedData {
  Direction: Direction;
  /**
   * An array of lane minimum vertical clearance values
   * ordered by lane number.
   */
  Lanes: number[];
  /**
   * URL to a photograph of lane imagery.
   */
  Document: string | null;
  /**
   * Advisory note
   */
  AdvisoryNote: string | null;
}

/**
 * A collection of related data grouped into
 * Increase and Decrease directions
 */
export interface IRelatedData {
  /**
   * Related data for the increasing direction.
   */
  Increase?: IDirectionalRelatedData | null;
  /**
   * Related data for the decreasing direction.
   */
  Decrease?: IDirectionalRelatedData | null;
}

/**
 * Information about a crossing location feature.
 */
export interface ICrossingLocation {
  /**
   * Unique ID integer for the crossing location.
   */
  CrossingLocationId: number;
  /**
   * State Structure ID.
   */
  StateStructureId: string;
  /**
   * Bridge Number
   */
  BridgeNumber: string;
  /**
   * State Route Identifier
   */
  StateRouteIdentifier: string;
  /**
   * State Route Milepost
   */
  SRMP: number;
  /**
   * Ahead / Back indicator for the SRMP. "B" = "back" mileage.
   * Otherwise "ahead" is assumed.
   */
  ABInd: ABIndicator | null;
  /**
   * Direction
   */
  DirectionInd: Direction;
  /**
   * Description of the crossing
   */
  CrossingDesc: string;
  /**
   * "ON" or "UNDER"
   */
  OnUnderCode: OnUnderCode;
  /**
   * Indicates if review has been performed for the increasing direction
   */
  DecreasingDirReviewCmltInd: boolean;
  /**
   * Indicates if review has been performed for the decreasing direction
   */
  IncreasingDirReviewCmltInd: boolean;
  /**
   * Date that the record was created.
   */
  RecordCreateData: Date;
  /**
   * Date that the record was last updated. Will be null if
   * the record has not been updated since creation.
   */
  RecordUpdateDate: Date | null;
}

/**
 * Information about a crossing location feature and data
 * from related tables.
 */
export interface ICrossing {
  /**
   * Crossing location
   */
  CrossingLocation: ICrossingLocation;
  /**
   * Data related to the crossing location.
   */
  RelatedData: IRelatedData;
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
