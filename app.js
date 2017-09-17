

MyCircle = function(game, x,y, size, colour, alpha) {
  /* Fake Sprite, so we have a physics body */
  Phaser.Sprite.call(this, game, x, y, 'fake');
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.drag = new Phaser.Point(2,2);

  /* Now the Graphics object, added as a child to our fake sprite */
  this.size=size;
  this.lastSize=size;
  this.colour = colour; //0xff0000/*red*/ ;
  this.alpha = (alpha ? alpha : 0.85);
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
    if ((dist < 140) && ( !doesLinkExist(links, this, objects[n]) )) {
      links.push( new MyLink(this, objects[n], 
           (this.size + objects[n].size)*0.5 )); 
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
  if (this.momentum>100) this.momentum=100;
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
/******************************************************** */
var data =[
  {x:200, y:200, r:150, c:0x36333a}, /*dark grey*/
  {x:250, y:110, r:50, c:0x386f48},  /*dark green*/
  {x:298, y:180, r:100, c:0x386f48},
  {x:230, y:270, r:200, c:0x386f48},
  {x:150, y:280, r:80, c:0x386f48},
  {x:110, y:240, r:75, c:0x386f48},
  {x:90, y:150, r:200, c:0x386f48},
  {x:150, y:100, r:50, c:0x386f48},
  {x:200, y:200, r:170, c:0x386f48},
  {x:200, y:200, r:50, c:0x386f48},
  {x:250, y:80, r:70, c:0x44a548}, /*green*/  
  {x:296, y:80, r:70, c:0x44a548},

  {x:250, y:110, r:50, c:0xc1c82d}, /*yellow*/
  {x:180, y:100, r:50, c:0x386f48}, /*dark green*/
];
var linkData =[
  {o1:1, o2:2, d:50},
  {o1:1, o2:2, d:50},
  {o1:1, o2:2, d:50}
];
/**********************************************************/
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'Balloons');
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
    //game.physics.arcade.gravity.y = 10;

    game.stage.backgroundColor = '#C0C0C0'; //#2d2d2d';
    this.circles=[];
    this.links=[];

    /* Outer Circles */
    for (var n=22, a=1; n<=30; n++,a++) {
      var p = newVector( game.rnd.between(210, 240), 360/9*a );
      this.circles[n] = new MyCircle(game, 400+p.x,300+p.y,
                        game.rnd.between(20,90)/*size*/,0x00a7a7); // 0xc1c82d/*yellow*/);
      //this.links.push(new MyLink());
    }

    /* 2nd layer Circles */
    for (var n=9, a=1; n<=21; n++,a++) {
      var p = newVector( game.rnd.between(160, 190), 360/13*a );
      this.circles[n] = new MyCircle(game, 400+p.x,300+p.y,
                        game.rnd.between(30,120)/*size*/,0x0462ac); // 0x44a548/*green*/);
      //this.links.push(new MyLink());
    }

    /* Inner Circles */
    for (var n=1, a=1; n<=8; n++, a++) {
      var p = newVector( game.rnd.between(90, 130), 360/8*a );
      this.circles[n] = new MyCircle(game, 400+p.x, 300+p.y,
                        game.rnd.between(50,130)/*size*/, 0x471c72); //0x386f48/*dark green*/);
      //this.links.push(new MyLink());
    }

    /* Grey Middle Circle */
    this.circles[0] = new MyCircle(game, 400,300, 150, 0x46434a/*dark grey*/, 0.99/*alpha*/);

    /* Now the circles are in place, create the elastic links */
    for (n=0; n<this.circles.length; n++) {
      this.circles[n].makeLinks(this.circles, this.links);
    }

    /* now weve set all their positions up, put them all in the centre, so the explode out */
//    for (n=0; n<this.circles.length; n++) {
//      this.circles[n].x=400+game.rnd.realInRange(-8,8);
//      this.circles[n].y=300+game.rnd.realInRange(-8,8);
//    }
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
    this.circles[0].x=400;
    this.circles[0].y=300;

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