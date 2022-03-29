var renderer	= new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );



	var updateFcts	= [];
	var scene	= new THREE.Scene();
	var camera	= new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.01, 2000 );
	camera.position.z = 200;



   window.addEventListener("resize", function() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });
	var THREEx = THREEx || {}

	THREEx.ProceduralCity	= function(){
		var geometry = new THREE.CubeGeometry( 1, 1, 1 );
		geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0.2, 0 ) );
		geometry.faces.splice( 3, 1 );
		geometry.faceVertexUvs[0].splice( 3, 1 );
		geometry.faceVertexUvs[0][2][0].set( 0, 0 );
		geometry.faceVertexUvs[0][2][1].set( 0, 0 );
		geometry.faceVertexUvs[0][2][2].set( 0, 0 );
		geometry.faceVertexUvs[0][2][3].set( 0, 0 );
		var buildingMesh= new THREE.Mesh( geometry );


		var light	= new THREE.Color( 0xfffffff)
		var shadow	= new THREE.Color( 0x303050 )

		var cityGeometry= new THREE.Geometry();
		for( var i = 0; i < 20000; i ++ ){
			buildingMesh.position.x	= Math.floor( Math.random() * 200 - 100 ) * 10;
			buildingMesh.position.z	= Math.floor( Math.random() * 200 - 100 ) * 10;
			buildingMesh.rotation.y	= Math.random()*Math.PI*2;
			buildingMesh.scale.x	= Math.random() * Math.random() * Math.random() * Math.random() * 50 + 10;
			buildingMesh.scale.y	= (Math.random() * Math.random() * Math.random() * buildingMesh.scale.x) * 8 + 8;
			buildingMesh.scale.z	= buildingMesh.scale.x

			var value	= 1 - Math.random() * Math.random();
			var baseColor	= new THREE.Color().setRGB( value + Math.random() * 0.1, value, value + Math.random() * 0.1 );
			// set topColor/bottom vertexColors as adjustement of baseColor
			var topColor	= baseColor.clone().multiply( light );
			var bottomColor	= baseColor.clone().multiply( shadow );
			// set .vertexColors for each face
			var geometry	= buildingMesh.geometry;		
			for ( var j = 0, jl = geometry.faces.length; j < jl; j ++ ) {
				if ( j === 2 ) {
					geometry.faces[ j ].vertexColors = [ baseColor, baseColor, baseColor, baseColor ];
				} else {
					geometry.faces[ j ].vertexColors = [ topColor, bottomColor, bottomColor, topColor ];
				}
			}
			THREE.GeometryUtils.merge( cityGeometry, buildingMesh );
		}
		var texture		= new THREE.Texture( generateTextureCanvas() );
		texture.anisotropy	= renderer.getMaxAnisotropy();
		texture.needsUpdate	= true;

		var material	= new THREE.MeshLambertMaterial({
			map		: texture,
			vertexColors	: THREE.VertexColors
		});
		var mesh = new THREE.Mesh(cityGeometry, material );
		return mesh

		function generateTextureCanvas(){
			var canvas	= document.createElement( 'canvas' );
			canvas.width	= 32;
			canvas.height	= 64;
			var context	= canvas.getContext( '2d' );
			context.fillStyle	= '#ffffff';
			context.fillRect( 0, 0, 32, 64 );
			for( var y = 2; y < 64; y += 2 ){
				for( var x = 0; x < 32; x += 2 ){
					var value	= Math.floor( Math.random() * 64 );
					context.fillStyle = 'rgb(' + [value, value, value].join( ',' )  + ')';
					context.fillRect( x, y, 6, 1 );
				}
			}
			var canvas2	= document.createElement( 'canvas' );
			canvas2.width	= 512;
			canvas2.height	= 1024;
			var context	= canvas2.getContext( '2d' );
			context.imageSmoothingEnabled		= false;
			context.webkitImageSmoothingEnabled	= false;
			context.mozImageSmoothingEnabled	= false;
			context.drawImage( canvas, 0, 0, canvas2.width, canvas2.height );
			return canvas2;
		}
	}

	
	var city	= new THREEx.ProceduralCity()
	scene.add(city)	

	

	var light	= new THREE.HemisphereLight( 0xfffff0, 0x101020, 1.25 );
	light.position.set( 0.75, 1, 0.25 );
	scene.add( light );
	
	var mouse	= {x : 0, y : 0}
	document.addEventListener('mousemove', function(event){
		mouse.x	= (event.clientX / window.innerWidth ) - 0.5
		mouse.y	= (event.clientY / window.innerHeight) - 0.5
	}, false)
	updateFcts.push(function(delta, now){
		camera.position.x += (mouse.x*300 - camera.position.x) * (delta*3)
		camera.position.y += (mouse.y*300 - (camera.position.y-200)) * (delta*3)
		camera.lookAt( scene.position )
	})


	
	updateFcts.push(function(){
		renderer.render( scene, camera );		
	})
	
	
	var lastTimeMsec= null
	requestAnimationFrame(function animate(nowMsec){
		requestAnimationFrame( animate );
		lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
		var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
		lastTimeMsec	= nowMsec
		updateFcts.forEach(function(updateFn){
			updateFn(deltaMsec/1000, nowMsec/1000)
		})
	})