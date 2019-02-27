import { request } from "@esri/arcgis-rest-request";

const defaultMapServiceUrl =
  "https://data.wsdot.wa.gov/arcgis/rest/services/Bridge/BridgeVerticalClearance/MapServer";

export type Direction = "I" | "D" | "B";

export interface ILaneInfo {
  LaneNumber: number;
  MilepostDirectionCode: string;
  VerticalClearanceMinimum: number;
}

export interface IAdvisoryNote {
  DirectionInd: Direction;
  AdvisoryNote: string;
}

export interface IDocumentInfo {
  BridgeDocumentId: number;
  MilepostDirectionCode: Direction;
}

export interface IFeature<T> {
  attributes: T;
}

export interface IQueryResponse<T> {
  features: IFeature<T>[];
}

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

export async function getLaneInfo(crossingLocationId: number) {
  return await getRelatedInfo<ILaneInfo>(crossingLocationId, 2, [
    "LaneNumber",
    "MilepostDirectionCode",
    "VerticalClearanceMinimum"
  ]);
}

export async function getAdvisoryNotes(crossingLocationId: number) {
  return await getRelatedInfo<IAdvisoryNote>(crossingLocationId, 4, [
    "DirectionInd",
    "AdvisoryNote"
  ]);
}

export async function getDocumentInfos(crossingLocationId: number) {
  return await getRelatedInfo<IDocumentInfo>(crossingLocationId, 3, [
    "BridgeDocumentId",
    "MilepostDirectionCode"
  ]);
}

export async function getAllRelatedInfo(crossingLocationId: number) {
  const laneInfoTask = getLaneInfo(crossingLocationId);
  const advisoryNotesTask = getAdvisoryNotes(crossingLocationId);
  const documentInfoTask = getDocumentInfos(crossingLocationId);

  return Promise.all([laneInfoTask, advisoryNotesTask, documentInfoTask]);

}