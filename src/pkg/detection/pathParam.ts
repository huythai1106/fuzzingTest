import { removeEmpty } from "../../helpers/utils";
import HTTPRequest from "../../httpMessage/HTTPRequest";

interface Url {
  value: string;
  tokens: string[];
  potentialParams: number[];
}

type Point = [number, number];

export default function detectPathParam(requests: HTTPRequest[]) {
  const normalize_urls = normalizeUrls(requests);

  let a = pathSegmentIdentifications(normalize_urls);

  let b = urlPatternConstruction(a);
  console.log(b);
}

// algorithm 1 trong bài báo nhé
function normalizeUrls(requests: HTTPRequest[]) {
  let results: Url[][] = [];
  const G = new Map<number, Url[]>();
  for (const request of requests) {
    if (request.getStartLine().url.href.includes("?")) {
      continue;
    }

    const tokens = request
      .getStartLine()
      .url.pathname.split("/")
      .filter(removeEmpty)
      .map((item, index) => {
        return `${index}|${item}`;
      });

    const length = tokens.length;
    const normalizedUrl = {
      value: request.getStartLine().url.pathname,
      tokens: tokens,
    } as Url;
    if (!G.has(length)) {
      G.set(length, [normalizedUrl]);
    } else {
      G.get(length)!.push(normalizedUrl);
    }
  }

  // analyze each group independently
  for (const [_, groupUrls] of G) {
    const occurrence = new Map<string, number>();

    for (const url of groupUrls) {
      const tokens = url.tokens;

      for (const token of tokens) {
        occurrence.set(token, occurrence.has(token) ? occurrence.get(token)! + 1 : 1);
      }
    }

    for (const url of groupUrls) {
      url.tokens.sort((a, b) => {
        return occurrence.get(b)! - occurrence.get(a)!;
      });
    }

    results.push(groupUrls);
  }

  return results;
}

// algorithm 2 trong bài báo nhé
function pathSegmentIdentifications(normalize_urls: Url[][]) {
  let PATH: any[] = [];
  let index = 0;

  for (const group of normalize_urls) {
    const L = group.length;
    const l1 = group[0].tokens.length;
    const l: string[] = [];
    const c_m = new Map<string, number>();
    const PL = new Set<any>();
    const PL1: any[] = [];

    for (let n = L - 1; n >= 1; n--) {
      const tokens = group[n].tokens;

      tokens.forEach((t) => {
        if (c_m.has(t)) {
          c_m.set(t, c_m.get(t)! + 1);
        } else {
          l.push(t);
          c_m.set(t, 1);
        }
      });
      index += 1;
    }

    let thres = Number.MAX_SAFE_INTEGER;

    // sort l and c together
    const sorted_list: {
      token: string;
      occ: number;
      index: number;
    }[] = [];

    l.forEach((item, index) => {
      sorted_list.push({
        token: item,
        occ: c_m.get(item) as number,
        index: parseInt(item.split("|")[0]),
      });
    });

    sorted_list.sort((a, b) => {
      return a.occ - b.occ;
    });

    let points: Point[] = [];
    sorted_list.forEach((item) => {
      points.push([item.index, item.occ]);
    });

    const E = Math.PI / 3;

    for (let i = 0; i < points.length - 1; i++) {
      const angle = getAngle(points[i], points[i + 1]);

      if (angle >= E) {
        thres = points[i + 1][1]; // c[i + 1]
      }
    }

    for (let i = 0; i < sorted_list.length; i++) {
      if (sorted_list[i].occ >= thres) {
        PL.add(sorted_list[i].token);
      }
    }

    for (let i = 0; i < group.length; i++) {
      let a = group[i].tokens.filter((g) => {
        return PL.has(g);
      });

      PL1.push([...a]);
    }

    PATH.push([l1, PL1]);
  }

  return PATH;
}

// algorithm 3 trong bài báo nhé
// cái algorithm 3 em đọc qua thì dễ thôi, Trong 3 cái thì quan trọng nhất vẫn là cái algorithm 2
function urlPatternConstruction(pathList: [number, any][]): Set<string> {
  const patterns: Set<string> = new Set<string>();
  let index = 0;

  for (const [L, PL] of pathList) {
    for (const seg of PL) {
      if ((seg as Array<any>).length === 0) {
        continue;
      }
      let pattern = "";
      for (let i = 0; i < L; i++) {
        pattern += `${index + i}/`;
      }

      for (const token of seg) {
        const [pos, name] = token.split("|");
        let ind = index + parseInt(pos) + "";
        pattern = pattern.replace(ind, token);
      }

      patterns.add(pattern.slice(0, -1));
      index += L;
    }
  }

  return patterns;
}

// douglas-peucker
// import { polygon, simplify, Position } from "@turf/turf";

// function douglasPeucker(points: number[][][]) {
//   const positions: Position[][] = points;
//   const geoJson = polygon(positions);
//   const options = {
//     tolerance: 0.01, // càng nhỏ càng giữ lại nhiều điểm trên trục
//   };
//   const simplified = simplify(geoJson, options);
//   return simplified;
// }

function getAngle(point1: Point, point2: Point, force360 = true) {
  console.log(point1, point2);

  const fromX = point1[0];
  const fromY = point1[1];
  const toX = point2[0];
  const toY = point2[1];
  let deltaX = fromX - toX;
  let deltaY = fromY - toY; // reverse
  let radians = Math.atan2(deltaY, deltaX);
  let degrees = (radians * 180) / Math.PI - 90; // rotate
  if (force360) {
    while (degrees >= 360) degrees -= 360;
    while (degrees < 0) degrees += 360;
  }
  return (degrees * Math.PI) / 180;
}

function simplifyDouglasPeucker(points: Point[], tolerance: number): Point[] {
  if (points.length <= 2) {
    return points; // Trường hợp cơ sở: không có gì để giảm
  }
  function perpendicularDistance(point: number[], lineStart: number[], lineEnd: number[]): number {
    const [startX, startY] = lineStart;
    const [endX, endY] = lineEnd;
    const [x, y] = point;

    const numerator = Math.abs((endY - startY) * x - (endX - startX) * y + endX * startY - endY * startX);
    const denominator = Math.sqrt(Math.pow(endY - startY, 2) + Math.pow(endX - startX, 2));
    return numerator / denominator;
  }

  function simplify(startIndex: number, endIndex: number): Point[] {
    let maxDistance = 0;
    let farthestIndex = 0;

    for (let i = startIndex + 1; i < endIndex; i++) {
      const distance = perpendicularDistance(points[i], points[startIndex], points[endIndex]);

      if (distance > maxDistance) {
        maxDistance = distance;
        farthestIndex = i;
      }
    }

    if (maxDistance > tolerance) {
      const left = simplify(startIndex, farthestIndex);
      const right = simplify(farthestIndex, endIndex);
      return [...left, points[farthestIndex], ...right];
    } else {
      return [points[startIndex], points[endIndex]];
    }
  }

  return simplify(0, points.length - 1);
}
