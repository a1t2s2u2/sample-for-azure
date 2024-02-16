const canvasContainer = document.querySelector("#canvas-container");
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

canvas.width = 2000; canvas.height = canvas.width * (canvas.clientHeight / canvas.clientWidth);

const LIMIT = 2;
const SHAPE = [10, 10, 10];
const CENTER = SHAPE.map(s => s/2);
const SCALE = [canvas.width/SHAPE[0], canvas.height/SHAPE[1]];
const AXES = [[0.8, 0], [0, 0.8], [0.2, 0.2]];

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

class NeuralNet {
  constructor(θs=null) {
    this.neurons = {};
    if(θs) {
      this.θs = θs;
    } else {
      this.θs = [0, 0, 0];
    }

    // generate neurons
    for(let id=0;id<10**3;++id) {
      /*
        value      float
        connection {key: weight}
        position   [float...]
      */
      this.neurons[String(id)] = {
        "v": 0,
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
          if(random() < 1 - d / LIMIT) {
            this.neurons[key1]["c"][key2] = random();
          }
        }
      }
    }
  }
  loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 回転の追加
    this.θs.forEach((θ, i) =>{
      if(θ >= 360) {
        this.θs[i] = θ % 360;
      } else {
        this.θs[i] += 2;
      }
    });
    // ニューロンの描画
    for(let key1 in this.neurons) {
      const neuron = this.neurons[key1];
      const p = rotate_and_2dim(neuron["p"], this.θs);
      for(let key2 in neuron["c"]) {
        const target = this.neurons[key2];
        const q = rotate_and_2dim(target["p"], this.θs);
        const w = neuron["c"][key2];
        const c = neuron["p"].map((v, i) => Math.round((120 + 240 * v / SHAPE[i]) % 255));
        ctx.strokeStyle = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
        ctx.lineWidth = 0.5 + w/2;
        ctx.beginPath();
        ctx.moveTo(p[0]*SCALE[0], p[1]*SCALE[1]);
        ctx.lineTo(q[0]*SCALE[0], q[1]*SCALE[1]);
        ctx.stroke();
      }
    }

    // 軸の描画
    ctx.lineWidth = 5;
    axes_for_plot.forEach(plot => {
      let p = rotate_and_2dim(plot[0], this.θs);
      let q = rotate_and_2dim(plot[1], this.θs);
      ctx.strokeStyle = plot[2];
      ctx.beginPath();
      ctx.moveTo(p[0]*SCALE[0], p[1]*SCALE[1]);
      ctx.lineTo(q[0]*SCALE[0], q[1]*SCALE[1]);
      ctx.stroke();
    });
  }
}

let neuralNet = new NeuralNet();

function animate() {
  neuralNet.loop();
  // requestAnimationFrame(animate);
}

// animate();
setInterval(animate, 75);

let mouseDown = false;
let prevX, prevY;

canvas.addEventListener('mousedown', e => {
  mouseDown = true;
  prevX = e.offsetX; 
  prevY = e.offsetY;
});

canvas.addEventListener('mouseup', () => {
  mouseDown = false;
});

canvas.addEventListener('mousemove', e => {
  if(!mouseDown) return;
  
  const deltaX = e.offsetX - prevX;
  const deltaY = e.offsetY - prevY;
  
  prevX = e.offsetX;
  prevY = e.offsetY;
  
  [deltaX, deltaY].forEach((d, k) => {
    AXES.forEach((axis, i) => {
      neuralNet.θs[i] += axis[k] * d;
    });
  });
});


canvas.addEventListener('touchstart', e => {
  mouseDown = true;
  prevX = e.touches[0].clientX - e.touches[0].target.offsetLeft;
  prevY = e.touches[0].clientY - e.touches[0].target.offsetTop;
});

canvas.addEventListener('touchend', () => {
  mouseDown = false;
});

canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  if (!mouseDown) return;
  
  const currentX = e.touches[0].clientX - e.touches[0].target.offsetLeft;
  const currentY = e.touches[0].clientY - e.touches[0].target.offsetTop;
  
  const deltaX = currentX - prevX;
  const deltaY = currentY - prevY;
  
  prevX = currentX;
  prevY = currentY;
  
  [deltaX, deltaY].forEach((d, k) => {
    AXES.forEach((axis, i) => {
      neuralNet.θs[i] += axis[k] * d;
    });
  });
});
