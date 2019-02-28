import { request } from "@esri/arcgis-rest-request";

const defaultMapServiceUrl =
  "https://data.wsdot.wa.gov/arcgis/rest/services/Bridge/BridgeVerticalClearance/MapServer";

export type Direction = "I" | "D" | "B";

/**
 * Attributes of a lane record
 */
export interface ILaneInfo {
  LaneNumber: number;
  MilepostDirectionCode: string;
  VerticalClearanceMinimum: number;
}

/**
 * Attributes of an Advisory Note record
 */
export interface IAdvisoryNote {
  DirectionInd: Direction;
  AdvisoryNote: string;
}

/**
 * Attributes of a Document record.
 */
export interface IDocumentInfo {
  BridgeDocumentId: number;
  MilepostDirectionCode: Direction;
}

/**
 * An ArcGIS Feature
 */
export interface IFeature<T> {
  attributes: T;
}

/**
 * The response of a map service layer query request.
 */
export interface IQueryResponse<T> {
  features: IFeature<T>[];
}

/**
 * Queries a map service table for features related to a specific crossing location.
 * @param crossingLocationId
 * @param tableId
 * @param outFields
 * @param mapServiceUrl
 */
export async function getRelatedInfo<T>(
  crossingLocationId: number,
  tableId: number,
  outFields: string[],
  mapServiceUrl: string = defaultMapServiceUrl
) {
  const where = `CrossingLocationId = ${crossingLocationId}`;
  const queryUrl = `${mapServiceUrl.replace(/\/?$/, "")}/${tableId}/query`;
  const queryResponse: IQueryResponse<T> = await request(queryUrl, {
    params: {
      where,
      outFields: outFields.join(",")
    }
  });
  return queryResponse.features.map(f => f.attributes);
}

/**
 * Gets lane info for a specific crossing location.
 * @param crossingLocationId
 * @param mapServiceUrl
 */
export async function getLaneInfo(crossingLocationId: number, mapServiceUrl: string = defaultMapServiceUrl) {
  return await getRelatedInfo<ILaneInfo>(crossingLocationId, 2, [
    "LaneNumber",
    "MilepostDirectionCode",
    "VerticalClearanceMinimum"
  ], mapServiceUrl);
}

/**
 * Gets advisory notes for a specific crossing location.
 * @param crossingLocationId
 * @param mapServiceUrl
 */
export async function getAdvisoryNotes(crossingLocationId: number, mapServiceUrl: string = defaultMapServiceUrl) {
  return await getRelatedInfo<IAdvisoryNote>(crossingLocationId, 4, [
    "DirectionInd",
    "AdvisoryNote"
  ], mapServiceUrl);
}

/**
 * Gets info about documents related to a given crossing location.
 * @param crossingLocationId
 * @param mapServiceUrl
 */
export async function getDocumentInfos(crossingLocationId: number, mapServiceUrl: string = defaultMapServiceUrl) {
  return await getRelatedInfo<IDocumentInfo>(crossingLocationId, 3, [
    "BridgeDocumentId",
    "MilepostDirectionCode"
  ], mapServiceUrl);
}

/**
 * Retrieves lane info, advisory notes, and document info for a crossing location.
 * @param crossingLocationId
 * @param mapServiceUrl
 */
export async function getAllRelatedInfo(crossingLocationId: number, mapServiceUrl: string = defaultMapServiceUrl) {
  const laneInfoTask = getLaneInfo(crossingLocationId, mapServiceUrl);
  const advisoryNotesTask = getAdvisoryNotes(crossingLocationId, mapServiceUrl);
  const documentInfoTask = getDocumentInfos(crossingLocationId, mapServiceUrl);

  return Promise.all([laneInfoTask, advisoryNotesTask, documentInfoTask]);

}