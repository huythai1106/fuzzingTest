export const isNumber = (input: string):boolean =>  {
    return !isNaN(parseFloat(input))
}

export const isUUID  = (input: string):boolean =>  {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input)
}