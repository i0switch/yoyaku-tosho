# p5.js Algorithmic Art Recipes

よく使うアルゴリズムアートのレシピ集。コピペして即使えるように設計。

---

## シード付き乱数の基本

```javascript
// 再現性のある乱数（同じseedで同じ結果）
let seed = 42;

function seededRandom() {
  seed = (seed * 16807 + 0) % 2147483647;
  return (seed - 1) / 2147483646;
}

// p5.js の randomSeed を使う場合
randomSeed(42);
let x = random(0, width);  // 毎回同じ値
```

---

## フローフィールド（Flow Field）

```javascript
let cols, rows;
let scl = 20;
let zoff = 0;
let particles = [];

function setup() {
  createCanvas(800, 800);
  cols = floor(width / scl);
  rows = floor(height / scl);

  for (let i = 0; i < 500; i++) {
    particles.push(createVector(random(width), random(height)));
  }
  background(0);
}

function draw() {
  stroke(255, 5);
  strokeWeight(1);

  for (let p of particles) {
    let xoff = p.x / (width * 0.5);
    let yoff = p.y / (height * 0.5);
    let angle = noise(xoff, yoff, zoff) * TWO_PI * 2;
    let v = p5.Vector.fromAngle(angle);
    v.setMag(1);
    p.add(v);
    point(p.x, p.y);

    if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
      p.x = random(width);
      p.y = random(height);
    }
  }
  zoff += 0.003;
}
```

---

## パーティクルシステム

```javascript
class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1, 3));
    this.acc = createVector(0, 0);
    this.lifespan = 255;
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.lifespan -= 2;
    this.acc.mult(0);
  }

  show() {
    stroke(255, this.lifespan);
    strokeWeight(2);
    point(this.pos.x, this.pos.y);
  }

  isDead() { return this.lifespan < 0; }
}
```

---

## ジェネレーティブカラーパレット

```javascript
// アナログカラー（色相を少しずつずらす）
function analogousColors(baseHue, count) {
  colorMode(HSB);
  let colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(color((baseHue + i * 30) % 360, 80, 90));
  }
  colorMode(RGB);
  return colors;
}

// 補色（180度対面）
function complementaryColor(h) {
  return (h + 180) % 360;
}
```

---

## インタラクティブパラメータ（スライダー）

```javascript
let speedSlider, sizeSlider;

function setup() {
  createCanvas(800, 800);

  // スライダーUI
  speedSlider = createSlider(0, 10, 3, 0.1);
  speedSlider.position(10, height + 10);

  sizeSlider = createSlider(1, 50, 10);
  sizeSlider.position(10, height + 40);
}

function draw() {
  let speed = speedSlider.value();
  let size = sizeSlider.value();
  // speedとsizeを使って描画
}
```

---

## よくあるアート型

| 型 | 説明 | 主要技術 |
|----|------|---------|
| フローフィールド | 乱数ベクトル場でパーティクルを流す | Perlinノイズ |
| L-システム | 文字列書き換えルールで植物・フラクタル | 再帰 |
| セルオートマトン | ルール適用で複雑パターンを生成 | グリッド |
| モアレパターン | 規則的パターンの重ね合わせ | 三角関数 |
| ボロノイ図 | 最近傍点による領域分割 | 距離計算 |
| スピログラフ | 円の内/外側を転がる軌跡 | 三角関数 |
