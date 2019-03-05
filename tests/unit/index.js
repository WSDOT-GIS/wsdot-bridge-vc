const { fetchCrossingInfo } = require("../../dist/index");
require("isomorphic-fetch");

const { describe, it } = intern.getPlugin('interface.bdd');
const { assert } = intern.getPlugin('chai');

describe('bridge-vc', () => {
    it('should work', async () => {
        // TODO: Update test to use production service when available.
        let crossing = await fetchCrossingInfo(5672, "http://localhost:6080/arcgis/rest/services/Bridge/BridgeVerticalClearance/MapServer");
        assert.property(crossing, "CrossingLocation");
        assert.property(crossing, "RelatedData");
        return;
    })
});
