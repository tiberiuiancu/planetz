let texturing = {
    WATER: 0,
    EARTH: 1,
    STONE: 2,
    SNOW: 3,

    /*
     * Given the heightmap, it returns a 2d array: for each cell we store information
     * about the terrain type
     */
    make_terrain: function(heightmap) {
        const water_level = 0.05;

        const height = heightmap.length;
        const width = heightmap[0].length;

        let flatheightmap = [];
        for (let i = 0; i < heightmap.length; ++i) {
            for (let j = 0; j < heightmap[i].length; ++j) {
                flatheightmap.push(heightmap[i][j]);
            }
        }
        flatheightmap.sort();

        // top 1% of values are snow
        const snow_level = flatheightmap[Math.floor(0.995 * flatheightmap.length)];
        const stone_level = flatheightmap[Math.floor(0.97 * flatheightmap.length)];

        // first pass: set water in low area,
        // stone and snow in high areas and earth in-between
        let terrain = [];
        for (let i = 0; i < heightmap.length; ++i) {
            terrain[i] = [];
            for (let j = 0; j < heightmap[i].length; ++j) {
                if (heightmap[i][j] < water_level) {
                    terrain[i][j] = this.WATER;
                } else if (heightmap[i][j] > snow_level) {
                    terrain[i][j] = this.SNOW;
                } else if (heightmap[i][j] > stone_level) {
                    terrain[i][j] = this.STONE;
                } else {
                    terrain[i][j] = this.EARTH;
                }
            }
        }

        // calculate min max so the next step doesn't interfere with coloring
        this.calculate_min_max(terrain, heightmap);

        // second pass: add more variety
        // choose N points on the map. If the point is on land,
        // perform a flood fill on the height map with error eps.
        // change the terrain types of the filled area to either
        // water or stone, for more variety
        const N_POINTS = 200;
        const eps = 0.002;

        for (let _ = 0; _ < N_POINTS; ++_) {
            let i = Math.floor(Math.random() * height);
            let j = Math.floor(Math.random() * width);

            if (terrain[i][j] !== this.WATER) {
                let flooded = this.flood_fill(heightmap, terrain, eps, [i, j]);
                let rand = Math.random();
                let change_to;
                if (rand < 0.2) {
                    change_to = this.SNOW;
                } else if (rand < 0.6) {
                    change_to = this.STONE;
                } else {
                    change_to = this.WATER;
                }

                // if we flooded a big enough area, display it
                if (flooded.length > 10) {
                    for (let i = 0; i < flooded.length; ++i) {
                        terrain[flooded[i][0]][flooded[i][1]] = change_to;
                    }
                }
            }
        }

        return terrain;
    },

    flood_fill(heightmap, terrain, eps, start) {
        let visited = utils.deepcopy(heightmap);
        let queue = [start];
        let index = 0;

        let check_coords = function(i, j, prev_i, prev_j) {
            return i > 0 && j > 0 && i < visited.length && j < visited[i].length && visited[i][j] !== -1 &&
                (i !== prev_i || j !== prev_j) && Math.abs(heightmap[i][j] - heightmap[prev_i][prev_j]) < eps &&
                terrain[i][j] !== this.WATER;
        }

        while (index < queue.length) {
            let current = queue[index];
            index++;

            for (let i = current[0] - 1; i <= current[0] + 1; i++) {
                for (let j = current[1] - 1; j <= current[1] + 1; j++) {
                    if (check_coords(i, j, current[0], current[1])) {
                        queue.push([i, j]);
                        visited[i][j] = -1; // mark as visited
                    }
                }
            }
        }

        return queue;
    },

    /*
     * We calculate the color by assuming the altitudes for each terrain type are evenly distributed
     * between the calculated minimum and maximum value (which is not exactly the case but it works pretty well)
     * Assuming a uniform distribution, we calculate the percentile of the height of the current cell.
     * Based on the percentile we assign a color that sits in between predefined rgb values (chosen separately
     * for each terrain type)
     */
    get_color: function(terrain_type, altitude) {
        let min_val, max_val, percentile;

        if (terrain_type === this.WATER) {
            min_val = [5,24,55];
            max_val = [20,53,96];
            percentile = (altitude - this.water_height[0]) / (this.water_height[1] - this.water_height[0]);
        } else if (terrain_type === this.EARTH) {
            min_val = [53,72,43];
            max_val = [100,104,69];
            percentile = (this.earth_height[1] - altitude) / (this.earth_height[1] - this.earth_height[0]);
        } else if (terrain_type === this.STONE) {
            min_val = [53,72,43];
            max_val = [158,149,145];
            percentile = (altitude - this.stone_height[0]) / (this.stone_height[1] - this.stone_height[0]);
        } else {
            min_val = [243,221,201];
            max_val = [255,240,226];
            percentile = (this.snow_height[1] - altitude) / (this.snow_height[1] - this.snow_height[0]);
        }

        // calculate rgb based on altitude percentile of the terrain type of the cell and add a bit of randomness
        let rand_scale = 10;
        if (percentile < 0) percentile = 0;
        if (percentile > 1) percentile = 1;
        let r = Math.floor((max_val[0] - min_val[0]) * percentile + min_val[0] + (Math.random() - 0.5) * rand_scale);
        let g = Math.floor((max_val[1] - min_val[1]) * percentile + min_val[1] + (Math.random() - 0.5) * rand_scale);
        let b = Math.floor((max_val[2] - min_val[2]) * percentile + min_val[2] + (Math.random() - 0.5) * rand_scale);

        return [r, g, b];
    },

    /*
     * calculate minimum and maximum height for each terrain type; we will use them when coloring
     */
    calculate_min_max: function(terrain, heightmap) {
        this.water_height = [1, 0];
        this.earth_height = [1, 0];
        this.stone_height = [1, 0];
        this.snow_height = [1, 0];
        for (let i = 0; i < heightmap.length; i++) {
            for (let j = 0; j < heightmap[i].length; j++) {
                switch (terrain[i][j]) {
                    case this.WATER:
                        this.water_height[0] = Math.min(this.water_height[0], heightmap[i][j]);
                        this.water_height[1] = Math.max(this.water_height[1], heightmap[i][j]);
                        break;
                    case this.EARTH:
                        this.earth_height[0] = Math.min(this.earth_height[0], heightmap[i][j]);
                        this.earth_height[1] = Math.max(this.earth_height[1], heightmap[i][j]);
                        break;
                    case this.STONE:
                        this.stone_height[0] = Math.min(this.stone_height[0], heightmap[i][j]);
                        this.stone_height[1] = Math.max(this.stone_height[1], heightmap[i][j]);
                        break;
                    case this.SNOW:
                        this.snow_height[0] = Math.min(this.snow_height[0], heightmap[i][j]);
                        this.snow_height[1] = Math.max(this.snow_height[1], heightmap[i][j]);
                        break;
                    default:
                        break;
                }
            }
        }
    },

    make_texture: function(terrain, heightmap) {
        // fill texture array
        let texture = [];
        for (let i = 0; i < terrain.length; ++i) {
            texture[i] = [];
            for (let j = 0; j < terrain[i].length; ++j) {
                texture[i][j] = this.get_color(terrain[i][j], heightmap[i][j]);
            }
        }

        return texture;
    }
}
