import assert from 'node:assert/strict';

const dateFieldNameRe = /\w+Date$/i;

const defaultMapServiceUrl = new URL("https://data.wsdot.wa.gov/arcgis/rest/services/Bridge/BridgeVerticalClearance/MapServer/");

/** 
 * Normally users will not want to return the results from this field due to its size.
 * Should only ever be queried when getting a single record.
 */
const docContentField = "DocContent";

/**
 * Custom JSON parsing
 * @param {string} key 
 * @param {any} value 
 */
function customJsonParse(key, value) {
  if (dateFieldNameRe.test(key) && typeof value === "number") {
    const date = new Date(value);
    return date;
  }
  return value;
}

/**
 * @typedef Field
 * @property {string} name - "CrossingDesc",
 * @property {string} type - "esriFieldTypeString",
 * @property {string} alias - "Crossing Description",
 * @property {number?} length - 50,
 * @property {string?} domain - null
 */

/**
 * @typedef Relationship
 * @property {number} id - 0,
 * @property {string} name - "VerticalClearance.\"WSDOT\\ARCGISSOC\".%MapLanes",
 * @property {number} relatedTableId - 2,
 * @property {string} role - "esriRelRoleOrigin",
 * @property {string} keyField - "CrossingLocationId",
 * @property {string} cardinality - "esriRelCardinalityOneToMany",
 * @property {boolean} composite - false
 */

/**
 * @typedef Layer
 * @property {number} id
 * @property {string} name
 * @property {"Feature Layer" | "Table"} type
 * @property {Field[]} fields
 * @property {Relationship[]} relationships
 */

/**
 * @typedef AllLayersInfo
 * @property {Layer[]} layers
 * @property {Layer[]} tables
 */

/**
 * @typedef {Record}
 * @property {object} attributes
 */

/**
 * @typedef {Feature(Record)}
 * @property {object} geometry
 */

/**
 * @typedef {FeatureResult}
 * @property {Feature} feature
 */

/**
 * @typedef {RelatedRecordGroup}
 * @property {number} objectId
 * @property {Array} relatedRecords
 */

/**
 * @typedef {RelatedRecordResults}
 * @property {Field[]} fields
 * @property {RelatedRecordGroup[]} relatedRecordGroups
 */

/**
 * Returns an object describing all layers and tables
 * in a map service.
 * @param {URL} mapServiceUrl - Map service URL
 * @returns {Promise<AllLayersInfo>}
 */
async function getLayerInfo(mapServiceUrl = defaultMapServiceUrl) {
  const url = new URL("layers", mapServiceUrl);
  url.searchParams.set("f", "json");
  const response = await fetch(url);
  const layerInfoText = await response.text();
  /** @type {AllLayersInfo} */
  const layerInfo = JSON.parse(layerInfoText, customJsonParse);
  return layerInfo;
}

/**
 * Gets document info for specific document OID.
 * @param {number} layerId layer ID
 * @param {number} documentOid document OID
 * @param {URL} mapServiceUrl map service URL
 * @returns {FeatureResult} document info
 */
async function getDocumentInfo(layerId, documentOid, mapServiceUrl = defaultMapServiceUrl) {
  const url = new URL(`${layerId}/${documentOid}`, mapServiceUrl);
  url.searchParams.append("f", "json");
  console.log(url.href);
  const response = await fetch(url);
  const featureText = await response.text();

  const feature = JSON.parse(featureText, customJsonParse);
  return feature
}


/**
 * @typedef FeatureOids
 * @parameter {string} objectIdFieldName
 * @parameter {number[]} objectIds
 */

/**
 * Get OIDs of a feature.
 * @param {number} layerId layer id
 * @param {string} where Where clause. Use "1=1" to return all features.
 * @param {URL} mapServiceUrl Map service URL
 * @returns {Promise<FeatureOids>}
 */
async function getLayerOids(layerId, where="1=1", mapServiceUrl = defaultMapServiceUrl) {
  const url = new URL(`${layerId}/query`, mapServiceUrl);
  url.searchParams.append("f", "json");
  url.searchParams.append("where", where);
  url.searchParams.append("returnIdsOnly", true);
  const result = await fetch(url);
  const output = await result.json();
  return output;
}

