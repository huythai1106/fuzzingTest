import { removeEmpty } from "../../helpers/utils";
import HTTPRequest from "../../httpMessage/HTTPRequest"

export default function detectPotentialPathParam(request: HTTPRequest){
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
