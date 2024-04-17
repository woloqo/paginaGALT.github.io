var canvas;
var ctx;
var FPS = 30;

//Dimension del canvas en pixeles
var cWidth  = 500;
var cHeight = 500;

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
    switch(tecla.keyCode){
        case 38:
            jugador.up();
            break;
        case 40:
            jugador.down();
            break;
        case 39:
            jugador.right();
            break;
        case 37:
            jugador.left();
            break;
    }
});
document.addEventListener('keyup', function(tecla){

    switch(tecla.keyCode){
        case 38:
            jugador.stopMoving();
            break;
        case 40:
            jugador.stopMoving();
            break;
        case 39:
            jugador.stopRotating();
            break;
        case 37:
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


//Clase escenario
class Level{

    constructor(can, con, arr){
        this.canvas = can;
        this.matriz = arr;
        this.ctx = con;
        
        //Dimensiones matriz
        this.heightM = this.matriz.length;
        this.widthM  = this.matriz[0].length;

        //Dimensiones del canvas
        this.heightC = this.canvas.height;
        this.widthC  = this.canvas.width;

        //Dimensiones de los tiles
        this.heightT = parseInt(this.heightC / this.heightM);
        this.widthT  = parseInt(this.widthC  / this.widthM);

        // console.log(this.matriz);
        // console.log(this.heightM);
        // console.log(this.heightC);
        // console.log(this.heightT);
    }

    collision(x, y){
        var collide = false;
        if(this.matriz[y][x] != 0) collide = true;
        return collide;
    }

    draw(){
        var color;
        for(var i=0; i<this.heightM; i++){
            for(var j=0; j<this.widthM;j++){
                if(this.matriz[i][j] == 1) color = wallColor;
                else color = floorColor;

                this.ctx.fillStyle = color;
                this.ctx.fillRect(j*this.widthT, i*this.heightT, this.widthT, this.heightT);
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

        this.rotate   = 0; // -1 = izq  ~ 1 = der
        this.move     = 0; // 0 = parao ~ 1 = aelante ~ -1 atra

        this.rotatingAngle = 0;
        this.movementVel   = 3;                   //En pixeles;
        this.rotateVel     = 3 * (Math.PI / 180); //Grados

    }

    up(){
        //console.log("arriba");
        this.move = 1;
    }

    down(){
        //console.log("abajo");
        this.move = -1;
    }

    left(){
        //console.log("izq");
        this.rotate = -1;
    }

    right(){
        //console.log("der");
        this.rotate = 1;
    }

    stopMoving(){
        this.move = 0;
    }

    stopRotating(){
        this.rotate = 0;
    }

    collision(x, y){
        var collide = false;

        var casillaY = parseInt(y/this.escenario.heightT);
        var casillaX = parseInt(x/this.escenario.widthT);

        if(this.escenario.collision(casillaX,casillaY)) collide = true;
        return collide;
    }

    update(){
        var newX = this.x + this.move * Math.cos(this.rotatingAngle) * this.movementVel;
        var newY = this.y + this.move * Math.sin(this.rotatingAngle) * this.movementVel;

        if(!this.collision(newX, newY)){
            this.x = newX;
            this.y = newY;
        }

        this.rotatingAngle += this.rotate * this.rotateVel;
        this.rotatingAngle = normalize(this.rotatingAngle);
        //console.log(this.rotatingAngle);
    }

    draw(){
        this.update();

        //Cuadro
        this.ctx.fillStyle = playerColor;
        this.ctx.fillRect(this.x-3, this.y-3, 6, 6);

        //Angulo
        var xDes = this.x + Math.cos(this.rotatingAngle) * 20;
        var yDes = this.y + Math.sin(this.rotatingAngle) * 20;

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