# (EARTH-LIKE) PLANET GENERATOR

To launch the generator, just open `planetz.html` in your favorite (not IE please) browser. 
Loading can take a while (perhaps up to a minute). If the browser prompts you to kill the page,
click wait; it will eventually complete. 

After the page loads, you can also scroll down to see the generated perlin noise and the texture
applied to the planet.


## How does it work

1. Generate perlin noise. For this I used a script I found online, that I adapted to also use octaves.
2. Process perlin noise:
   1. Normalize between 0 and 1; by default the algorithm produces noise mostly in the range (0.45, 0.75).
   2. Apply non-linearity to noise. We apply a variation of the tanh function to suppress lower values (which
   will constitute water later in the process). This way we have nicer looking coast-lines, as opposed to 
   smooth transitions between water and land.
   3. Apply edge blur. Since we project the texture onto a sphere, land on opposite sides of the texture 
   will look different. Blurring helps blend better.
   4. Pad on top and bottom to avoid projection artefacts (this is only a work-around rather than a solution
   to projection).
3. Generate texture from the resulting height-map:
   1. We designate a minimum threshold under which everything is considered water. We place snow on the
   highest 0.5% of points and stone on the highest 3%. The rest is earth for now.
   2. Add a bit more entropy: pick N points on the map; if these points aren't on water, perform a flood
   fill around them with threshold eps. If the filled area is big enough, transform it randomly into another
   ground type (snow, water or stone).
   3. Color the resulting terrain: for each terrain type we calculate its color as a function of altitude. For example, for stone,
      the higher up it is, the lighter the color. We then apply a bit of noise.


### Parameters that can be tuned


Perlin noise
* Number of octaves and their amplitudes

Generation:
* Size of canvas
* Resolution
* Slope of non-linear function applied to the perlin noise
* Edge blur radius and padding size

Texturing:
* Water, snow, stone prevalence/level
* Flood fill N and eps values (note: the higher the resolution, the lower eps should be)
* Chosen colors for each terrain type and randomness applied to the color
