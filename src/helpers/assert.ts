import moment from 'moment'

export const isNumber = (input: string): boolean => {
    if (['', '[]', null].includes(input)) return false
    return !isNaN(Number(input))
}

export const isUUID = (input: string): boolean => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input)
}

export const isDate = (input: string): boolean => {
    return moment(input, ['DD/mm/YYYY', 'mm/DD/YYYY', 'YYYY/mm/DD', 'YYYY/DD/mm']).isValid()
}

export const isJsonObject = (input: string): boolean => {
    try {
        JSON.parse(input)
        return true
    } catch (error) {
        return false
    }
}

export const isFile = (input: string): boolean => {
    return false
}