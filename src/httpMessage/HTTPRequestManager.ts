import path from "path"
import { readFile, readFolder } from "../helpers/file"
import HTTPRequest from "./HTTPRequest"

export default class HTTPRequestManager {
    private httpRequests: HTTPRequest[]

    public constructor() {
        this.httpRequests = []
    }

    public setRequestsByRawString(rawRequests: string, separation: string) {
        rawRequests.split(separation).forEach(request => {
            request = request.trim()
            if (request) {
                try {
                    this.httpRequests.push(new HTTPRequest(request))
                } catch (error) {
                    console.log(`\x1b[31m[ERROR] \x1b[0m${(error as Error).message}`)
                }
            }
        })
    }

    public setRequestsByFile(filePath: string, separation: string) {
        const requestsString = readFile(filePath)
        this.setRequestsByRawString(requestsString, separation)
    }

    public setRequestsByFolder(folderPath: string, separation: string) {
        const fileNames = readFolder(folderPath)
        for (const file of fileNames) {
            this.setRequestsByFile(path.join(folderPath, file), separation)
        }
    }

    public removeDuplicatedHTTPRequests() {
        const httpMsgMap = new Map()
        for (const httpMessage of this.httpRequests) {
            if (httpMsgMap.has(httpMessage.toString())) {
                continue
            }
            httpMsgMap.set(httpMessage.toString(), httpMessage)
        }

        this.httpRequests = [...httpMsgMap.values()]
    }

    public async autoDetectFuzzLocation() {
        for (const req of this.httpRequests) {
            await req.autoDetectFuzzLocation()
        }
    }

    public view() {
        this.httpRequests.forEach(item => console.log(item.toString()))
    }

    public getHTTPRequests() {
        return [...this.httpRequests]
    }
}
