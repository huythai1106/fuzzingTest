import * as assert from '../../helpers/assert'

export enum TYPE_ALIAS {
    NUMBER = 'number',
    UUID = 'uuid',
    JSON = 'json',
    STRING = 'string',
    DATE_TIME = 'date-and-time',
    BOOLEAN = 'boolean',
    FILE = 'file',
}

export default function detectType(input: string): TYPE_ALIAS {
    if (assert.isNumber(input)[0]) return TYPE_ALIAS.NUMBER
    if (assert.isUUID(input)[0]) return TYPE_ALIAS.UUID
    if (assert.isDate(input)[0]) return TYPE_ALIAS.DATE_TIME
    if (assert.isJsonObject(input)[0]) return TYPE_ALIAS.JSON
    if (assert.isBoolean(input)[0]) return TYPE_ALIAS.BOOLEAN
    if (assert.isFile(input)[0]) return TYPE_ALIAS.FILE
    return TYPE_ALIAS.STRING
}
