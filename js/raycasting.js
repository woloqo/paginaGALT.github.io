var canvas;
var ctx;
var FPS = 30;

//Dimension del canvas en pixeles
var cWidth  = 500;
var cHeight = 500;

var render = true;
var renderAbanico = true;

//Nivel
var escenario;

//Colores
const playerColor = '#FFFFFF';
const floorColor  = '#666666';
const wallColor   = '#000000';
const colorSuelo  = '#666666';
const colorTecho  = '#3F3F3F';

//objetosss jejejjejej]
var tiles;
var arma;
var spriteArma;
var reprieto;
var sprite;
var maruchan;
var tyler;

const FOV = 60;
const rmFOV = gradosARadianes(FOV/2);
const mFOV = FOV/2;

var lvl1 = [
    [4,4,4,4,4,4,1,1,1,4,3,4,1,4,3,4,1,1,1,1],
    [4,0,0,0,0,4,0,0,1,0,0,0,1,0,0,0,1,0,0,1],
    [4,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1,0,0,1],
    [4,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],
    [4,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],
    [4,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1,0,0,1],
    [4,0,0,0,0,4,0,0,1,0,0,0,1,0,0,0,1,0,0,1],
    [4,4,4,4,4,1,0,0,1,0,0,0,1,0,0,0,1,0,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,0,1,2,1,0,0,1,0,0,0,1,0,0,0,1,0,0,1],
    [1,0,0,2,1,2,0,0,1,0,0,0,1,1,0,1,1,1,1,1],
    [1,0,0,1,2,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,4,3,4,1,1,1,1,1,1,1,1]
];
var lvl2 = [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,1,1,0,0,0,1],
    [1,0,0,0,1,1,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1],
];
var lvl3 = [
	[1,1,2,1,1,1,2,2,1,1],
	[1,0,0,0,0,0,0,1,1,1],
	[1,0,0,0,0,0,0,1,1,1],
	[1,0,0,0,0,0,0,0,0,3],
	[1,0,1,2,1,0,0,0,0,1],
	[1,0,0,0,1,0,0,0,0,1],
	[1,0,0,0,1,0,0,3,3,1],
	[1,0,0,1,1,0,0,1,1,1],
	[1,0,0,0,0,0,0,0,0,1],
	[1,1,1,1,1,1,1,1,1,1]
];

var sprites = [];
var zBuffer = [];



//Input
document.addEventListener('keydown', function(tecla){
    //console.log(tecla);
    switch(tecla.code){
        case "KeyW":
            jugador.up();
            break;
        case "KeyS":
            jugador.down();
            break;
        case "ArrowRight":
            jugador.right();
            break;
        case "ArrowLeft":
            jugador.left();
            break;
        case "Space":
            jugador.shoot();
            arma.changeFrame();
            break;
        case "KeyM":
            switchMode();
            break;
        case "Backspace":
            switchAbanico();
            break;
    }
});
document.addEventListener('keyup', function(tecla){
    switch(tecla.code){
        case "KeyW":
            jugador.stopMoving();
            break;
        case "KeyS":
            jugador.stopMoving();
            break;
        case "ArrowRight":
            jugador.stopRotating();
            break;
        case "ArrowLeft":
            jugador.stopRotating();
            break;
        case "Space":
            arma.changeFrame();
            break;
    }
});

function rescalarCanvas(){
    canvas.style.height = '600px';
    canvas.style.width = '600px';
}

function sueloYTecho(){
    ctx.fillStyle = colorTecho;
    ctx.fillRect(0, 0, 500, 250);
    ctx.fillStyle = colorSuelo;
    ctx.fillRect(0, 250, 500, 500);
}

//Normalizar angulo
function normalize(angulo){
    angulo = angulo%(2*Math.PI);
    if(angulo < 0) angulo = angulo + (2 * Math.PI)
    return angulo;
}

function distanciaEntrePuntos(x1, y1, x2, y2){
    return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
}

function gradosARadianes(angulo){
    angulo = angulo * (Math.PI / 180);
    return angulo;
}

//Clase rayo
class Ray{
    constructor(con, escenario, x, y, anguloJugador, incrementoAngulo, columna){
        this.angulo = anguloJugador + incrementoAngulo;
        this.incrementoAngulo = incrementoAngulo;
        this.anguloJugador = anguloJugador;
        this.escenario = escenario;
        this.columna = columna;
        this.distancia = 0;
        this.wallHitXHor = 0;
        this.wallHitYHor = 0;
        this.wallHitXVer = 0;
        this.wallHitYVer = 0;
        this.wallHitX = 0;
        this.wallHitY = 0;
        this.ctx = con;
        this.pixelTextura;
        this.idTextura = 0;
    }

