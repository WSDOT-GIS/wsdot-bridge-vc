/**
 * The format of the error property of an
 * ArcGIS Server request error response.
 */
export interface IArcGisError {
  /**
   * The equivalent HTTP status code
   */
  code: number;
  /**
   * A message describing the nature of the error.
   */
  message: string;
}

/**
 * Format of an error returned from ArcGIS Server request
 * when the requested output format is JSON.
 */
export interface IArcGisErrorResponse {
  /**
   * You can test for the presence of this property in a response
   * to determine if an error has occurred.
   */
  error: IArcGisError;
}

/**
 * Represents an error returned from ArcGIS Server REST endpoints.
 */
export default class ArcGisError extends Error implements IArcGisError {
  public code: number;
  /**
   * Creates a new instance of this class.
   * @param response error response from ArcGIS server
   */
  constructor(response: IArcGisErrorResponse) {
    if (response.error && response.error.message) {
      super(response.error.message);
    } else {
      super();
    }
    this.code = response.error.code;
  }
}
