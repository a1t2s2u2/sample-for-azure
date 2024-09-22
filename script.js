const canvasContainer = document.querySelector("#canvas-container");
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

canvas.width = 2000; canvas.height = canvas.width * (canvas.clientHeight / canvas.clientWidth);

const SHAPE = [10, 10, 10];
const CENTER = SHAPE.map(s => s/2);
const AXES = [[0.8, 0], [0, 0.8], [0.2, 0.2]];
const SCALE = [canvas.width/SHAPE[0], canvas.height/SHAPE[1]];

// 描画用の軸情報
let axes_for_plot = [];
SHAPE.forEach((s, i) => {
  let p = CENTER.map((c, k) => {
    if(i==k) {return s} else {return c};
  });
  let q = Array.from(p);
  q[i] = 0;
  axes_for_plot.push(
    [p, q, ["white", "violet", "aqua"][i]]
  );
});

// 便利関数
function round(v, digit=2) {
  const a = 10**digit;
  return Math.round(v * a) / a;
}
function random(m=1.0) {
  return round(Math.random() * m);
}
function distance(p, q) {
  let d = 0;
  p.map((v, i) => d += (v - q[i])**2);
  return Math.sqrt(d);
}

// 接続関数
function connect(d) {
  //  const LIMIT = 2;
  const LIMIT = 0.9;
  return random() < 1 - d / LIMIT;
}

class NeuralNet {
  constructor() {
    this.neurons = {};
    this.θs = [0, 0, 0];

    // generate neurons
    for(let id=0;id<15**3;++id) {
      this.neurons[String(id)] = {
        "v": random(),
        "c": {},
        "p": SHAPE.map(s => s*0.1 + random(s*0.8)),
      };
    }

    // connect neurons
    for(let key1 in this.neurons) {
      const p = this.neurons[key1]["p"];
      for(let key2 in this.neurons) {
        if(key1 != key2) {
          const q = this.neurons[key2]["p"];
          const d = distance(p, q);
          if(connect(d)) this.neurons[key1]["c"][key2] = random();
        }
      }
    }
  }
  update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 接続・ニューロンの描画
    for(let key1 in this.neurons) {
      const neuron = this.neurons[key1];
      const p = rotate_and_2dim(neuron["p"], this.θs);
      const c = neuron["p"].map((v, i) => Math.round((120 + 240 * v / SHAPE[i]) % 255));
      ctx.strokeStyle = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
      ctx.lineWidth = 1.0;
      // connection
      for(let key2 in neuron["c"]) {
        const target = this.neurons[key2];
        const q = rotate_and_2dim(target["p"], this.θs);
        this.neurons[key2]["v"] = (target["v"] + neuron["v"]*neuron["c"][key2]) % 1;
        ctx.beginPath();
        ctx.moveTo(p[0], p[1]);
        ctx.lineTo(q[0], q[1]);
        ctx.stroke();
      }
      // neuron
      ctx.fillStyle = `rgba(255, 255, 255, ${neuron["v"]})`;
      ctx.fillRect(p[0]-3, p[1]-3, 6, 6);
    }
    
    // 軸の描画
    ctx.lineWidth = 4;
    axes_for_plot.forEach(plot => {
      let p = rotate_and_2dim(plot[0], this.θs);
      let q = rotate_and_2dim(plot[1], this.θs);
      ctx.strokeStyle = plot[2];
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]);
      ctx.lineTo(q[0], q[1]);
      ctx.stroke();
    });
  }
}

let mouseDown = false;
let prevX, prevY;
let neuralNet = new NeuralNet();

function animate() {
  if(!mouseDown) { // 回転させる
    neuralNet.θs = neuralNet.θs.map(θ => (θ + 0.1) % 360);
  }

  neuralNet.update();
  requestAnimationFrame(animate);
}
animate();


// マウスとタッチの両方で座標を取得する関数
function getPosition(e) {
  let clientX, clientY;

  if (e instanceof MouseEvent) {
      clientX = e.offsetX;
      clientY = e.offsetY;
  } else if (e instanceof TouchEvent) {
      clientX = e.touches[0].clientX - e.touches[0].target.offsetLeft;
      clientY = e.touches[0].clientY - e.touches[0].target.offsetTop;
  }

  return [clientX, clientY];
}

// マウスイベントとタッチイベントの両方に対する共通の処理
function handleInput(e) {
  if (!mouseDown) return;

  const [currentX, currentY] = getPosition(e);
  const deltaX = currentX - prevX;
  const deltaY = currentY - prevY;

  prevX = currentX;
  prevY = currentY;

  [deltaX, deltaY].forEach((d, k) => {
    AXES.forEach((axis, i) => {
      neuralNet.θs[i] += axis[k] * d;
    });
  });
}

// マウスイベントのハンドラー
canvas.addEventListener('mousedown', e => {
  mouseDown = true;
  [prevX, prevY] = getPosition(e);
});

canvas.addEventListener('mouseup', () => {
  mouseDown = false;
});

canvas.addEventListener('mousemove', handleInput);

// タッチイベントのハンドラー
canvas.addEventListener('touchstart', e => {
  mouseDown = true;
  [prevX, prevY] = getPosition(e);
});

canvas.addEventListener('touchend', () => {
  mouseDown = false;
});

canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  handleInput(e);
});