    setAngulo(angulo){
        this.anguloJugador = angulo;
        this.angulo = normalize(angulo + this.incrementoAngulo);
    }

    cast(){
        this.xIntercept = 0;
        this.yIntercept = 0;
        
        this.abajo = false;
        this.izq   = false;

        this.xStep = 0;
        this.yStep = 0;

        if(this.angulo < Math.PI) this.abajo = true;
        if(this.angulo > Math.PI / 2 && this.angulo < 3 * Math.PI / 2) this.izq = true;

        //Colision orisontal (ya se q se escribe horizontal)
        var choqueHor = false;

        this.yIntercept = Math.floor(this.y / tamTile) * tamTile;

        //Si apunta hacia abajo, aumenta uno
        if(this.abajo) this.yIntercept += tamTile;

        var ady = (this.yIntercept - this.y) / Math.tan(this.angulo);
        this.xIntercept = this.x + ady;

        this.yStep = tamTile;
        this.xStep = this.yStep / Math.tan(this.angulo);

        //si vamos hacia arriba invertimos ystep
        if(!this.abajo) this.yStep = -this.yStep;

        //Comprobar que el xstep es coherente
        if((this.izq && this.xStep > 0) || (!this.izq && this.xStep < 0)) this.xStep = - this.xStep;

        var sigXHor = this.xIntercept;
        var sigYHor = this.yIntercept;

        //si apunta hacia arriba, se resta un pixel para forzar la colision
        if(!this.abajo) sigYHor--;

        //Ahora si buscamos la fakin colision hroziotnal
        while(!choqueHor){
            //sacamos la casilla 
            var casX = parseInt(sigXHor/tamTile);
            var casY = parseInt(sigYHor/tamTile);

            if(this.escenario.collision(casX, casY)){
                choqueHor = true;
                this.wallHitXHor = sigXHor;
                this.wallHitYHor = sigYHor;
            }
            else{
                sigXHor += this.xStep;
                sigYHor += this.yStep;
            }
        }

        //Colision vertical
        var choqueVer = false;

        //buscamos la primera inter
        this.xIntercept = Math.floor(this.x / tamTile) * tamTile;

        //Si apunta a la derecha se incrementa 1
        if(!this.izq) this.xIntercept += tamTile;

        //Se le suma el cateto opuesto
        var opuesto = (this.xIntercept - this.x) * Math.tan(this.angulo);
        this.yIntercept = this.y + opuesto;

        //calcula la distancia de cada paso
        this.xStep = tamTile;
        if(this.izq) this.xStep = -this.xStep;

        this.yStep =  tamTile * Math.tan(this.angulo);
        if((!this.abajo && this.yStep > 0) || (this.abajo && this.yStep < 0)) this.yStep = -this.yStep;

        var sigXVer = this.xIntercept;
        var sigYVer = this.yIntercept;

        if(this.izq) sigXVer--;

        //buscamos la fakin colision vertiuacal;l
        while(!choqueVer && (sigXVer >= 0 && sigYVer >= 0 && sigXVer < cWidth && sigYVer < cHeight)){
            //obtenemos la casilla 
            var casillaX = parseInt(sigXVer/tamTile);
            var casillaY = parseInt(sigYVer/tamTile);

            if(this.escenario.collision(casillaX, casillaY)){
                choqueVer = true;
                this.wallHitXVer = sigXVer;
                this.wallHitYVer = sigYVer;
            }
            else{
                sigXVer += this.xStep;
                sigYVer += this.yStep;
            }
        }

        var distanciaHorizontal = 999999999;
        var distanciaVertical   = 999999999;

        if(choqueHor){
            distanciaHorizontal = distanciaEntrePuntos(this.x, this.y, this.wallHitXHor, this.wallHitYHor);
        }
        if(choqueVer){
            distanciaVertical = distanciaEntrePuntos(this.x, this.y, this.wallHitXVer, this.wallHitYVer);
        }

        //checamos la colision mas cercana entre la colision x e y
        if(distanciaHorizontal < distanciaVertical){
            this.distancia = distanciaHorizontal;
            this.wallHitX = this.wallHitXHor;
            this.wallHitY = this.wallHitYHor;

            var casilla = parseInt(this.wallHitX/tamTile);
            this.pixelTextura = this.wallHitX - (casilla * tamTile);
        }
        else{
            this.distancia = distanciaVertical;
            this.wallHitX = this.wallHitXVer;
            this.wallHitY = this.wallHitYVer;

            var casilla = parseInt(this.wallHitY/tamTile);
            this.pixelTextura = this.wallHitY - (casilla * tamTile);
        }

        this.idTextura = this.escenario.tile(this.wallHitX, this.wallHitY);
        //corregir el ojo de pex
        this.distancia = this.distancia * Math.cos(this.anguloJugador - this.angulo);
        zBuffer[this.columna] = this.distancia;

    }

