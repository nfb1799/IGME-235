"use strict";
const app = new PIXI.Application(800,600);
app.renderer.backgroundColor = 0xB9F2FF;
document.body.appendChild(app.view);

const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

PIXI.Loader.shared
    .add(["images/redboard.png","images/blueboard.png",
            "images/greenboard.png","images/purpleboard.png",
            "images/yellowboard.png","images/whiteboard.png",
            "images/snowtree.png","images/coin.png",
            "images/mountain.png"])
    .load(setup);


let stage;
let startScene, gameScene, gameOverScene;
let boardLabel, scoreLabel, lifeLabel, levelLabel;
let activeBoard = "red";
let board;
let score = 0;
let life = 100;
let level = 1;
let trees = [];
let tSpawned = false;
let treeIndex = 0;
let coins = [];
let deer = [];
let keys = {
    up: false,
    down: false,
    left: false,
    right: false
};
let totalTime = 1;
let paused = true;

function setup()
{
    stage = app.stage;

    // Create the start scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);

    // Create the game scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    // Create the game over screen and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    // Create labels for all scenes
    createLabelsAndButtons();

    // Set up keyboard controls
    window.onkeydown = function(e) {
        let kc = e.keyCode;

        if (kc === 37) 
            keys.left = true;  
        else if (kc === 38) 
            keys.up = true;    
        else if (kc === 39) 
            keys.right = true;
        else if (kc === 40) 
            keys.down = true;
    }
    window.onkeyup = function(e) {
        let kc = e.keyCode;
        
        if (kc === 37) 
            keys.left = false;  
        else if (kc === 38) 
            keys.up = false;    
        else if (kc === 39) 
            keys.right = false;
        else if (kc === 40) 
            keys.down = false;
    }

    // Add the game loop to the ticker (called every frame)
    app.ticker.add(gameLoop);
}

