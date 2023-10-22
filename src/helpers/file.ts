import fs from 'fs'

export const readFolder = (path: string): string[] => {
    return fs.readdirSync(path, { encoding: 'utf8' })
}

export const readFile = (path: string): string => {
    return fs.readFileSync(path, { encoding: 'utf8' })
}

export const exportFile = (path: string, data: any) => {
    fs.writeFileSync(path, data, { flag: 'w' })
}
