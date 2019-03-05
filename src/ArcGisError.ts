export interface IArcGisError {
    code: number;
    message: string;
}

export interface IArcGisErrorResponse {
    error: IArcGisError;
}

export default class ArcGisError extends Error implements IArcGisError {
    code: number;
    /**
     *
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