function createLabelsAndButtons() 
{
    // Initialize a blanket style for title labels
    let titleStyle = new PIXI.TextStyle(
        {
            fill: 0xE0FFFF,
            fontFamily: "Comic Sans MS",
            fontSize: 96,
            stroke: 0x291310,
            strokeThickness: 10,
            dropShadow: true,
            dropShadowColor: 0x95CED6,
            dropShadowDistance: 5
        }
    );

    // Initialize a blanket style for subtext labels
    let subtextStyle = new PIXI.TextStyle(
        {
            fill: 0x000000,
            fontFamily: "Comic Sans MS"
        }
    );

    // Initialize a blanket style for different buttons
    let buttonStyle = new PIXI.TextStyle(
        {
            fill: 0xE0FFFF,
            fontFamily: "Comic Sans MS",
            fontSize: 32,
            stroke: 0x291310,
            strokeThickness: 4,
            dropShadow: true,
            dropShadowColor: 0x95CED6,
            dropShadowDistance: 2
        }
    );

    // Initialize a blanket style for different labels
    let textStyle = new PIXI.TextStyle(
        {
            fill: 0x291310,
            fontFamily: "Comic Sans MS",
            fontSize: 18
        }
    );

    // Create the background and add it to the start screen
    let background = new PIXI.Sprite(PIXI.Loader.shared.resources["images/mountain.png"].texture);
    background.anchor.set(0.5,0.5);
    background.scale.set(1.2);
    background.x = sceneWidth/2 + 50;
    background.y = sceneHeight - 100;
    startScene.addChild(background);

    // Create the title text and add it to the start scene
    let title = new PIXI.Text("Alpine Survival!");
    title.style = titleStyle;
    title.anchor.set(0.5,0.5);
    title.x = sceneWidth/2;
    title.y = 100;
    startScene.addChild(title);

    // Create the "Select a board" label
    boardLabel = new PIXI.Text(`Select a board: ${activeBoard}`);
    boardLabel.style = subtextStyle;
    boardLabel.anchor.set(0.5,0.5);
    boardLabel.x = sceneWidth/2;
    boardLabel.y = 200;
    startScene.addChild(boardLabel);

    // Create the boards and add them to the start scene
    // 110 px between each board, 125 px margins
    let boards = [
        new Board(125, 330, "red"),
        new Board(235, 330, "yellow"),
        new Board(345, 330, "green"),
        new Board(455, 330, "blue"),
        new Board(565, 330, "purple"),
        new Board(675, 330, "white")
    ];
    for(let board of boards) {
        board.interactive = true;
        board.buttonMode = true;
        board.on("pointerup", selectBoard);
        board.on("pointedown", e=>e.target.alpha = 0.7);
        board.on("pointerover", e=>e.target.scale.set(1.2));
        board.on("pointerout", e=>e.currentTarget.scale.set(1.0));
        startScene.addChild(board);
    }
    
    // Create the hook and add it to the start scene
    let hook = new PIXI.Text("Reach the bottom in one piece!");
    hook.style = subtextStyle;
    hook.anchor.set(0.5,0.5);
    hook.x = sceneWidth/2;
    hook.y = sceneHeight - 130;
    startScene.addChild(hook);

    // Create the start button and add it to the start scene
    let startButton = new PIXI.Text("Drop In!");
    startButton.style = buttonStyle;
    startButton.anchor.set(0.5,0.5);
    startButton.x = sceneWidth/2;
    startButton.y = sceneHeight - 70;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame);
    startButton.on("pointerover", e=>e.target.alpha = 0.7);
    startButton.on("pointerout", e=>e.currentTarget.alpha = 1.0);
    startScene.addChild(startButton);

    // Create the score label and add it to the game scene
    scoreLabel = new PIXI.Text(`Score: ${score}`);
    scoreLabel.style = textStyle;
    scoreLabel.x = 10;
    scoreLabel.y = 10;
    gameScene.addChild(scoreLabel);

    // Create the life label and add it to the game scene
    lifeLabel = new PIXI.Text(`Life: ${life}`);
    lifeLabel.style = textStyle;
    lifeLabel.x = 10;
    lifeLabel.y = 40;
    gameScene.addChild(lifeLabel);

    // Create the level label and add it to the game scene
    levelLabel = new PIXI.Text(`Level: ${level}`);
    levelLabel.style = textStyle;
    levelLabel.anchor.set(1,0);
    levelLabel.x = sceneWidth - 30;
    levelLabel.y = 10;
    gameScene.addChild(levelLabel);

    // Create the mounain and add it to the game scene
    let mountain = new PIXI.Graphics();
    mountain.beginFill(0xFFFFFF, 0.9);
    mountain.drawPolygon(new PIXI.Point(150,0), new PIXI.Point(0,600), new PIXI.Point(800,600), new PIXI.Point(650,0));
    mountain.endFill();
    gameScene.addChild(mountain);

    // Create the board and add it to the game scene
    board = new Board(sceneWidth/2, 30, activeBoard);
    board.scale.set(0.4);
    gameScene.addChild(board);

    // Create the game over label and add it to the game over scene
    let gameOverLabel = new PIXI.Text("Game Over!");
    gameOverLabel.style = titleStyle;
    gameOverLabel.anchor.set(0.5,0.5);
    gameOverLabel.x = sceneWidth/2;
    gameOverLabel.y = 100;
    gameOverScene.addChild(gameOverLabel);

    // Create the final score label and add it to the game over scene
    let finalScoreLabel = new PIXI.Text();
    finalScoreLabel.style = subtextStyle;
    finalScoreLabel.anchor.set(0.5,0.5);
    finalScoreLabel.x = 210;
    finalScoreLabel.y = 200;
    gameOverScene.addChild(finalScoreLabel);

    // Create play again button and add it to the game over scene
    let playAgainButton = new PIXI.Text("Play Again?");
    playAgainButton.style = buttonStyle;
    playAgainButton.anchor.set(0.5,0.5);
    playAgainButton.x = sceneWidth/2;
    playAgainButton.y = sceneHeight - 100;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup",startGame);
    playAgainButton.on('pointerover',e=>e.target.alpha = 0.7);
    playAgainButton.on('pointerout',e=>e.currentTarget.alpha = 1.0); 
    gameOverScene.addChild(playAgainButton);

    
}

