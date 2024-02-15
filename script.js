const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

canvas.width = 3000; canvas.height = canvas.width * (canvas.clientHeight / canvas.clientWidth);

const LIMIT = 2.2;
const SHAPE = [10, 10, 10];
const CENTER = SHAPE.map(s => s/2);
const SCALE = [canvas.width/SHAPE[0], canvas.height/SHAPE[1]];
const AXES = [[0.8, 0], [0, 0.8], [0.2, 0.2]];


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
  constructor() {
    this.neurons = {};
    this.θs = [0, 0, 0];

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
        "p": SHAPE.map(s => random(s)),
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
      if(θ > 360) {
        this.θs[i] = 0;
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
        ctx.strokeStyle = `rgb(255, 255, ${round(w*255, 0)})`;
        ctx.lineWidth = (1+w) ** 2;
        ctx.beginPath();
        ctx.moveTo(p[0]*SCALE[0], p[1]*SCALE[1]);
        ctx.lineTo(q[0]*SCALE[0], q[1]*SCALE[1]);
        ctx.stroke();
      }
    }

    let axes = [];
    SHAPE.forEach((s, i) => {
      let p = CENTER.map((c, k) => {
        if(i==k) {return s} else {return c};
      });
      let q = Array.from(p);
      q[i] = 0;
      axes.push([p, q]);
    });

    ctx.lineWidth = 12;
    ctx.strokeStyle = "black";
    axes.forEach(points => {
      let p = rotate_and_2dim(points[0], this.θs);
      let q = rotate_and_2dim(points[1], this.θs);
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
setInterval(animate, 50);