// Implemented by Alex Cao u1123501, CS4600 Project7, Fall 2023

// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	// create a transformation matrix by combining rotation and translation.
	var trans = [
		Math.cos(rotationY)                    , 0                  , -Math.sin(rotationY)                   , 0,
		Math.sin(rotationY)*Math.sin(rotationX), Math.cos(rotationX), Math.cos(rotationY)*Math.sin(rotationX), 0,
		Math.sin(rotationY)*Math.cos(rotationX),-Math.sin(rotationX), Math.cos(rotationY)*Math.cos(rotationX), 0,
		translationX                           ,        translationY, translationZ                           , 1
	];
	var mv = trans;
	return mv;
}


class MeshDrawer
{
	// The constructor handles various initializations.
	constructor()
	{
		// Compile the shader program
		this.prog = InitShaderProgram( meshVS, meshFS );

		// setup matrix
		this.mvp = gl.getUniformLocation( this.prog, 'mvp');
		this.mv = gl.getUniformLocation(this.prog, 'mv');
		this.mn = gl.getUniformLocation(this.prog, 'mn');
		
		// setup mesh vertex pos
		this.vertPos = gl.getAttribLocation( this.prog, 'pos' );
		
		// setup texture vertex position
		this.texCoord = gl.getAttribLocation(this.prog, 'txc');

		// setup normal
		this.normal = gl.getAttribLocation(this.prog, 'norm');
		
		//setup texture sampler
		this.sampler = gl.getUniformLocation(this.prog, 'tex');

		//setup uniform variables for those checkboxes
		this.swap = gl.getUniformLocation(this.prog, 'swapped');
		this.showTex = gl.getUniformLocation(this.prog, 'showTex');
		this.texLoaded = gl.getUniformLocation(this.prog, 'tLoaded');

		//for light and camera
		this.lightDir = gl.getUniformLocation(this.prog, 'light');
		this.camPos = gl.getUniformLocation(this.prog, 'cam');
		this.shininess = gl.getUniformLocation(this.prog, 'shininess');

		//create buffer
		this.vertBuffer = gl.createBuffer();
		this.texCoordBuffer = gl.createBuffer();
		this.normalBuffer = gl.createBuffer();
		
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		this.numTriangles = vertPos.length / 3;
		//update the vertex bufffer 
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);
		//update the texture coord bufffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		//update normals
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

		//set the status for the show texture checkbox, texture is not loaded yet
		gl.useProgram(this.prog);
		gl.uniform1i(this.texLoaded, 0);
		gl.uniform1i(this.showTex, 1);
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		gl.useProgram(this.prog);
		if (swap)
			gl.uniform1i(this.swap, 1);
		else
			gl.uniform1i(this.swap, 0);
	}
	
	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{

		gl.useProgram( this.prog );
		//set transformation matrix
		gl.uniformMatrix4fv( this.mvp, false, matrixMVP ); 
		gl.uniformMatrix4fv(this.mv, false, matrixMV );
		gl.uniformMatrix3fv(this.mn, false, matrixNormal);
		gl.uniform3f(this.camPos, 0, 0, 0);
		//set vertice for triangle meshes
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vertBuffer);
		gl.vertexAttribPointer( this.vertPos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.vertPos );
		//set texture coordinates
		gl.bindBuffer( gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.vertexAttribPointer( this.texCoord, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.texCoord);

		//set vertex normal
		gl.bindBuffer( gl.ARRAY_BUFFER, this.normalBuffer);
		gl.vertexAttribPointer( this.normal, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.normal );

		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// Bind the texture
		const mytex = gl.createTexture();
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, mytex);

		// set the texture image data 
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );
		gl.generateMipmap(gl.TEXTURE_2D);
		
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		
		// set uniform parameter(s) of the fragment shader, so that it uses the texture.
		gl.useProgram(this.prog);
		gl.uniform1i(this.sampler, 0);
		gl.uniform1i(this.texLoaded, 1); 
	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		gl.useProgram(this.prog);
		if(show){
			gl.uniform1i(this.showTex, 1);
		}
		else{
			gl.uniform1i(this.showTex, 0);
		}
	}
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		gl.useProgram(this.prog);
		gl.uniform3f(this.lightDir, x, y, z); 
	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		gl.useProgram(this.prog);
		gl.uniform1f(this.shininess, shininess); 
	}
}

// Vertex shader source code
// Create a Blinn material model

