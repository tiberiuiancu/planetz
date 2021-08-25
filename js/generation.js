let generator = {
    SIZE: 8,
    RESOLUTION: 256, // at least 1024 for good results

    /*
     * Non-linearity applied to perlin noise for nicer results
     * Essentially makes higher peaks rarer and watery sections more common
     */
    non_lin: function(x) {
        // https://www.desmos.com/calculator/irzyfgi4zk
        // return (x < 0.5) ? 2 * x * x : 2 * x * (x - 1) + 1; // not steep enough

        // https://www.desmos.com/calculator/pooairmida
        let steepness = 3; // increase for steeper curve (better defined land)
        return (x < 0.5) ? (Math.tanh(steepness * (2 * x - 1)) + 1) / 2 : x;
    },

    /*
     * The values we obtain from the perlin noise function are __mostly__ in the range (0.45, 0.75)
     * We 'normalize' these values by spreading them more equally across the (0, 1) range
     * Note that the min and max values can be fine tuned for different results
     */
    normalize: function(x) {
        let min_val = 0.45;
        let max_val = 0.7; // the lower, the more land there is
        let res = (x - min_val) / (max_val - min_val);
        if (res < 0) return 0;
        if (res > 1) return 1;
        return res;
    },

    /*
     * Produces the height map from perlin noise
     * Returns base64 encoded data of the grayscale jpg image representing the heightmap
     */
    get_height_map: function() {
        let noise = [];
        let step = this.SIZE / this.RESOLUTION;

        // loop over all cells of the grid and generate the perlin noise
        let line = 0;
        for (let y = 0; y < this.SIZE; y += step) {
            let row = 0;
            noise[line] = []
            for (let x = 0; x < this.SIZE; x += step) {
                // get the noise
                let p = perlin.getWithOctaves(x, y, [1, 0.5, 0.2, 0.1, 0.05, 0.05, 0.01]);

                // apply processing to the noise for realism
                p = this.normalize(p);
                p = this.non_lin(p);

                // write noise data
                noise[line][row] = p;

                row++;
            }

            line++;
        }

        return noise;
    },

    edge_blur: function(buff) {
        let mid_h = Math.floor(buff.length / 2);
        let mid_w = Math.floor(buff[0].length / 2);

        let dist_to_mid = function(i, j) {
            let dist_h = Math.abs(i - mid_h);
            let dist_w = Math.abs(j - mid_w);

            // how far away are we from the edge as a proportion of the surface 'radius'
            return dist_h > dist_w ? dist_h / mid_h : dist_w / mid_w;
        }

        let decay = function(x) {
            // https://www.desmos.com/calculator/pyvkc7ubxf
            const decay_threshold = 0.3;

            if (x < decay_threshold) return 1;

            return Math.pow((decay_threshold - x) / (1 - decay_threshold), 3) + 1;
        }

        for (let i = 0; i < buff.length; ++i) {
            for (let j = 0; j < buff[i].length; ++j) {
                buff[i][j] *= decay(dist_to_mid(i, j));
            }
        }

        return buff;
    }
}
