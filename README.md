
# Project 6: Particle System

## Particle collection (30 points)
Created Class Particle.ts to store
    curr_position
    curr_velocity    
    prev_position
    prev_velocity
    offset 
    color, cosine color
    acceleration
    mass, which is constant

    for each particle
    tried to make it contain arrays of particles and particles' data but it seemed better to hardcode it later in main.ts

Particles update() function updates by the Verlet Integration

Main.ts creates particles and puts them into array
updates everytime with update() to change offsetArray and ColorsArray for Square instance VBO

Particles are constrained to a sphere for ease of viewing 
-changing mass will make the particles faster

## Procedural coloration and shaping of particles (15 points)
Colors of the particle depend on time and position from the center.

## Interactive forces (25 points)
Using camera z plane
Using mouse x y 
Ray-casting from camera plane to 0 plane

If the user clicks left button,
it will create an attractor on the 0- z-plane. 

After getting the position of attraction, check if a particle is in range 5 of the point. if it is in range 5, it's direction will be made into the point, 
it's range of motion will be restricted to 2 around the point

If the user clicks right button,
it will create an repeler on the 0-z-plane.


You might also consider allowing the user the option of activating "force fields", i.e. invisible 3D noise functions that act as forces on the particles as they move through the scene. You might even consider implementing something like [curl noise](https://petewerner.blogspot.com/2015/02/intro-to-curl-noise.html) to move your particles. Creating a visualization of these fields by drawing small `GL_LINES` in the direction of the force every N units in the world may be helpful for determining if your code works as expected.

## Mesh surface attraction (20 points)
Give the user the option of selecting a mesh from a drop-down menu in your GUI and have a subset of your particles become attracted to points on the surface of the mesh. To start, try just having each vertex on the mesh attract one unique particle in your collection. For extra credit, try generating points on the surfaces of the mesh faces that will attract more particles. Consider this method of warping a 2D point with X, Y values in the range [0, 1) to the barycentric coordinates (u, v) of any arbitrary triangle:

`(u, v) = (1 - sqrt(x), y * sqrt(x))`

You can map these (u, v) coordinates to a point on any triangle using this method from `Physically Based Rendering From Theory to Implementation, Third Edition`'s chapter on triangle meshes:

![](pbrt.jpg)

Consider pre-generating these mesh attractor points at load time so your program runs in real time as you swap out meshes.

## \~\*\~\*\~A E S T H E T I C\~\*\~\*\~ (10 points)
As always, the artistic merit of your project plays a small role in your grade. The more interesting, varied, and procedural your project is, the higher your grade will be. Go crazy, make it vaporwave themed or something! Don't neglect the background of your scene; a static gray backdrop is pretty boring!

## Extra credit (50 points max)
* (5 - 15 points) Allow the user to place attractors and repulsors in the scene that influence the motion of the particles. The more variations of influencers you add, the more points you'll receive. Consider adding influencers that do not act uniformly in all directions, or that are not simply points in space but volumes. They should be visible in the scene in some manner.
* (7 points) Have particles stretch along their velocity vectors to imitate motion blur.
* (5 - 15 points) Allow particles to collide with and bounce off of obstacles in the scene. The more complex the shapes you collide particles with, the more points you'll earn.
* (30 points) Animate a mesh and have the particles move along with the animation.
* (15 points) Create a "flocking" mode for your scene where a smaller collection of particles moves around the environment following the [rules for flocking](https://en.wikipedia.org/wiki/Boids).
* (15 points) Use audio to drive an attribute of your particles, whether that be color, velocity, size, shape, or something else!
* (50 points) Create a cloth simulation mode for your scene where you attach particles to each other in a grid using infinitely stiff springs, and perform relaxation iterations over the grid each tick.
