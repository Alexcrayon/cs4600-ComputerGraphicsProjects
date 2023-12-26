# cs4600-ComputerGraphicsProjects
This repo is for computer graphics related projects from CS4600, Fall 2023, University of Utah.
Implemented using JavaScript and WebGL. 
-------------------------------------------------------
Project7 - Simulation

The project includes a webpage that runs a physical-based simulation using the mass-spring system
The simluation occurs within the block frame, applying a gravity to the mesh when it started. Collisions will be handled when mesh hitting the boundaries, drag any vertex on the mesh to apply a force to see the mass-spring effect.

Getting started:
- Open project7.html to start the program.
- By default the program use a square mesh, a low-poly tea model is also provided.
- Press "Start Simulation" to start the simulation, "Reset" to reset.
- Adjust parameters(time step, gravity, stiffness, etc.) to achieve different result.

-------------------------------------------------------
Project5 - Shading

The above project also support Gouraud shading using a Blinn material model
To see the full shading effects on a high-poly model, use this version without the simulation.

Getting started:
- Open project5.html to start the program.
- Upload a model through OBJ model panel on the bottem right.
- Upload a texture through Texture image panel.
- Adjust Light Direction by draging the light source arrow in the top right panel.
- Adjust shininess to see different exponents' effect on the specular refection.
- A high-poly tea model and bricks texture are provided.
