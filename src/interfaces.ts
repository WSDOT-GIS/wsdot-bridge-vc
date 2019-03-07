import { Geometry } from "geojson";

export type Direction = "I" | "D" | "B";

export type ABIndicator = "B";

export type OnUnderCode = "ON" | "UNDER";

/**
 * A collection of data related to a crossing location
 * for a specific direction.
 */
export interface IDirectionalRelatedData {
  direction: Direction;
  /**
   * An array of lane minimum vertical clearance values
   * ordered by lane number.
   */
  lanes: number[];
  /**
   * URL to a photograph of lane imagery.
   */
  document: string | null;
  /**
   * Advisory note
   */
  advisoryNote: string | null;
}

/**
 * A collection of related data grouped into
 * Increase and Decrease directions
 */
export interface IRelatedData {
  /**
   * Related data for the increasing direction.
   */
  increase?: IDirectionalRelatedData | null;
  /**
   * Related data for the decreasing direction.
   */
  decrease?: IDirectionalRelatedData | null;
}

/**
 * Information about a crossing location feature.
 */
export interface ICrossingLocation {
  /**
   * Unique ID integer for the crossing location.
   */
  crossingLocationId: number;
  /**
   * State Structure ID.
   */
  stateStructureId: string;
  /**
   * Bridge Number
   */
  bridgeNumber: string;
  /**
   * State Route Identifier
   */
  stateRouteIdentifier: string;
  /**
   * State Route Milepost
   */
  srmp: number;
  /**
   * Ahead / Back indicator for the SRMP. "B" = "back" mileage.
   * Otherwise "ahead" is assumed.
   */
  abInd: ABIndicator | null;
  /**
   * Direction
   */
  directionInd: Direction;
  /**
   * Description of the crossing
   */
  crossingDesc: string;
  /**
   * "ON" or "UNDER"
   */
  onUnderCode: OnUnderCode;
  /**
   * Indicates if review has been performed for the increasing direction
   */
  decreasingDirReviewCmltInd: boolean;
  /**
   * Indicates if review has been performed for the decreasing direction
   */
  increasingDirReviewCmltInd: boolean;
  /**
   * Date that the record was created.
   */
  recordCreateData: Date;
  /**
   * Date that the record was last updated. Will be null if
   * the record has not been updated since creation.
   */
  recordUpdateDate: Date | null;
  /**
   * GeoJSON Point or Polyline string.
   */
  shape: Geometry;
}

/**
 * Information about a crossing location feature and data
 * from related tables.
 */
export interface ICrossing {
  /**
   * Crossing location
   */
  crossingLocation: ICrossingLocation;
  /**
   * Data related to the crossing location.
   */
  relatedData: IRelatedData;
}
