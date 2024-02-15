function rotate_and_2dim(points, θs) {
  function centralize(p) {
    return p.map((v, i) => v - CENTER[i]);
  }
  function decentralize(p) {
    return p.map((v, i) => v + CENTER[i]);
  }
  function mulMatrix(matrix, vector) {
    const result = [];
    for (let i = 0; i < matrix.length; i++) {
      let sum = 0;
      for (let j = 0; j < vector.length; j++) {
        sum += matrix[i][j] * vector[j];
      }
      result.push(sum);
    }
    return result;
  }

  /*
    pointsを各軸方向にθsだけ回転させ、2次元座標に変換する
    θs：度数法
  */
  const [x, y, z] = centralize(points);

  let θ = [0, 0, 0];
  θs.forEach((_, i) => {
    θ[i] = _ * (Math.PI / 180);
  });

  const rotateX = [
    [1, 0, 0],
    [0, Math.cos(θ[0]), -Math.sin(θ[0])],
    [0, Math.sin(θ[0]), Math.cos(θ[0])]
  ];

  const rotateY = [
    [Math.cos(θ[1]), 0, Math.sin(θ[1])],
    [0, 1, 0],
    [-Math.sin(θ[1]), 0, Math.cos(θ[1])]
  ];

  const rotateZ = [
    [Math.cos(θ[2]), -Math.sin(θ[2]), 0],
    [Math.sin(θ[2]), Math.cos(θ[2]), 0],
    [0, 0, 1]
  ];

  const rotatedX = mulMatrix(rotateX, [x, y, z]);
  const rotatedXY = mulMatrix(rotateY, rotatedX);
  const rotatedXYZ = mulMatrix(rotateZ, rotatedXY);
  const rotated = decentralize(rotatedXYZ);

  let p = [0, 0];
  AXES.forEach((axis, i) => {
    axis.forEach((v, k) => {
      p[k] += v * rotated[i];
    });
  });

  return p;
}