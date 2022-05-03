import { defaultMapServiceUrl } from ".";
import { ICrossing } from "./interfaces";

/**
 * Uses fetch API go retrieve info about a crossing location
 * using relationship queries.
 * @param crossingLocationId Unique identifying integer of a crossing location.
 * @param mapServerUrl URL of the map service that will be queried.
 */
 export async function fetchCrossingInfo(
    crossingLocationId: number,
    mapServerUrl: string = defaultMapServiceUrl
  ): Promise<ICrossing> {
      throw new Error("This function has not yet been implemented.");
  }