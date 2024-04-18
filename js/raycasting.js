var canvas;
var ctx;
var FPS = 30;

//Dimension del canvas en pixeles
var cWidth  = 500;
var cHeight = 500;
var tamTile = 50;

//Nivel
var escenario;

//Colores
const playerColor = '#FFFFFF';
const floorColor  = '#666666';
const wallColor   = '#000000';

var lvl1 = [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,1,1,0,0,0,1],
    [1,0,0,0,1,1,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1]
];

//Input
document.addEventListener('keydown', function(tecla){
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
    }
});

//Normalizar angulo
function normalize(angulo){
    angulo = angulo%(2*Math.PI);
    if(angulo < 0) angulo = angulo + (2 * Math.PI)
    return angulo;
}

function distanciaEntrePuntos(x1, y1, x2, y2){
    return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
}

//Clase rayo
class Ray{
    constructor(con, escenario, x, y, anguloJugador, incrementoAngulo, columna){
        this.incrementoAngulo = incrementoAngulo;
        this.angulo = anguloJugador;
        this.escenario = escenario;
        this.columna = columna;
        this.wallHitXHor = 0;
        this.wallHitYHor = 0;
        this.wallHitXVer = 0;
        this.wallHitYVer = 0;
        this.wallHitX = 0;
        this.wallHitY = 0;
        this.ctx = con;
        this.x = x;
        this.y = y;
    }

    setAngulo(angulo){
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
            this.wallHitX = this.wallHitXHor;
            this.wallHitY = this.wallHitYHor;
        }
        else{
            this.wallHitX = this.wallHitXVer;
            this.wallHitY = this.wallHitYVer;
        }
    }

    draw(){
        //Dibuja el rayo
        this.cast();

        var xDest = this.wallHitX;
        var yDest = this.wallHitY;

        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.lineTo(xDest, yDest);
        this.ctx.strokeStyle = 'red';
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

    draw(){
        var color;
        for(var i=0; i<this.altoM; i++){
            for(var j=0; j<this.anchoM;j++){
                if(this.matriz[i][j] == 1) color = wallColor;
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

        this.rayo = new Ray(this.ctx, this.escenario, this.x, this.y, this.anguloRotacion, 0);

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
    }
    
    draw(){
        this.update();
        //actualiza el angulo
        this.rayo.setAngulo(this.anguloRotacion);
        this.rayo.x = this.x;
        this.rayo.y = this.y;
        this.rayo.draw();

        //Cuadro
        this.ctx.fillStyle = playerColor;
        this.ctx.fillRect(this.x-3, this.y-3, 6, 6);

        //Angulo
        var xDes = this.x + Math.cos(this.anguloRotacion) * 20;
        var yDes = this.y + Math.sin(this.anguloRotacion) * 20;

        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.lineTo(xDes, yDes);
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.stroke();
    }

}

function init(){
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.height = cHeight;
    canvas.width  = cWidth;

    escenario = new Level(canvas, ctx, lvl1);
    jugador = new Player(ctx, escenario, 100, 100);

    setInterval(function(){main();},1000/FPS);
}

function cleanCanvas(){
    canvas.height = canvas.height;
    canvas.width  = canvas.width;
}

function main(){
    //console.log("Hello wolrd");
    cleanCanvas();
    escenario.draw();
    jugador.draw();
}