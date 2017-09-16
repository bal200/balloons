

MyCircle = function(game, x,y) {
  /* Fake Sprite, so we have a physics body */
  Phaser.Sprite.call(this, game, x, y, 'fake');
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.drag = new Phaser.Point(2,2);

  /* Now the Graphics object, added as a child to our fake sprite */
  this.graphic = game.add.graphics(0,0);
  this.redrawGraphic( 100, 0xff0000/*red*/ );

  this.addChild(this.graphic);
  
  game.world.add(this);
};
MyCircle.prototype = Object.create(Phaser.Sprite.prototype);
MyCircle.prototype.constructor = MyCircle;

MyCircle.prototype.redrawGraphic = function (radius, colour){
  this.graphic.clear();
  this.graphic.beginFill(colour, 0.5 /*alpha*/);
  this.graphic.drawCircle(0, 0, radius);
  this.graphic.endFill();
}

MyCircle.prototype.addMomentum = function (momentum){
  var v = this.body.velocity;
  v.x += momentum.x;
  v.y += momentum.y;
}
MyCircle.prototype.stopAcceleration = function (){
  var v = this.body.velocity;
  v.x =0;
  v.y =0;
}


/********************************************************/
MyLink = function(obj1, obj2) {
  this.obj1 = obj1;
  this.obj2 = obj2;
  this.calcLength();
  //this.length = this.curLength + game.rnd.between(-5, +5);
  this.length=50;
  this.momentum = 0;
  this.pullVec1 = new Phaser.Point(0,0);
  this.pullVec2 = new Phaser.Point(0,0);
};

MyLink.prototype.update = function() {
  this.calcLength();
  this.calcPull();
  this.pullVec1 = this.calcDirectionVectors(this.obj1.body, this.obj2.body);
  this.pullVec2 = this.calcDirectionVectors(this.obj2.body, this.obj1.body);
  this.pullVec1.multiply(this.momentum, this.momentum);
  this.pullVec2.multiply(this.momentum, this.momentum);
  this.pullObjects();
};
MyLink.prototype.calcLength = function() {
  /* Calculate the length between the objects */
  p1 = new Phaser.Point(this.obj1.body.x, this.obj1.body.y);
  p2 = new Phaser.Point(this.obj2.body.x, this.obj2.body.y);
  this.curLength = p1.distance(p2);
};
MyLink.prototype.calcPull = function() {
  var dif = this.length - this.curLength;
  this.momentum = squared(dif) /2;
  if (this.momentum>800) this.momentum=800;
  if (this.momentum<-800) this.momentum=-800;
};

MyLink.prototype.calcDirectionVectors = function(p1, p2) {
  vec = new Phaser.Point(p2.x - p1.x,   p2.y - p1.y);
  vec.normalize();
  return vec;
};
MyLink.prototype.pullObjects = function() {
  this.obj1.addMomentum( this.pullVec2 );
  this.obj2.addMomentum( this.pullVec1 );
};

/*
calc link curLengths
work out pull momentum (acceleration)
calc direction vectors for each end
  add the momentum to these
Add these vectors to Objects velocity vectors

*/
/******************************************************** */
var data =[
  {x:100, y:100, r:50, c:0xc1c82d}, /*yellow*/
  {x:180, y:100, r:50, c:0x44a548}, /*green*/
  {x:180, y:100, r:50, c:0x386f48}, /*dark green*/
  {x:180, y:100, r:50, c:0x36333a} /*dark grey*/

];
/**********************************************************/
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'Bounce');
var myGame;

var playState = {
  preload: function() {
    myGame = this;
    /* if the full screen button is pressed, use this scale mode: */
    //game.scale.fullScreenScaleMode = Phaser.ScaleManager.RESIZE;
    /* use the whole window up: (turn off for desktop browser) */
    //game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    //game.time.advancedTiming = true;
    game.load.image("fake", "img/fake.png");
  },
    /**********  Create Function  ************************************************/
    /*****************************************************************************/
  create: function() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.gravity.y = 50;

    game.stage.backgroundColor = '#2d2d2d';
    
    this.circles=[];
    for (var n=0; n<10; n++) {
      this.circles[n] = new MyCircle(game, game.rnd.between(100, 800), game.rnd.between(100, 600));
    }
    this.links=[];
    for (n=0; n<9; n++) {
      this.links[n] = new MyLink( this.circles[n], this.circles[n+1] );
    }

  },

  update: function() {
    for (n=0; n<this.circles.length; n++) {
      this.circles[n].stopAcceleration();
    }
    
    for (n=0; n<this.links.length; n++) {
      this.links[n].update();
    }

    this.circles[0].x=50;
    this.circles[0].y=50;
    this.circles[9].x=700;
    this.circles[9].y=50;

  },

  render: function() {
  }
};


function newVector( power, angle ){
  var vec = new Phaser.Point(0,-1 * power);
  vec = vec.rotate(0,0, angle, true);
  return vec;
}
/* convert an angle (degrees) into a vector.  Assumes 0 degrees is pointing up */
function angleToVector( angle ) {
  var vec = new Phaser.Point(0,-1);
  vec = vec.rotate(0,0, angle, true);
  return vec;
}
/* convert a Vector to an Angle (degrees). the vector doesnt have to be normalised */
function vectorToAngle( x,y ) {
  ang = (Phaser.Math.radToDeg(
            Phaser.Math.angleBetween(0,0, x,y /*vec.x, vec.y*/) )) + 90;
  if (ang<0) ang+=360;
  return ang;
}

/**************** Add the States and start ************************************/
game.state.add('play', playState);

game.device.whenReady(function() {
  game.state.start('play');
});


/****** OO ******/
if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() {
        }
        F.prototype = o;
        return new F();
    };
}
function inheritPrototype(childObject, parentObject) {
    var copyOfParent = Object.create(parentObject.prototype);
    copyOfParent.constructor = childObject;
    childObject.prototype = copyOfParent;
}

function squared( n ) {
  return (n>=0) ? n*n : -(n*n);
}