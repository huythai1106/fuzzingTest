import { readFile, readFolder } from "src/helpers/file"
import HTTPRequest from "./HTTPRequest"

export default class HTTPRequestManager {
    private httpRequests: HTTPRequest[]

    public constructor(input: string, separation: string) {
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
            this.setRequestsByFile(file, separation)
        }
    }

    public removeDuplicatedHTTPRequests() {
        const httpMsgMap = new Map()
        for (const httpMessage of this.httpRequests) {
            const jsonData = {
                method: httpMessage.getStartLine().method,
                protocol: httpMessage.getStartLine().protocol,
                domain: httpMessage.getStartLine().domain,
                port: httpMessage.getStartLine().port,
                referer: httpMessage.getHeaders()['Referer'],
                contentType: httpMessage.getHeaders()['Content-Type'],
            }
            if (httpMsgMap.has(JSON.stringify(jsonData))) {
                continue
            }
            httpMsgMap.set(JSON.stringify(jsonData), httpMessage)
        }

        this.httpRequests = []
        for (const [_, value] of httpMsgMap) {
            this.httpRequests.push(value)
        }
    }

    public view() {
        this.httpRequests.forEach(item => item.view())
    }

    public getHTTPRequests() {
        return [...this.httpRequests]
    }
}
