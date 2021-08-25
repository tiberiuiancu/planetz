let utils = {
    deepcopy: function(x) {
        return JSON.parse(JSON.stringify(x));
    },

    /*
     * Converts the given array to jpg and returns it as b64 encoded string
     */
    buffer_to_jpg: function(buff) {
        const COLOR_SCALE = 256;

        // create canvas to write data to; we will extract jpg data from it at the end
        let canvas = document.createElement('canvas');
        canvas.style.display = 'none';
        canvas.height = buff.length;
        canvas.width = buff[0].length;
        let ctx = canvas.getContext('2d');

        for (let i = 0; i < buff.length; ++i) {
            for (let j = 0; j < buff[i].length; ++j) {
                let pixel = buff[i][j];
                let r, g, b;

                // check if image is grayscale and assign rgb accordingly
                if (typeof pixel == "number") {
                    r = g = b = Math.floor(pixel * COLOR_SCALE);
                } else {
                    r = Math.floor(pixel[0]);
                    g = Math.floor(pixel[1]);
                    b = Math.floor(pixel[2]);
                }

                // write image data to canvas
                ctx.fillStyle = 'rgb('+r+','+g+','+b+')';
                ctx.fillRect(j, i, 1, 1);
            }
        }

        // extract and return jpg data from the canvas
        let image_data = canvas.toDataURL('image/jpeg');
        canvas.remove();
        return image_data;
    },

    /*
     * Pads the given buffer; warning: doesn't perform a deep copy
     */
    pad: function(buff, padding_size_height, padding_size_width, padding) {
        let new_height = buff.length + 2 * padding_size_height;
        let new_width = buff[0].length + 2 * padding_size_width;

        let res = []
        for (let i = 0; i < new_height; ++i) {
            res[i] = []
            for (let j = 0; j < new_width; ++j) {
                if (i < padding_size_height || i >= new_height - padding_size_height ||
                    j < padding_size_width || j >= new_width - padding_size_width) {
                    res[i][j] = padding;
                } else {
                    res[i][j] = buff[i - padding_size_height][j - padding_size_width];
                }
            }
        }

        return res;
    },
}
