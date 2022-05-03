import { getFeature, queryRelated, getService } from '@esri/arcgis-rest-feature-service';
import { defaultMapServiceUrl } from "..";
import { ICrossing } from "../interfaces";

export function getBridgeVCServiceInfo(mapServiceUrl = defaultMapServiceUrl) {
    return getService({
        url: mapServiceUrl
    })
}

export interface ILayerIds {
    crossings: number;
    bridges: number;
    lanes: number;
    documents: number;
    advisories: number;
    attachmentInfos: number;
}

export interface IRelationshipIds {
    crossingsToLanes: number;
    crossingsToDocuments: number;
    crossingsToAdvisories: number;
    crossingsToAttachmentInfos: number;
    bridgesToLanes: number;
    bridgesToDocuments: number;
    bridgesToAdvisories: number;
    bridgesToAttachmentInfos: number;
}

/*
Crossings (0)
VerticalClearance."WSDOT\ARCGISSOC".%MapLanes (0) -- Related To: Lanes (2)
VerticalClearance."WSDOT\ARCGISSOC".%Documents (1) -- Related To: Documents (3)
VerticalClearance."WSDOT\ARCGISSOC".%MapAdvisoryNote (2) -- Related To: Advisories (4)
VerticalClearance."WSDOT\ARCGISSOC".%AttachmentInfos (3) -- Related To: AttachmentInfos (5)

Bridges (1)
VerticalClearance."WSDOT\ARCGISSOC".%MapLanes (4) -- Related To: Lanes (2)
VerticalClearance."WSDOT\ARCGISSOC".%Documents (5) -- Related To: Documents (3)
VerticalClearance."WSDOT\ARCGISSOC".%MapAdvisoryNote (6) -- Related To: Advisories (4)
VerticalClearance."WSDOT\ARCGISSOC".%AttachmentInfos (7) -- Related To: AttachmentInfos (5)

*/

/**
 * The default layer IDs were valid at the time
 * this code was written.
 */
export const defaultLayerIds: ILayerIds = {
    crossings: 0,
    bridges: 1,
    lanes: 2,
    documents: 3,
    advisories: 4,
    attachmentInfos: 5
}

/**
 * The default relationship IDs that were valid at 
 * the time this code was written.
 */
export const defaultRelationshipIds: IRelationshipIds = {
    crossingsToLanes: 0,
    crossingsToDocuments: 1,
    crossingsToAdvisories: 2,
    crossingsToAttachmentInfos: 3,
    bridgesToLanes: 4,
    bridgesToDocuments: 5,
    bridgesToAdvisories: 6,
    bridgesToAttachmentInfos: 7,
}

/**
 * Uses fetch API go retrieve info about a crossing location
 * using relationship queries.
 * @param crossingLocationId Unique identifying integer of a crossing location.
 * @param mapServerUrl URL of the map service that will be queried.
 */
export async function fetchCrossingInfoForLayer(
    crossingLocationId: number,
    mapServerUrl: string,
    featureLayerId: number,
    relationshipIds: number[]) {
    const url = new URL(`${featureLayerId}`, mapServerUrl);
    const featureResponse = await getFeature({
        id: crossingLocationId,
        url: url.toString()
    });

    const relationshipPromises = relationshipIds.map((id) => {
        return queryRelated({
            url: url.toString(),
            relationshipId: id,
            // TODO: outFields: []
        });
    });

    // queryRelated({
    //     url: url,
    //     relationshipId
    // })
}

/**
 * Uses fetch API go retrieve info about a crossing location
 * using relationship queries.
 * @param crossingLocationId Unique identifying integer of a crossing location.
 * @param mapServerUrl URL of the map service that will be queried.
 */
export async function fetchCrossingInfo(
    crossingLocationId: number,
    mapServerUrl: string = defaultMapServiceUrl,
    layerIds: ILayerIds = defaultLayerIds,
    relationshipIds: IRelationshipIds = defaultRelationshipIds
): Promise<ICrossing> {
    const { crossings, bridges } = layerIds

}