    renderPared(){
        var altoTile = 500;
        var distanciaPlanoProyeccion = (cWidth/2)/Math.tan(mFOV);
        var alturaMuro = (altoTile/this.distancia) * distanciaPlanoProyeccion;

        //wewewe lets calcular donde empieza y donde termina la linea ejjeje
        var y0 = parseInt(cHeight/2) - parseInt(alturaMuro/2);
        var y1 = y0 + alturaMuro;
        this.x = this.columna;

        //ahora si la dibujamos ejhjejejejejejejejjeje 
        var altoTextura = 64;
        var alturaImagen = y0 - y1;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            tiles,                           //imagen en png
            this.pixelTextura+escenario.altoM,               //x clipping
            (this.idTextura-1)*altoTextura,  //y clipping
            1,                               //ancho clippingggg jejej
            64,                              //alto clipping jeje
            this.columna,                    //posicion x jeje
            y1,                              //posicion y jejeje
            1,                               //anchura real
            alturaImagen        
        );
    }

    draw(){
        this.cast();
        this.renderPared();
    }

    drawanglee(){
        this.cast();

        var xDestino = this.wallHitX;    
        var yDestino = this.wallHitY;	
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.lineTo(xDestino, yDestino);
        this.ctx.strokeStyle = "red";
        this.ctx.stroke();
    }
}

//Clase escenario
class Level{

    constructor(can, con, arr){

        
        this.canvas = can;
        this.matriz = arr;
        this.ctx = con;
        
        //Dimensiones matriz
        this.anchoM  = this.matriz[0].length;
        this.altoM   = this.matriz.length;
        
        

        console.log(this.altoM, this.anchoM);

        //Dimensiones del canvas
        this.altoC = this.canvas.height;
        this.anchoC  = this.canvas.width;

        //Dimensiones de los tiles
        this.anchoT  = parseInt(this.anchoC  / this.anchoM);
        this.altoT   = parseInt(this.altoC   / this.altoM);
    }

    collision(x, y){
        var collide = false;
        if(this.matriz[y][x] != 0) collide = true;
        return collide;
    }

    tile(x, y){
        var casillaX = parseInt(x/this.anchoT);
        var casillaY = parseInt(y/this.altoT);
        return(this.matriz[casillaY][casillaX]);
    }

    draw(){
        var color;
        for(var i=0; i<this.altoM; i++){
            for(var j=0; j<this.anchoM;j++){
                if(this.matriz[i][j] != 0) color = wallColor;
                else color = floorColor;

                this.ctx.fillStyle = color;
                this.ctx.fillRect(j*this.anchoT, i*this.altoT, this.anchoT, this.altoT);
            }
        }
    }

}

//Clase jugar
class Player{
    constructor(con, escenario, x, y){

        this.ctx = con;
        this.escenario = escenario;

        this.x = x;
        this.y = y;

        this.rotar   = 0; // -1 = izq  ~ 1 = der
        this.mover     = 0; // 0 = parao ~ 1 = aelante ~ -1 atra

        this.anguloRotacion = 0;
        this.velMov   = 3;                   //En pixeles;
        this.velRot   = 3 * (Math.PI / 180); //Grados

        this.numRayos = cWidth;
        this.rayos = [];

        //calcular el angulo de cada rayo jejejejejjejej
        var incAngulo =  gradosARadianes(FOV/this.numRayos);
        var anguloInicial = gradosARadianes(this.anguloRotacion - mFOV);

        var anguloRayo = anguloInicial;

        //RTX BABY (literalmente, rtx pero bebe)
        for(let i = 0; i < this.numRayos; i++){
            this.rayos[i] = new Ray(this.ctx, this.escenario, this.x, this.y, this.anguloRotacion, anguloRayo, i);
            anguloRayo += incAngulo;
        }

    }

