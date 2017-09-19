

MyCircle = function(game, x,y, size, colour, alpha) {
  /* Fake Sprite, so we have a physics body */
  Phaser.Sprite.call(this, game, x, y, 'fake');
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.drag = new Phaser.Point(2,2);

  /* Now the Graphics object, added as a child to our fake sprite */
  this.size=size;
  this.lastSize=size;
  this.colour = colour; //0xff0000/*red*/ ;
  this.alpha = (alpha ? alpha : 0.89);
  this.graphic = game.add.graphics(0,0);
  this.redrawGraphic( this.size, this.colour);

  this.addChild(this.graphic);
  
  game.world.add(this);
};
MyCircle.prototype = Object.create(Phaser.Sprite.prototype);
MyCircle.prototype.constructor = MyCircle;

MyCircle.prototype.makeLinks = function(objects, links) {
  var p = new Phaser.Point(this.body.x, this.body.y);
  var created=0;
  for (var n=0; n<objects.length && created<4; n++) {
    var dist = p.distance( objects[n].body );
    if ((dist < 69 /*140*/) && ( !doesLinkExist(links, this, objects[n]) )) {
      links.push( new MyLink(this, objects[n], 
           (this.size + objects[n].size)*0.44 )); 
           //dist*0.9));
      created++;
    }
  }
};

MyCircle.prototype.redrawGraphic = function (radius, colour){
  this.graphic.clear();
  this.graphic.beginFill(colour, this.alpha);
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

MyCircle.prototype.inflate = function ( links ){
  for (var n=0; n<links.length; n++) {
    if (links[n].obj1 == this || links[n].obj2 == this){
      game.add.tween(links[n]).to({length:links[n].length+20}, /*duration*/3000,
        Phaser.Easing.Quadratic.InOut , /*autostart*/true, /*delay*/0, /*repeat*/0, /*yoyo*/false);
    }
  }
  game.add.tween(this).to({size:this.size+20}, /*duration*/3000,
    Phaser.Easing.Quadratic.InOut , /*autostart*/true, /*delay*/0, /*repeat*/0, /*yoyo*/false);
    //.onComplete.add(cloudLoop, this);
}
MyCircle.prototype.pop = function( links ) {

}

/********************************************************/
MyLink = function(obj1, obj2, length) {
  this.obj1 = obj1;
  this.obj2 = obj2;
  this.calcLength();
  //this.length = this.curLength + game.rnd.between(-5, +5);
  this.length = (length ? length : 80);
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
  if (this.momentum>100) this.momentum=100; /* Stop the blighters moving too quick */
  if (this.momentum<-100) this.momentum=-100;
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

/**********************************************************/
/**********************************************************/
var game = new Phaser.Game(600, 400, Phaser.CANVAS, 'balloons');
var myGame;

var playState = {
  preload: function() {
    myGame = this;
    /* use the whole window up: (turn off for desktop browser) */
    //game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    game.load.image("fake", "img/fake.png");
  },
    /**********  Create Function  ************************************************/
    /*****************************************************************************/
  create: function() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    //game.physics.arcade.gravity.y = 10;

    game.stage.backgroundColor = '#C0C0C0'; //#2d2d2d';
    this.circles=[];
    this.links=[];
    mid = new Phaser.Point(game.width/2, game.height/2);

    /* Outer Circles Two */
    for (var a=1; a<360; a+=30) {
      if ((a>=45 && a<=135) || (a>=225 && a<=315)) {
        var p = newVector( game.rnd.between(180, 181), a );
        this.circles.push( new MyCircle(game, mid.x+p.x, mid.y+p.y,
                          game.rnd.between(25,60)/*size*/,0x00a7a7) ); 
      }
    }
    /* Outer Circles */
    for (var a=1; a<360; a+=30) {
      if ((a>=22 && a<=157) || (a>=202 && a<=337)) {
        var p = newVector( game.rnd.between(160, 161), a );
        this.circles.push( new MyCircle(game, mid.x+p.x, mid.y+p.y,
                          game.rnd.between(30,90)/*size*/,0x00a7a7) ); 
      }
    }

    /* 2nd layer Circles */
    for (var a=1; a<360; a+=38) {
        var p = newVector( game.rnd.between(110, 111), a );
        this.circles.push( new MyCircle(game, mid.x+p.x, mid.y+p.y,
                          game.rnd.between(40,100)/*size*/,0x0462ac) );
    }

    /* Inner Circles */
    for (var n=1, a=1; n<=7; n++, a++) {     
      var p = newVector( game.rnd.between(70, 71), 360/7*a );
      this.circles.push( new MyCircle(game, mid.x+p.x, mid.y+p.y,
                        game.rnd.between(50,110)/*size*/, 0x203e95) );
    }

    /* Grey Middle Circle */
    var midCirc =  new MyCircle(game, mid.x,mid.y, 140, 0x36334a/*dark grey*/, 0.99/*alpha*/);
    this.circles.push ( midCirc );
    
    var style = { font: "12px Arial", fill: "#aaa", boundsAlignH: "center", boundsAlignV: "middle" };
    this.text = game.add.text(0, 0, "Andy Ballard", style);
    //text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    this.text.setTextBounds(-150, -20, 300, 50);
    midCirc.addChild( this.text ); /* attach it to our main Circle */

    /* Now the circles are in place, create the elastic links */
    for (n=0; n<this.circles.length; n++) {
      this.circles[n].makeLinks(this.circles, this.links);
    }

    console.log("circles: "+this.circles.length);
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
    /* Fix the middle balloon in place */
    this.circles[0].x=mid.x;
    this.circles[0].y=mid.y;

    if (game.rnd.between(0, 500) == 1){
      var which = game.rnd.between(0, this.circles.length-1);
      console.log("inflating "+which);
      this.circles[ which ].inflate(this.links);
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