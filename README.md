
# Project 6: Particle System
Live demo:  https://sangeun44.github.io/WebGL-Particles/

## Particle collection (30 points)
Created Class Particle.ts to store
    curr_position
    curr_velocity    
    prev_position
    prev_velocity
    offset 
    color, is derived from cosine color - gets lighter as it is farther from origin
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
Also used Cosine colors

## Interactive forces (25 points)
Using camera z plane
Using mouse x y 
Ray-casting from camera plane to 0 plane

If the user clicks left button,
it will create an attractor on the 0 z-plane. 
when you attract it will be really weak. It's hard to see and really slow

If the user clicks the right button,
it will create a repeler on the 0 z-plane.
when you repel, it will repel everything away from that point, it will look like the particles are repelling towards u

After getting the position of attraction from main.ts, check if a particle is in range 20 of the point. if it is in range 20, it's acceleration will be away/from the click point.

Really SLOW

you can repel/attract the particles of the mesh a bit but it comes back

http://antongerdelan.net/opengl/raycasting.html - ray casting method source
![](sc.png)
![](flower.png)
![](cow.png)
## Mesh surface attraction (20 points)
Used Webgl obj loader
After getting the vertex information, if the user selects a mesh, it will transform a subset of the particles into a mesh. The rest pf the particles are normal.
The mesh has attractors at each vertex

## Extra credit (50 points max)
* (5 - 15 points) Allow the user to place attractors and repulsors in the scene that influence the motion of the particles. The more variations of influencers you add, the more points you'll receive. Consider adding influencers that do not act uniformly in all directions, or that are not simply points in space but volumes. They should be visible in the scene in some manner.

* (7 points) Have particles stretch along their velocity vectors to imitate motion blur.
    tried to create extra offset for each particle position

* (5 - 15 points) Allow particles to collide with and bounce off of obstacles in the scene. The more complex the shapes you collide particles with, the more points you'll earn.
* (30 points) Animate a mesh and have the particles move along with the animation.
* (15 points) Create a "flocking" mode for your scene where a smaller collection of particles moves around the environment following the [rules for flocking](https://en.wikipedia.org/wiki/Boids).
* (15 points) Use audio to drive an attribute of your particles, whether that be color, velocity, size, shape, or something else!
* (50 points) Create a cloth simulation mode for your scene where you attach particles to each other in a grid using infinitely stiff springs, and perform relaxation iterations over the grid each tick.
