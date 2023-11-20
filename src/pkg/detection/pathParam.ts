import { removeEmpty } from "../../helpers/utils";
import HTTPRequest from "../../httpMessage/HTTPRequest";

interface Url {
    value: string,
    tokens: string[]
    potentialParams: number[]
}

export default function detectPathParam(requests: HTTPRequest[]) {
    const normalize_urls = normalizeUrls(requests)
    pathSegmentIdentifications(normalize_urls)
}

// algorithm 1 trong bài báo nhé
function normalizeUrls(requests: HTTPRequest[]) {
    let results: Url[][] = []
    const G = new Map<number, Url[]>
    for (const request of requests) {
        const tokens = request.getStartLine().url.pathname.split("/").filter(removeEmpty).map((item, index) => {
            return `${index}|${item}`
        })

        const length = tokens.length
        const normalizedUrl = {
            value: request.getStartLine().url.pathname,
            tokens: tokens,
        } as Url
        if (!G.has(length)) {
            G.set(length, [normalizedUrl])
        } else {
            G.get(length)!.push(normalizedUrl)
        }
    }

    // analyze each group independently
    for (const [_, groupUrls] of G) {
        const occurrence = new Map<string, number>()

        for (const url of groupUrls) {
            const tokens = url.tokens
            for (const token of tokens) {
                occurrence.set(token, occurrence.has(token) ? occurrence.get(token)! + 1 : 1)
            }
        }

        for (const url of groupUrls) {
            url.tokens.sort((a, b) => {
                return occurrence.get(b)! - occurrence.get(a)!
            })
        }

        results.push(groupUrls)
    }

    return results
}

// algorithm 2 trong bài báo nhé
function pathSegmentIdentifications(normalize_urls: Url[][]) {
    for (const group of normalize_urls) {
        const L = group.length
        const l: string[] = []
        const c: number[] = []
        const c_m = new Map<string, number>()
        for (let n = L - 1; n >= 1; n--) {
            const tokens = group[n].tokens
            tokens.forEach(t => {
                if (c_m.has(t)) {
                    c_m.set(t, c_m.get(t)! + 1)
                    c[c.length - 1]++
                } else {
                    l.push(t)
                    c_m.set(t, 1)
                    c.push(1)
                }
            })
            
        }

        let thres = Number.MAX_SAFE_INTEGER
        
        // sort l and c together
        const sorted_list: {
            token: string,
            occ: number,
            index: number,
        }[] = []
        l.forEach((item, index) => {
            sorted_list.push({
                token: item,
                occ: c[index],
                index: index
            })
        })
        
        sorted_list.sort((a, b) => {
            return a.occ - b.occ
        })

        let points: number[][] = []
        sorted_list.forEach(item => {
            points.push([item.index, item.occ])
        })

        /*
            Bước v) trong algorithm 2
            Hiện tại đã có points là 1 mảng các điểm (index(li), ci) như trong bài báo.
            cái thuật toán Ramer-Douglas-Peucker, e mới tìm thấy thư viện này thôi mà thấy cứ sai sai.
            có thể e chưa biết dùng cái lib này.
            Mọi ng có thời gian thì code lại cái thuật toán này nhé, tìm lib khác cũng ok 
        */
        points.push(points[0]) // cái này library bắt điểm đầu với điểm cuối phải giống nhau. Lý do tại sao thì e chịu.
        let simplifiedPoints: Position[][] = []
        if (points.length > 4) {
            const simplified = douglasPeucker([points])
            simplifiedPoints = simplified.geometry.coordinates
        }

        console.log('simplifiedPoints',simplifiedPoints);


        const E = Math.PI / 3
        for (let i = 0; i < simplifiedPoints.length - 1; i++) {
            // if(getAngle())
            const point1 = simplifiedPoints[i]
            const point2 = simplifiedPoints[i + 1]
            console.log(point1)
            console.log(point2)
        }
    }
}

// algorithm 3 trong bài báo nhé
// cái algorithm 3 em đọc qua thì dễ thôi, Trong 3 cái thì quan trọng nhất vẫn là cái algorithm 2
function urlPatternConstruction() {

}

// douglas-peucker
import { polygon, simplify, Position} from '@turf/turf'

function douglasPeucker(points: number[][][]) {
    const positions: Position[][] = points
    const geoJson = polygon(positions)
    const options = {
        tolerance: 0.01, // càng nhỏ càng giữ lại nhiều điểm trên trục
    }
    const simplified = simplify(geoJson, options)
    return simplified
}

function getAngle(point1: [number, number], point2: [number, number], force360 = true) {
    const fromX = point1[0]
    const fromY = point1[1]
    const toX = point2[0]
    const toY = point2[1]
    let deltaX = fromX-toX; 
    let deltaY = fromY-toY; // reverse
    let radians = Math.atan2(deltaY, deltaX)
    let degrees = (radians * 180) / Math.PI - 90; // rotate
    if (force360) {
       while (degrees >= 360) degrees -= 360;
       while (degrees < 0) degrees += 360;
    }
    return degrees * Math.PI / 180;
  }