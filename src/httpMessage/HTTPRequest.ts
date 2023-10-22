class StartLine {
    fullValue!: string
    method!: string
    protocol!: string
    domain!: string
    port?: number | undefined
    path!: string
    queries?: string
    fragment?: string
    protocolVersion!: string
}

export default class HTTPRequest {
    private static startLineRegex: RegExp = /^(?<method>GET|HEAD|POST|PUT|DELETE|OPTIONS|PATCH) (?:(?<protocol>https|http):\/\/(?<domain>(?:[-\d\w]+\.)+[-\d\w]+)(:(?<port>\d+))*)?(?<path>(?:\/[^\#\?\s]*)*)*(?:\?(?<queries>(?:[-\d\w\/_\.]+[-=\d\w\/_\.]*\&?)*))?(?:#(?<fragment>[\w\d-_%~]*))*(?: (?<protocol_version>HTTP\/[\d\.]+))?$/g
    private static headerRegex: RegExp = /(?<header_key>[\w-]+)\s*:\s*(?<header_value>.*)/g
    private static queryRegex: RegExp = /a/g

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
        this.startLine.fullValue = requestLines[0]
        if (!HTTPRequest.startLineRegex.test(this.startLine.fullValue)) {
            return new Error(`Invalid start-line: ${this.startLine.fullValue}`)
        }
        HTTPRequest.startLineRegex.lastIndex = 0

        const matches = [...this.startLine.fullValue.matchAll(HTTPRequest.startLineRegex)]
        const { method, protocol, domain, port, path, queries, fragment, protocol_version }: { [key: string]: string } = matches[0].groups!
        this.startLine = {
            fullValue: this.startLine.fullValue,
            method: method,
            protocol: protocol,
            domain: domain,
            port: Number(port) || undefined,
            path: path,
            queries: queries,
            fragment: fragment,
            protocolVersion: protocol_version,
        }

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

    public IsSame(other: HTTPRequest): boolean {
        if (this.startLine.method !== other.startLine.method) return true
        if (this.startLine.protocol !== other.startLine.protocol) return true
        if (this.startLine.domain !== other.startLine.domain) return true
        if (this.startLine.port !== other.startLine.port) return true
        if (this.headers['Referer'] !== other.headers['Referer']) return true
        if (this.headers['Content-Type'] !== other.headers['Content-Type']) return true
        return false
    }

    public view() {
        console.log(`\n\x1b[34mREQUEST: \x1b[0m${this.startLine.fullValue}`,)
        console.log('\x1b[34mStartLine => \x1b[0m', this.startLine)
        console.log('\x1b[34mHeaders => \x1b[0m', this.headers)
        console.log('\x1b[34mBody => \x1b[0m', this.body)
    }

    public getStartLine() {
        return { ...this.startLine }
    }

    public getHeaders() {
        return { ...this.headers }
    }

    public getBody() {
        if (!this.hasBody()) {
            return null
        }
        return this.body
    }
}
