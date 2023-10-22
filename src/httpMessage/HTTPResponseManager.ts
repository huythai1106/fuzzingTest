import HTTPResponse from "./HTTPResponse";

export default class HTTPResponseManager {
    private httpResponses: HTTPResponse[]

    public constructor() {
        this.httpResponses = []
    }

    public getHTTPResponses() {
        return [...this.httpResponses]
    }
}
