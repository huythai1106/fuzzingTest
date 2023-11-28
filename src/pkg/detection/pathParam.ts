import { removeEmpty } from "../../helpers/utils";
import HTTPRequest from "../../httpMessage/HTTPRequest";

interface Url {
  value: string;
  tokens: string[];
}

type Point = [number, number];

export default function detectPathParam(requests: HTTPRequest[]) {
  const normalize_urls = normalizeUrls(requests);

  let a = pathSegmentIdentifications(normalize_urls);

  let b = urlPatternConstruction(a);

  return b;
}

export function detectPotentialPathParamBySendRequest(request: HTTPRequest) {
  const pathParams = request.getStartLine().url.pathname.split("/").filter(removeEmpty);
  const option: { [key: string]: any } = {
    method: request.getStartLine().method,
    headers: request.getHeaders(),
  };
  if (request.hasBody()) {
    option.body = request.getBody();
  }

  let promises: Promise<string>[] = [];
  for (let i = 0; i < pathParams.length; i++) {
    const randomStr = "-_-_-";
    const testUrl = [`${request.getStartLine().url.protocol}/`, request.getStartLine().url.hostname, ...pathParams.slice(0, i), randomStr, ...pathParams.slice(i + 1)].join("/");
    promises.push(
      new Promise((resolve, reject) => {
        fetch(testUrl)
          .then((res) => {
            if (res.status === 200) {
              return resolve(pathParams[i]);
            }
            return resolve("");
          })
          .catch(reject);
      })
    );
  }

  return Promise.all(promises);
}

function normalizeUrls(requests: HTTPRequest[]) {
  let results: Url[][] = [];
  const G = new Map<number, Url[]>();
  for (const request of requests) {
    const tokens = request
      .getStartLine()
      .url.pathname.slice(1)
      .split("/")
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

  for (const group of normalize_urls) {
    const L = group.length;
    const l1 = group[0].tokens.length; // do dai token
    const l: string[] = [];
    const c_m = new Map<string, number>();
    const PL = new Set<any>();
    const PL1: Set<any> = new Set();

    for (let n = L - 1; n >= 0; n--) {
      const tokens = group[n].tokens;

      tokens.forEach((t) => {
        if (c_m.has(t)) {
          c_m.set(t, c_m.get(t)! + 1);
        } else {
          l.push(t);
          c_m.set(t, 1);
        }
      });
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

    sorted_list.forEach((item, index) => {
      points.push([index, item.occ]);
    });

    points = douglasPeucker(points, 0.01);

    let min = 0.1,
      max = Math.PI / 2;

    let E = min;

    for (let i = 0; i < points.length - 1; i++) {
      const angle = getAngle(points[i], points[i + 1]);

      if (angle >= E) {
        E = angle > max ? max : angle;
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
      if (a.length > 0) {
        PL1.add(JSON.stringify([...a]));
      }
    }
    PATH.push([l1, PL1]);
  }

  return PATH;
}

// algorithm 3 trong bài báo nhé
// cái algorithm 3 em đọc qua thì dễ thôi, Trong 3 cái thì quan trọng nhất vẫn là cái algorithm 2
function urlPatternConstruction(pathList: [number, any][]): Record<number, string[]> {
  const patterns: Record<number, string[]> = {};
  let index = 0;

  for (const [L, PL] of pathList) {
    if (L === 1) {
      patterns[L] = ["FUZZING"];
    }
    for (const seg of PL) {
      let seg1 = JSON.parse(seg);
      if ((seg1 as Array<any>).length === 0) {
        continue;
      }

      let pattern = "";
      for (let i = 0; i < L; i++) {
        pattern += `${index + i}/`;
      }

      for (const token of seg1) {
        const [pos, name] = token.split("|");
        let ind = index + parseInt(pos) + "";
        pattern = pattern.replace(ind, token);
      }

      let stringPatten = pattern
        .slice(0, -1)
        .split("/")
        .map((i) => {
          return i.includes("|") ? i.split("|")[1] : "FUZZING";
        })
        .join("/");

      if (patterns[L]) {
        patterns[L].push(stringPatten);
      } else {
        patterns[L] = [stringPatten];
      }
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
  const fromX = point1[0];
  const fromY = point1[1];
  const toX = point2[0];
  const toY = point2[1];
  let deltaX = toX - fromX;
  let deltaY = toY - fromY; // reverse

  let radians = Math.atan2(deltaY, deltaX);

  // let degrees = (radians * 180) / Math.PI - 90; // rotate
  // if (force360) {
  //   while (degrees >= 360) degrees -= 360;
  //   while (degrees < 0) degrees += 360;
  // }
  // return (degrees * Math.PI) / 180;
  return radians;
}

function perpendicularDistance(point: [number, number], lineStart: [number, number], lineEnd: [number, number]): number {
  const [pointX, pointY] = point;
  const [startX, startY] = lineStart;
  const [endX, endY] = lineEnd;

  const numerator = Math.abs((endX - startX) * (startY - pointY) - (startX - pointX) * (endY - startY));
  const denominator = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
  return numerator / denominator;
}

// Thuật toán Douglas-Peucker
function douglasPeucker(points: Array<[number, number]>, epsilon: number): Array<[number, number]> {
  const end = points.length - 1;

  // Đánh dấu các điểm cần giữ lại
  const keepIndices: Set<number> = new Set([0, end]);

  const simplify = (start: number, end: number): void => {
    let maxDistance = 0;
    let farthestIdx = 0;

    for (let i = start + 1; i < end; i++) {
      const distance = perpendicularDistance(points[i], points[start], points[end]);

      if (distance > maxDistance) {
        maxDistance = distance;
        farthestIdx = i;
      }
    }

    if (maxDistance > epsilon) {
      keepIndices.add(farthestIdx);
      simplify(start, farthestIdx);
      simplify(farthestIdx, end);
    }
  };

  simplify(0, end);

  return points.filter((point, idx) => keepIndices.has(idx));
}
