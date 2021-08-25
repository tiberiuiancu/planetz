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
        const snow_level = 0.9;
        const stone_level = 0.6;

        const height = heightmap.length;
        const width = heightmap[0].length;

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

        // second pass: add more variety
        // choose N points on the map. If it lands on either stone or earth
        // perform a flood fill on the height map with error eps.
        // change the terrain types of the filled area to another terrain type
        // according to preset probabilities by elevation
        const N_POINTS = 100;

        for (let _ = 0; _ < N_POINTS; ++_) {
            let i = Math.floor(Math.random() * height);
            let j = Math.floor(Math.random() * width);
            const eps = Math.random() / 25;

            if (terrain[i][j] === this.EARTH || terrain[i][j] === this.STONE) {
                let flooded = this.flood_fill(heightmap, eps, [i, j]);
                let change_to = this.SNOW; // todo: change this according to random sampling

                flooded.forEach(function(value) {
                    terrain[value[0]][value[1]] = change_to;
                });
            }
        }

        return terrain;
    },

    flood_fill(buffer, eps, start) {
        let visited = utils.deepcopy(buffer);
        let queue = [start];
        let index = 0;

        let check_coords = function(i, j, prev_i, prev_j) {
            return i > 0 && j > 0 && i < visited.length && j < visited[i].length && visited[i][j] !== -1 &&
                i !== prev_i && j !== prev_j && Math.abs(buffer[i][j] - buffer[prev_i][prev_j]) < eps;
        }

        while (index < queue.length) {
            let current = queue[index];
            index++;

            for (let i = current[0] - 1; i <= current[0] + 1; i++) {
                for (let j = current[1] - 1; j <= current[1] + 1; j++) {
                    if (check_coords(i, j, current[0], current[1])) {
                        queue.push([i, j]);
                        visited[i][j] = -1;
                    }
                }
            }
        }

        return queue;
    },

    make_texture: function(terrain_map) {
        let texture = [];

        // todo: proper coloring based on altitude
        for (let i = 0; i < terrain_map.length; ++i) {
            texture[i] = [];
            for (let j = 0; j < terrain_map[i].length; ++j) {
                let cell = terrain_map[i][j];
                if (cell === this.SNOW) {
                    texture[i][j] = [0, 0, 0];
                } else if (cell === this.STONE) {
                    texture[i][j] = [50, 50, 50];
                } else if (cell === this.EARTH) {
                    texture[i][j] = [0, 255, 0];
                } else {
                    texture[i][j] = [0, 0, 255];
                }
            }
        }

        return texture;
    }
}
