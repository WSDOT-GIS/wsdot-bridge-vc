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