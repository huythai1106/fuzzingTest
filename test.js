function generateURLPatterns(pathList) {
  const patterns = [];
  let index = 0;

  for (const [L, PL] of pathList) {
    for (const seg of PL) {
      let pattern = "";
      for (let i = 0; i < L; i++) {
        pattern += `${i}/`;
      }

      for (const token of seg) {
        const [pos, name] = token.split("|");
        console.log(index + parseInt(pos));
        pattern = pattern.replace(`{${index + parseInt(pos)}}`, name);
      }

      patterns.push(pattern.slice(0, -1));
      index += L;
    }
  }

  return patterns;
}

// Dữ liệu đầu vào
const pathData = [
  [2, [["0|user", "1|profile"], ["0|product"]]],
  [3, [["0|details"]]],
];

// Tạo các mẫu URL từ dữ liệu n-grams
const result = generateURLPatterns(pathData);
console.log(result);
