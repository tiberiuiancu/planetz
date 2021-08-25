/*
 * Adapted after https://github.com/joeiddon/perlin
 */

let perlin = {
    rand_vect: function(){
        let theta = Math.random() * 2 * Math.PI;
        return {x: Math.cos(theta), y: Math.sin(theta)};
    },
    dot_prod_grid: function(x, y, vx, vy){
        let g_vect;
        let d_vect = {x: x - vx, y: y - vy};
        if (this.gradients[[vx,vy]]){
            g_vect = this.gradients[[vx,vy]];
        } else {
            g_vect = this.rand_vect();
            this.gradients[[vx, vy]] = g_vect;
        }
        return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
    },
    smootherstep: function(x){
        return 6*x**5 - 15*x**4 + 10*x**3;
    },
    interp: function(x, a, b){
        return a + this.smootherstep(x) * (b-a);
    },
    seed: function(){
        this.gradients = {};
        this.memory = {};
    },
    get: function(x, y) {
        if (this.memory.hasOwnProperty([x,y])) {
            return this.memory[[x, y]];
        }
        let xf = Math.floor(x);
        let yf = Math.floor(y);
        //interpolate
        let tl = this.dot_prod_grid(x, y, xf,   yf);
        let tr = this.dot_prod_grid(x, y, xf+1, yf);
        let bl = this.dot_prod_grid(x, y, xf,   yf+1);
        let br = this.dot_prod_grid(x, y, xf+1, yf+1);
        let xt = this.interp(x-xf, tl, tr);
        let xb = this.interp(x-xf, bl, br);
        let v = this.interp(y-yf, xt, xb);
        v = (v + 1) / 2; // make value always positive
        this.memory[[x,y]] = v;
        return v;
    },

    /*
     * Amplitudes should be an array of values between 0 and 1, representing
     * the weight of each overlayed perlin map.
     */
    getWithOctaves: function(x, y, amplitudes) {
        let total = 0;
        let frequency = 1;
        let max_val = 0;
        let noise = 0;
        for (let i = 0; i < amplitudes.length; ++i) {
            noise = this.get(x * frequency, y * frequency);
            total += noise * amplitudes[i];
            max_val += amplitudes[i];

            frequency *= 2;
        }

        return total / max_val;
    }
}

perlin.seed();