/**
 * Queries a map service layer for related records.
 * @param {int} layerId Layer ID
 * @param {number|number[]} objectIds A single object ID or an array of object IDs. (For bridge VC we'll only ever call a single ID.)
 * @param {number} relationshipId relationship identifier
 * @param {string|string[]} [outFields="*"] List of fields. Use "*" to return all fields.
 * @param {boolean} [returnGeometry] Indicates if geometry should be returned.
 * @param {URL} [mapServiceUrl] Map service URL
 */
async function queryRelatedRecords(layerId, objectIds, relationshipId, outFields="*", returnGeometry, mapServiceUrl = defaultMapServiceUrl) {
  // {{mapService}}/{{layerId}}/queryRelatedRecords?objectIds={{featureOid}}&relationshipId={{relationshipId}}&outFields={{outFields}}&returnGeometry=false&f={{f}}
  const url = new URL(`${layerId}/queryRelatedRecords`, mapServiceUrl)
  // Convert outFields array into a comma-separated string.
  if (Array.isArray(outFields)) {
    outFields = outFields.join(",");
  }
  if (Array.isArray(objectIds)) {
    objectIds = objectIds.map(id => `${id}`).join(",");
  }
  const searchParams = {
    objectIds,
    relationshipId,
    outFields,
    returnGeometry: !!returnGeometry,
    f: "json"
  }
  
  for (const pName in searchParams) {
    url.searchParams.set(pName, searchParams[pName]);
  }

  const result = await fetch(url);
  const resultText = await result.text();
  /** @type {FeatureResult} */
  const relatedRecords = JSON.parse(resultText, customJsonParse);
  return relatedRecords;
}

const layerInfo = await getLayerInfo();

assert.ok(layerInfo);
assert.equal(layerInfo.layers.length, 2, "there should be two layers");
assert.equal(layerInfo.tables.length, 4, "there should be four tables");

// Start layer OIDs queries for each layer.
/** @type {Promise<[number, number[]]>} */
const layerOidsPromises = layerInfo.layers.map((layer) => {
  return getLayerOids(layer.id).then(oids => [layer.id, oids.objectIds]);
});

// Await the results of the OID queries.
/** @type {[number, number[]]} */
const promisesResults = await Promise.all(layerOidsPromises);

/** @type {Map<number, number[]>} */
const layerOidMap = new Map(promisesResults);

/**
 * Enumerates the relationships of a layer and queries the relationships
 * for the first OID of the layer.
 * @param {Layer} layer 
 */
function* enumerateLayerRelations(layer) {
  for (const relationship of layer.relationships) {
    const oids = layerOidMap.get(layer.id);
    const firstOid = oids[0];
    // Get the related table.
    const relatedTable = layerInfo.tables.filter(t => {
      return t.id === relationship.relatedTableId
    })[0];
    // Get the list of fields, excluding the docContentField if present.
    const fields = relatedTable.fields.filter(f => f.name !== docContentField).map(f => f.name);
    // Query the related records. Do not await.
    const relatedRecordPromise = queryRelatedRecords(layer.id, firstOid, relationship.id, fields);
    yield {layer, relationship, relatedRecordPromise};
  }
}

for (const layer of layerInfo.layers) {
  console.group(`Layer ${layer.id}: ${layer.name}`);
  for (const {_, relationship, relatedRecordPromise} of enumerateLayerRelations(layer)) {
    relatedRecordPromise.then(featureResult => {
      console.group(`Related record query completed layer ${layer.name}, ${relationship.name}`);
      assert.ok("relatedRecordGroups" in featureResult && Array.isArray(featureResult.relatedRecordGroups));
      for (const rrGroup of featureResult.relatedRecordGroups) {
        console.group("Record group %d", rrGroup.objectId);
        for (const record of rrGroup.relatedRecords) {
          console.log(record);
        }
        console.groupEnd();
      }
      console.groupEnd();
    })
  }
  console.groupEnd();
}
// const documentInfo = await getDocumentInfo(3, 294);
