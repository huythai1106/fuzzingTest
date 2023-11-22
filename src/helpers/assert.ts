export const isNumber = (input: string) => {
    if (['', '[]', null].includes(input)) return [false, input]
    return !isNaN(Number(input)) ? [true, Number(input)] : [false, input]
}

export const isUUID = (input: string) => {
    const is_uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input)
    return [is_uuid, input]
}

export const isDate = (input: string) => {
    // return moment(input, ['DD/mm/YYYY', 'mm/DD/YYYY', 'YYYY/mm/DD', 'YYYY/DD/mm']).isValid()
    return [false, input]
}

export const isJsonObject = (input: string)=> {
    try {
        const j = JSON.parse(input)
        return [true, j]
    } catch (error) {
        return [false, input]
    }
}

export const isBoolean = (input: string) => {
    const boolMaps: { [key: string]: boolean } = {
        'true': true,
        'false': false
    }
    const is_boolean = Object.keys(boolMaps).includes(input.toLowerCase())
    return is_boolean ? [true, boolMaps[input.toLowerCase()]] : [false, input]
}

export const isFile = (input: string) => {
    return [false, input]
}