    up(){ this.mover = 1; }
    down(){ this.mover = -1; }
    left(){ this.rotar = -1; }
    right(){ this.rotar = 1; }
    stopMoving(){ this.mover = 0; }
    stopRotating(){ this.rotar = 0; }

    collision(x, y){
        var collide = false;

        var casillaY = parseInt(y/this.escenario.altoT);
        var casillaX = parseInt(x/this.escenario.anchoT);

        if(this.escenario.collision(casillaX,casillaY)) collide = true;
        return collide;
    }

    update(){
        //movimiento
        var newX = this.x + this.mover * Math.cos(this.anguloRotacion) * this.velMov;
        var newY = this.y + this.mover * Math.sin(this.anguloRotacion) * this.velMov;

        if(!this.collision(newX, newY)){
            this.x = newX;
            this.y = newY;
        }

        //giro
        this.anguloRotacion += this.rotar * this.velRot;
        this.anguloRotacion = normalize(this.anguloRotacion);

        //actualiza el angulo
        for(let i = 0; i < this.numRayos; i++){
            this.rayos[i].x = this.x;
            this.rayos[i].y = this.y;
            this.rayos[i].setAngulo(this.anguloRotacion);
        }
    }
    
    draw(){
        this.update();
        
        //rayos
        for(let i = 0; i < this.numRayos; i++){
            // this.rayos[i].draw();
            this.rayos[i].draw();
        }
			
    }

    drawanglee(){
        this.update();

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(this.x-3, this.y-3, 6,6);
        
        
        //LÍNEA DIRECCIÓN
        var xDestino = this.x + Math.cos(this.anguloRotacion) * 40;    //40 es la longitud de la línea
        var yDestino = this.y + Math.sin(this.anguloRotacion) * 40;	
        
        if(renderAbanico){
            for(let i = 0; i < this.numRayos; i++){
                // this.rayos[i].draw();
                this.rayos[i].drawanglee();
            }
        }

        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.lineTo(xDestino, yDestino);
        this.ctx.strokeStyle = "#FFFFFF";
        this.ctx.stroke();
        
    }

    shoot(){
        for(let i=0; i<sprites.length; i++){
            if(sprites[i].shootable){
                console.log("Le diste a:", sprites[i].nombre);
                sprites.splice(i, 1);
            }
        }
    }

}

class Sprite{

	constructor(x,y,imagen, nombre){
		
		this.x 		 = x;
		this.y 		 = y;
		this.imagen  = imagen;
		
		this.distancia = 0;
		this.angulo    = 0;
		
		this.visible = false;
		this.shootable = false;

        this.nombre = nombre;

	}	
	
	//CALCULAMOS EL ÁNGULO CON RESPECTO AL JUGADOR
	calculaAngulo(){
		var vectX = this.x - jugador.x;
		var vectY = this.y - jugador.y;

		var anguloJugadorObjeto = Math.atan2(vectY, vectX);
		var diferenciaAngulo = jugador.anguloRotacion - anguloJugadorObjeto;
			
		if (diferenciaAngulo < (-1*Math.PI)) diferenciaAngulo += 2.0 * Math.PI;
		if (diferenciaAngulo > Math.PI)  diferenciaAngulo -= 2.0 * Math.PI;

		diferenciaAngulo = Math.abs(diferenciaAngulo);

		if(diferenciaAngulo < rmFOV) this.visible = true;
		else this.visible = false;

        //if(this.visible) console.log(diferenciaAngulo, anguloJugadorObjeto, this.nombre);

        if(diferenciaAngulo == rmFOV){
            this.shootable = true;
            console.log(this.nombre, " es ", this.shootable, this.visible, anguloJugadorObjeto);
        }
        else{
            this.shootable = false;
        }

        //console.log(diferenciaAngulo);
        //console.log(diferenciaAngulo, mFOV);
    }
	
