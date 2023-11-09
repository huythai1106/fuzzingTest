import { removeEmpty } from "../../helpers/utils";
import HTTPRequest from "../../httpMessage/HTTPRequest"
import { TYPE_ALIAS } from "./type";

interface A {
    [key: number]: number[]
}

interface DetectionResult {
    request: HTTPRequest,
    pathIndexes: number[]
}

export default class PathParamDetection {
    private static readonly sensitiveTypes: TYPE_ALIAS[] = [
        TYPE_ALIAS.NUMBER,
        TYPE_ALIAS.BOOLEAN,
        TYPE_ALIAS.UUID,
        TYPE_ALIAS.DATE_TIME
    ]
    private static readonly PERCENT_OF_SIMILARITY = 0.7 // 70%

    public static detect(requests: HTTPRequest[]) {
        if (!requests) return;

        // split requests which have the same length path.
        const requestsByLength = new Map<number, HTTPRequest[]>()
        for (const req of requests) {
            const l = req.getStartLine().url.pathname.split('/').filter(removeEmpty).length
            if (!requestsByLength.has(l)) {
                requestsByLength.set(l, [req])
            } else {
                requestsByLength.get(l)?.push(req)
            }
        }

        // evaluate  the similarities of requests
        const invertedIndexRequests = new Map<string, A>()
        
        for (const [_, r] of requestsByLength) {

            console.log("With-length:", r.length, r.map(i => i.getStartLine().url.href))

            const lengthReqs = r.length
            for (let reqIndex = 0; reqIndex < lengthReqs; reqIndex++) {
                const path = r[reqIndex].getStartLine().url.pathname
                path.split('/').filter(removeEmpty).forEach((item: string, indexItem: number) => {
                    if (!invertedIndexRequests.has(item)) {
                        invertedIndexRequests.set(item, {
                            [indexItem]: [reqIndex]
                        } as A)
                        return
                    }

                    let similarReqIndexes = invertedIndexRequests.get(item)![indexItem]
                    if (!similarReqIndexes) {
                        similarReqIndexes = [reqIndex]
                    } else {
                        similarReqIndexes.push(reqIndex)
                    }
                
                    invertedIndexRequests.get(item)![indexItem] = similarReqIndexes
                })
            }
        
            console.log(invertedIndexRequests)
        }

        // calculate percent of similarities
        const evaluations = new Map<string, number>()
        const __o__  = Object.keys(invertedIndexRequests).map(key => ({
            [key]: [...Object.values(invertedIndexRequests.get(key)!)]
        }
        ))

        for (const key in __o__) {

        }
    }
}

export  function detectPotentialPathParam(request: HTTPRequest) {
    const pathParams = request.getStartLine().url.pathname.split('/').filter(removeEmpty)
        const option: { [key: string]: any } = {
            method: request.getStartLine().method,
            headers: request.getHeaders()
        }
        if (request.hasBody()) {
            option.body = request.getBody()
        }
        
        let promises: Promise<string>[] = [];
        for (let i = 0; i < pathParams.length; i++) {
            const randomStr = '-_-_-'
            const testUrl = [`${request.getStartLine().url.protocol}/`, request.getStartLine().url.hostname, ...pathParams.slice(0, i), randomStr, ...pathParams.slice(i + 1)].join('/');
            promises.push(new Promise((resolve, reject) => {
                fetch(testUrl)
                    .then(res => {
                        if (res.status >= 200 && res.status < 300) {
                            return resolve(pathParams[i])
                        }
                        return resolve('')
                    }).catch(reject)
            }))
        }
        
        return Promise.all(promises)
}


export function detectSingleRequest(request: HTTPRequest) {
}

export function detectBySimilarities(requests: HTTPRequest[]) {

}