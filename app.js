

MyCircle = function(game, x,y, size) {
  /* Fake Sprite, so we have a physics body */
  Phaser.Sprite.call(this, game, x, y, 'fake');
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.drag = new Phaser.Point(2,2);

  /* Now the Graphics object, added as a child to our fake sprite */
  this.size=size;
  this.lastSize=size;
  this.colour = 0xff0000/*red*/ ;
  this.graphic = game.add.graphics(0,0);
  this.redrawGraphic( this.size, this.colour);

  this.addChild(this.graphic);
  
  game.world.add(this);
};
MyCircle.prototype = Object.create(Phaser.Sprite.prototype);
MyCircle.prototype.constructor = MyCircle;

MyCircle.prototype.makeLinks = function(objects, links) {
  var p = new Phaser.Point(this.body.x, this.body.y);
  for (var n=0; n<objects.length; n++) {
    var dist = p.distance( objects[n].body );
    if ((dist < 150) && ( !doesLinkExist(links, this, objects[n]) )) {
      links.push(new MyLink(this, objects[n]));
    }

  }
};

MyCircle.prototype.redrawGraphic = function (radius, colour){
  this.graphic.clear();
  this.graphic.beginFill(colour, 0.5 /*alpha*/);
  this.graphic.drawCircle(0, 0, radius);
  this.graphic.endFill();
};
MyCircle.prototype.checkSizeChange = function() {
  if (this.size != this.lastSize) {
    this.redrawGraphic(this.size, this.colour);
    this.lastSize = this.size;
  }
};

MyCircle.prototype.addMomentum = function (momentum){
  var v = this.body.velocity;
  v.x += momentum.x;
  v.y += momentum.y;
};
MyCircle.prototype.stopAcceleration = function (){
  var v = this.body.velocity;
  v.x =0;
  v.y =0;
};
MyCircle.prototype.blowUp = function ( links ){
  for (var n=0; n<links.length; n++) {
    if (links[n].obj1 == this || links[n].obj2 == this){
      game.add.tween(links[n]).to({length:links[n].length+20}, /*duration*/3000,
        Phaser.Easing.Quadratic.InOut , /*autostart*/true, /*delay*/0, /*repeat*/0, /*yoyo*/false);
        //.onComplete.add(cloudLoop, this);
    }
  }
  game.add.tween(this).to({size:this.size+20}, /*duration*/3000,
    Phaser.Easing.Quadratic.InOut , /*autostart*/true, /*delay*/0, /*repeat*/0, /*yoyo*/false);

}


/********************************************************/
MyLink = function(obj1, obj2) {
  this.obj1 = obj1;
  this.obj2 = obj2;
  this.calcLength();
  //this.length = this.curLength + game.rnd.between(-5, +5);
  this.length=80;
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
  this.momentum = squared(dif) /3;
  if (this.momentum>400) this.momentum=400;
  if (this.momentum<-400) this.momentum=-400;
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

function doesLinkExist(list, obj1, obj2) {
  for (var n=0; n<list.length; n++) {
    if ((list[n].obj1 == obj1) && (list[n].obj2 == obj2)) {
      return true;
    } 
    else if ((list[n].obj1 == obj2) && (list[n].obj2 == obj1)) {
      return true;
    }
  }
  return false;
}

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
    game.physics.arcade.gravity.y = 10;

    game.stage.backgroundColor = '#2d2d2d';
    
    this.circles=[];
    this.links=[];
    for (var n=0; n<25; n++) {
      this.circles[n] = new MyCircle(game, game.rnd.between(100, 800), 
                                           game.rnd.between(100, 400), 100);
    }

    for (n=0; n<this.circles.length; n++) {
      this.circles[n].makeLinks(this.circles, this.links);
    
    }
console.log("links: "+this.links.length);

  },

  update: function() {
    for (n=0; n<this.circles.length; n++) {
      this.circles[n].checkSizeChange();
      this.circles[n].stopAcceleration();
    }
    
    for (n=0; n<this.links.length; n++) {
      this.links[n].update();
    }

//    this.circles[0].x=50;
//    this.circles[0].y=50;
//    this.circles[9].x=700;
//    this.circles[9].y=50;
    if (game.rnd.between(0, 80) == 1){
      var which = game.rnd.between(0, this.circles.length-1);
      console.log("blowUp "+which);
      this.circles[ which ].blowUp(this.links);
    }


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