	dibuja(){
		
		this.calculaAngulo();
		this.distancia = distanciaEntrePuntos(jugador.x,jugador.y,this.x,this.y)
		
		if(this.visible == true){
			var altoTile = 500;		//Es la altura que tendrá el sprite al renderizarlo
			var distanciaPlanoProyeccion = (cWidth/2) / Math.tan(FOV / 2);
			var alturaSprite = (altoTile / this.distancia) * distanciaPlanoProyeccion;
			
			//CALCULAMOS DONDE EMPIEZA Y ACABA LA LÍNEA, CENTRÁNDOLA EN PANTALLA (EN VERTICAL)
			var y0 = parseInt(cHeight/2) - parseInt(alturaSprite/2);
			var y1 = y0 + alturaSprite;
			
			var altoTextura = 64;
			var anchoTextura = 64;
					
			var alturaTextura = y0 - y1;
			var anchuraTextura = alturaTextura;

			// CALCULAMOS LA COORDENADA X DEL SPRITE
			var dx = this.x - jugador.x;
			var dy = this.y - jugador.y;
			
			var spriteAngle = Math.atan2(dy, dx) - jugador.anguloRotacion;
			
			var viewDist = 500;
			
			var x0 = Math.tan(spriteAngle) * viewDist;
			var x = (cHeight/2 + x0 - anchuraTextura/2);

			ctx.imageSmoothingEnabled = false;	//PIXELAMOS LA IMAGEN
			
			//proporción de anchura de X
			var anchuraColumna = alturaTextura/altoTextura;	
			
			for(let i=0; i< anchoTextura; i++){
				for(let j=0; j<anchuraColumna; j++){
					
					var x1 = parseInt(x+((i-1)*anchuraColumna)+j);	
                    if((i >= 10 && i <= 30) && x1 == cWidth/2) this.shootable = true;
					
					//COMPARAMOS LA LÍNEA ACTUAL CON LA DISTANCIA DEL ZBUFFER PARA DECIDIR SI DIBUJAMOS
					if(zBuffer[x1] > this.distancia){
                        //console.log(zBuffer[x1],i,0,1,altoTextura-1,x1,y1,1,alturaTextura);
						ctx.drawImage(this.imagen,i,0,1,altoTextura-1,x1,y1,1,alturaTextura);
					}
					
				}
			}
		}
	}
}
 
class Arma{
    constructor(image){
        this.image = image;
        this.tam = this.image.height;
        this.x = (cWidth/2)-(this.tam/2)+10;
        this.y = cHeight-this.tam;
        this.frame = 0;
        console.log(this.image, this.tam);
    }

    draw(){
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.image, this.frame*256, 0, 256, 256, this.x, this.y, 256, 256);
        //console.log(this.image);
    }

    changeFrame(){
        if(this.frame == 0) this.frame = 2;
        else this.frame = 0;
    }
}

function renderSprites(){
	sprites.sort(function(obj1, obj2) {
		// Ascending: obj1.distancia - obj2.distancia
		// Descending: obj2.distancia - obj1.distancia
		return obj2.distancia - obj1.distancia;
	});
	
	//DIBUJAMOS LOS SPRITES UNO POR UNO
	for(a=0; a<sprites.length; a++){
        //console.log(sprites[a]);
		sprites[a].dibuja();
	}
  
}

var tamTile = parseInt(cHeight/lvl1[0].length);

function init(){
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.height = cHeight;
    canvas.width  = cWidth;

    rescalarCanvas();

    escenario = new Level(canvas, ctx, lvl1);
    jugador = new Player(ctx, escenario, 100, 100);

    spriteArma = new Image();
    spriteArma.src = "sprites/arma.png";
    arma = new Arma(spriteArma);

    //vargamos las imagenes jejeje
    tiles = new Image();
    tiles.src = "sprites/walls.png";

    reprieto = new Image();
    reprieto.src = "sprites/reprieto.jpg";

    sprite = new Image();
    sprite.src = "sprites/sprite.png";

    maruchan = new Image();
    maruchan.src = "sprites/maruchan.png";

    tyler = new Image();
    tyler.src = "sprites/tyler.png";
    
    sprites.push(new Sprite(100, 300, reprieto, "reprieto"));
    sprites.push(new Sprite(420, 440, sprite, "sprite"));
    sprites.push(new Sprite(420, 450, maruchan, "maruchan"));
    sprites.push(new Sprite(455, 50, tyler, "tyler"));

    setInterval(function(){main();},1000/FPS);
}

function cleanCanvas(){
    canvas.height = canvas.height;
    canvas.width  = canvas.width;
}

function switchMode() {
    console.log("jelo jelo jelo ahora es",render);
    if(render == true) render = false;
    else if(render == false) render = true;
}

function switchAbanico(){
    if(renderAbanico == true) renderAbanico = false;
    else if(renderAbanico == false) renderAbanico = true;
}


function main(){
    //woloqo was here
    //console.log("Hello wolrd");
    cleanCanvas();

    if(render){
        sueloYTecho();
        jugador.draw();
        renderSprites();
        arma.draw();
    }
    else{
        escenario.draw();
        jugador.drawanglee();
    }

}