import * as constants from './constants'

class StartLine {
    method!: string
    url!: URL
    protocolVersion!: string
}

export default class HTTPRequest {
    private static headerRegex: RegExp = /(?<header_key>[\w-]+)\s*:\s*(?<header_value>.*)/g

    private startLine!: StartLine
    private headers!: { [key: string]: string }
    private body?: any | undefined
    
    public constructor(request: string) {
        const error = this.analyzeHTTPRequest(request.trim())
        if (error != null) throw error
    }

    private analyzeHTTPRequest(request: string): Error | null {
        const requestLines = request.split('\n').map(item => item.trim())

        if (requestLines.length > 0) {
            let error: Error | null;
            
            error = this.analyzeStartLine(requestLines)
            if (error != null) {
                return error
            }
            error = this.analyzeHeaders(requestLines)
            if (error != null) {
                return error
            }
            
            error = this.analyzeBody(requestLines)
            if (error != null) {
                return error
            }
        }
        
        return null
    }

    private analyzeStartLine(requestLines: string[]): Error | null {
        this.startLine = {} as StartLine

        const startLinePortions = requestLines[0].split(' ');
        if (startLinePortions.length !== 3) {
            return new Error(`Invalid start-line ${requestLines[0]}`)
        }

        this.startLine.method = startLinePortions[0]
        if (!constants.PERMITTED_METHODS.includes(this.startLine.method)) {
            return new Error(`Method ${this.startLine.method} is not allowed`)
        }

        try {
            this.startLine.url = new URL(startLinePortions[1])
        } catch (error) {
            return new Error(`Invalid url: ${startLinePortions[1]}`)
        }

        this.startLine.protocolVersion = startLinePortions[2]
        return null
    }

    private analyzeHeaders(requestLines: string[]): Error | null {
        this.headers = {}

        const emptyIndex = requestLines.indexOf('')
        const headers = requestLines.slice(1, emptyIndex !== -1 ? emptyIndex : requestLines.length)
        for (const header of headers) {
            HTTPRequest.headerRegex.lastIndex = 0
            if (!HTTPRequest.headerRegex.test(header)) {
                return new Error(`Invalid header: ${header}`)
            }
            HTTPRequest.headerRegex.lastIndex = 0

            const headerMatcher = [...header.matchAll(HTTPRequest.headerRegex)][0]
            if (headerMatcher?.groups && headerMatcher.groups.header_key.trim()) {
                this.headers[headerMatcher.groups.header_key.trim()] = headerMatcher.groups.header_value.trim()
            }
        }

        return null
    }

    /**Currently always return null */
    private analyzeBody(requestLines: string[]): Error | null {
        const emptyIndex = requestLines.indexOf('')
        if (emptyIndex === -1) {
            return null
        }
        const bodyLines = requestLines.slice(emptyIndex + 1)
        this.body = bodyLines.join('\n').trim()
        return null
    }

    public hasBody(): boolean {
        return !!this.body
    }

    public getStartLine() {
        return { ...this.startLine }
    }

    public getHeaders() {
        return { ...this.headers }
    }

    public getBody() {
        return this.body || null
    }

    public toString() {
        return `${this.startLine.method}.${this.startLine.url.protocol}${this.startLine.url.host}${this.startLine.url.pathname}.${this.headers['Content-Type'] || ""}`
    }
}
