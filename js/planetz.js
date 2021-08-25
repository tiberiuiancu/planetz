let planetz = {
    /*
     * Brings it all together; the object properties can then be used in rendering
     */
    generate_planet: function() {
        this.raw_heightmap = generator.get_height_map();
        this.edge_blurred_heightmap = generator.edge_blur(this.raw_heightmap);
        this.heightmap = utils.pad(
            this.edge_blurred_heightmap, 25, 10, 0
        ); // quick fix for the distortion at the poles
        this.heightmap_jpg = utils.buffer_to_jpg(this.heightmap);
        this.terrain = texturing.make_terrain(this.heightmap);
        this.texture = texturing.make_texture(this.terrain, this.heightmap);
        this.texture_jpg = utils.buffer_to_jpg(this.texture);
    }
}
