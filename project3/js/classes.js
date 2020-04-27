class Board extends PIXI.Sprite 
{
    constructor(x=0,y=0,color="red") 
    {
        super(PIXI.Loader.shared.resources[`images/${color}board.png`].texture);
        this.anchor.set(0.5,0.5); // position, scaling, rotating etc are now from center of sprite
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = 0;
    }
}

class Tree extends PIXI.Sprite 
{
    constructor(x=0,y=0) 
    {
        super(PIXI.Loader.shared.resources["images/snowtree.png"].texture);
        this.anchor.set(0.5,0.5);
        this.x = x;
        this.startX = x;
        this.y = y;
        this.startY = y;
        this.isAlive = false;
        this._bounds.maxY = 20;
    }
}