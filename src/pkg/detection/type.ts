import * as assert from '../../helpers/assert'

export enum TYPE_ALIAS {
    NUMBER = 'number',
    UUID = 'uuid',
    JSON = 'json',
    STRING = 'string'
}

export default function detectType(input: string): TYPE_ALIAS {
    if (assert.isNumber(input)) return TYPE_ALIAS.NUMBER
    if (assert.isUUID(input)) return TYPE_ALIAS.UUID
    // if (isDate(input)) return 'date'
    if(assert.isJsonObject(input)) return TYPE_ALIAS.JSON
    return TYPE_ALIAS.STRING
}