function gameLoop() 
{
    if(paused) return;

    // Calculate delta time
    let dt = 1/app.ticker.FPS;
    if (dt > 1/12)
        dt = 1/12;

    totalTime += dt;
    
    // Allows the user to move using arrow keys
    moveBoard();

    // Spawn 1 tree every 5 seconds
    if(Math.floor(totalTime) % 5 == 0 && !tSpawned) {
        spawnTree();
        tSpawned = true; // Restricts spawnTree() to 1 call per second
    }

    // Toggles the spawner on before the next tree should spawn
    if(tSpawned && Math.floor(totalTime) % 5 != 0 && Math.floor(totalTime) % 2 == 0) 
        tSpawned = false;
    
    // Trees move up the screen
    // Simulates board moving down the mountain
    moveTree(dt);

    checkCollisions();
}

function selectBoard()
{
    // Remove the current board from the game scene
    gameScene.removeChild(board);
    activeBoard = this.color;
    boardLabel.text = `Select a board: ${activeBoard}`;

    // Create a new board and add it back to the game scene
    board = new Board(sceneWidth/2, 30, activeBoard);
    board.scale.set(0.4);
    gameScene.addChild(board);
}

function startGame()
{
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    level = 1;
    score = 0;
    life = 100;
    increaseScoreBy(0);
    decreaseLifeBy(0);
    loadLevel();
}

function increaseScoreBy(value) 
{
    score += value;
    scoreLabel.text = `Score: ${score}`;
}

function decreaseLifeBy(value) 
{
    life -= value;
    lifeLabel.text = `Life: ${life}`;
}

function incrementLevel() 
{
    level++;
    levelLabel.text = `Level: ${level}`;
}

function loadLevel() {
    createTrees();
    paused = false;
}

function moveBoard() 
{
    if(keys.left) {
        let newX = board.x - 2;
        let w2 = board.width/2;
        let minX = (board.y - 600)/(-4); // equation of boarder line: y = -4x + 600
        let maxX = (board.y + 2600)/4; // equation of boarder line: y = 4x - 2600
        board.x = clamp(newX, minX + w2, maxX - w2); // clamps the board within the bounds
        board.angle = 14;
    }
    if(keys.right) {
        let newX = board.x + 2;
        let w2 = board.width/2;
        let minX = (board.y - 600)/(-4);
        let maxX = (board.y + 2600)/4;
        board.x = clamp(newX, minX + w2, maxX - w2);
        board.angle = -14;
    }
    if(keys.up) {
        let newY = board.y - 2;
        let h2 = board.height/2;
        board.y = clamp(newY, 0 + h2, sceneHeight - h2);
    }
    if(keys.down) {
        let newY = board.y + 2;
        let h2 = board.height/2;
        board.y = clamp(newY, 0 + h2, sceneHeight - h2);
    }
    if(!keys.left && !keys.right) 
        board.angle = 0;
}

// Creates the trees to be placed in the level
// Does not place it in the scene
function createTrees() 
{
    for(let i = 0; i < 6 * level; i++) {
        trees.push(new Tree(Math.random() * sceneWidth, 600));
    }
}

function spawnTree() 
{
    let maxIndex = trees.length - 1;

    if(!trees[treeIndex].isAlive) {
        gameScene.addChild(trees[treeIndex]);
        trees[treeIndex].isAlive = true;
        if(treeIndex < maxIndex)
            treeIndex++;
    }
}

function moveTree(dt) 
{
    let slope;
    for(let tree of trees) {
        if(tree.isAlive) {
            if(tree.startX <= sceneWidth/2) // first half of the screen
                slope = -4;
            else // second half of the screen
                slope = 4;

            let finalX = (tree.y - slope * tree.x) / (slope * -1);
            let newX = lerp(tree.x, finalX, dt);
            let newY = lerp(tree.y, 0, dt);
            tree.x = newX;
            tree.y = newY;
        }
        if(tree.y < 20)
            gameScene.removeChild(tree);
    }
}

function checkCollisions() 
{
    // Check collisions between trees and board
    for(let t of trees) {
        if(t.isAlive && rectsIntersect(t,board)) {
            gameScene.removeChild(t);
            t.isAlive = false;
            decreaseLifeBy(10);
        }
    } 
}