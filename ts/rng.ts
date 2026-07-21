class RC4 {
  s: number[];
  i: number;
  j: number;

  constructor(seed: string) {
    this.s = Array.from({ length: 256 }, (_, i) => i);
    this.i = 0;
    this.j = 0;
    if (seed) {
      this.mix(seed);
    }
  }

  static getStringBytes(string: string): number[] {
    const output: number[] = [];

    for (let i = 0; i < string.length; ++i) {
      let code = string.charCodeAt(i);
      const bytes: number[] = [];

      do {
        bytes.push(code & 0xff);
        code >>= 8;
      } while (code > 0);

      output.push(...bytes.reverse());
    }

    return output;
  }

  _swap(i: number, j: number): void {
    const tmp = this.s[i];
    this.s[i] = this.s[j];
    this.s[j] = tmp;
  }

  mix(seed: string): void {
    const input = RC4.getStringBytes(seed);
    let j = 0;

    for (let i = 0; i < this.s.length; ++i) {
      j = (j + this.s[i] + input[i % input.length]) % 256;
      this._swap(i, j);
    }
  }

  next(): number {
    this.i = (this.i + 1) % 256;
    this.j = (this.j + this.s[this.i]) % 256;
    this._swap(this.i, this.j);
    return this.s[(this.s[this.i] + this.s[this.j]) % 256];
  }
}

export class RNG {
  static $: RNG;
  _normal: number | null;
  _state: RC4 | null;

  constructor(seed?: string | object | null) {
    this._normal = null;

    if (seed == null) {
      seed = `${Math.random()}${Date.now()}`;
    } else if (Object.prototype.toString.call(seed) !== "[object String]") {
      seed = JSON.stringify(seed);
    }

    this._state = seed ? new RC4(seed as string) : null;
  }

  uniform(): number {
    const BYTES = 7;
    let output = 0;

    for (let i = 0; i < BYTES; ++i) {
      output *= 256;
      output += this._state!.next();
    }

    return output / (2 ** (BYTES * 8) - 1);
  }

  random(n: number | null | undefined, m?: number): number {
    if (n == null) {
      return this.uniform();
    }

    if (m == null) {
      m = n;
      n = 0;
    }

    return n + Math.floor(this.uniform() * (m - n));
  }

  normal(): number {
    if (this._normal !== null) {
      const n = this._normal;
      this._normal = null;
      return n;
    }

    const x = this.uniform() || 2 ** -53;
    const y = this.uniform();
    const normal = Math.sqrt(-2 * Math.log(x)) * Math.sin(2 * Math.PI * y);
    this._normal = Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * y);
    return normal;
  }

  exponential(): number {
    return -Math.log(this.uniform() || 2 ** -53);
  }

  poisson(mean = 1): number {
    const L = Math.exp(-(mean || 1));
    let k = 0;
    let p = 1;

    do {
      ++k;
      p *= this.uniform();
    } while (p > L);

    return k - 1;
  }

  gamma(a: number): number {
    const d = (a < 1 ? 1 + a : a) - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);
    let x = 0;
    let v = 0;
    let u = 0;
    let x2 = 0;

    do {
      do {
        x = this.normal();
        v = Math.pow(c * x + 1, 3);
      } while (v <= 0);

      u = this.uniform();
      x2 = x * x;
    } while (
      u >= 1 - 0.0331 * x2 * x2 &&
      Math.log(u) >= 0.5 * x2 + d * (1 - v + Math.log(v))
    );

    if (a < 1) {
      return d * v * Math.exp(this.exponential() / -a);
    }

    return d * v;
  }
}

RNG.$ = new RNG();