var meshVS = `
	attribute vec3 pos;
	attribute vec2 txc;
	attribute vec3 norm;

	uniform int swapped;
	
	uniform mat4 mvp;
	uniform mat4 mv;
	uniform mat3 mn;

	uniform vec3 cam;
	uniform vec3 light;
	uniform float shininess;
	
	varying vec2 texCoord;
	varying vec3 diff;
	varying vec3 spec;
	

	void main()
	{
		vec3 white = vec3(1,1,1);
		vec4 camPos = mv * vec4(pos, 1);
		vec3 v = normalize(vec3(0.0) - camPos.xyz );
		vec3 n = normalize(mn * norm); 

		//compute diffuse 
		float diffTerm= max(dot(n, light), 0.0);
		diff = vec3(diffTerm);
		
		//compute specular 
		vec3 h = normalize(v + light);
		float specGeo = max(dot(n, h), 0.0); 
		float specTerm = pow(specGeo, shininess);
		
		spec = white * specTerm; 
		
		if(swapped == 0){
			gl_Position = mvp * vec4(pos,1);
			texCoord = txc;			 
		}
		if(swapped == 1){
			vec3 newPos = vec3(pos.x, pos.z, pos.y);
			gl_Position = mvp * vec4(newPos,1);
			texCoord = txc;
		}
	}
`;
// Fragment shader source code
// Apply texture to the mesh, if texture was not set, apply white color instead
var meshFS = `
	precision mediump float;
	
	uniform sampler2D tex;
	uniform int showTex;
	uniform int tLoaded; 

	varying vec2 texCoord;
	varying vec3 diff;
	varying vec3 spec;

	void main()
	{
		vec3 white = vec3(1,1,1);
		vec3 color;
		if(tLoaded == 0 && showTex == 1){ 
			color = white * (diff * white + spec);
			gl_FragColor = vec4(color,1);
		}
		if(tLoaded == 1 && showTex == 1){ 			
			color = white * (diff * texture2D(tex, texCoord).xyz + spec);
			gl_FragColor = vec4(color,1);
		}
		if(tLoaded == 1 && showTex == 0){
			color = white * (diff * white + spec);
			gl_FragColor = vec4(color,1);
		}
	}
`;

// This function is called for every step of the simulation.
// Its job is to advance the simulation for the given time step duration dt.
// It updates the given positions and velocities.
function SimTimeStep( dt, positions, velocities, springs, stiffness, damping, particleMass, gravity, restitution )
{
	var forces = Array( positions.length ); // The total for per particle

	// Compute the total force of each particle
	// Initialize
	for(var i = 0; i < positions.length; i+=1){
		forces[i] = new Vec3(0,0,0);
	}
	// Add Gravity
	for(var i = 0; i < positions.length; i+=1){
		forces[i].inc(gravity.mul(particleMass));
	}
	// Mass-spring
	for(var s = 0; s < springs.length; s+=1){
		var i = positions[springs[s].p0];
		var j = positions[springs[s].p1];
		//spring force
		var l = j.sub(i).len();
		var d = j.sub(i).div(l);
		var Fs = d.mul(stiffness * (l - springs[s].rest));
		
		//damping force
		diffinV = velocities[springs[s].p1].sub(velocities[springs[s].p0]);
		var ldot = d.dot(diffinV);
		var Fd = d.mul(damping * ldot);
		//update foreces
		forces[springs[s].p0].inc(Fs.add(Fd));
		forces[springs[s].p1].dec(Fs.add(Fd));
	}
	// Update positions and velocities
	for (var i = 0; i < positions.length; i+=1){
		var a = forces[i].div(particleMass);
		var vt = velocities[i].add(a.mul(dt));
		var xt = positions[i].add(vt.mul(dt));
		velocities[i].set(vt);
		positions[i].set(xt);
	}
	// Handle collisions
	for (var i = 0; i < positions.length; i+=1){
		// change xyz of position and velocity if any collisions occur in that axis
		// if not, they will remain unchanged
		var posCopy = positions[i].copy();
		var velocityCopy = velocities[i].copy();
		var pos_x = posCopy.x;
		var pos_y = posCopy.y;
		var pos_z = posCopy.z;

		var vel_x = velocityCopy.x;
		var vel_y = velocityCopy.y;
		var vel_z = velocityCopy.z;
		
		// check collision in y direction
		if (positions[i].y < -1 || positions[i].y > 1){
			var y0;
			if(positions[i].y < -1)
				y0 = -1;
			else if (positions[i].y > 1){
				y0 = 1;
			}
			var h = Math.abs(positions[i].y - y0);
			var h2 = restitution * h;
			
			vel_y = velocities[i].y * -restitution;
			pos_y = -1 + h2;

		
		}
		// check collision in x direction
		if (positions[i].x < -1 || positions[i].x > 1){
			var x0;
			if(positions[i].x < -1)
				x0 = -1;
			else if (positions[i].x > 1){
				x0 = 1;
			}

			var h_x = Math.abs(positions[i].x  - x0);
			var h_x2 = restitution * h_x;

			vel_x = velocities[i].x * -restitution;
			pos_x = x0 + h_x2;			
		}
		// check collision in z direction
		if (positions[i].z < -1 || positions[i].z > 1){
			var z0;
			if(positions[i].z < -1)
				z0 = -1;
			else if (positions[i].z > 1){
				z0 = 1;
			}

			var h_z = Math.abs(positions[i].z  - z0);
			var h_z2 = restitution * h_z;

			vel_z = velocities[i].z * -restitution;
			pos_z = z0 + h_z2;			
		}
		// update position and velocity
		positions[i].set(new Vec3(pos_x, pos_y, pos_z));
		velocities[i].set(new Vec3(vel_x, vel_y, vel_z));
	}

}

