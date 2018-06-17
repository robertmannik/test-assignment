/**
 * Paylines.
 * @type {*[]}
 */
let paylines = [
    [1, 1, 1, 1, 1], [1, 1, 2, 3, 3], [1, 2, 3, 2, 1], [1, 2, 1, 2, 1],
    [2, 2, 2, 2, 2], [2, 1, 1, 1, 2], [2, 3, 3, 3, 2], [2, 3, 2, 3, 2],
    [3, 3, 3, 3, 3], [3, 3, 2, 1, 1], [3, 2, 1, 2, 3], [3, 2, 3, 2, 3],
];

/**
 * JSON containing the tile images data along with their respective paytables, which will be used
 * when the game actually has functioning win conditions.
 * @type {{images: *[]}}
 */
let tileData = {
    images: [
        {
            filename: "assets/images/symbol1.png",
            paytable: [0, 0, 4, 15, 50],
            texture: null
        },
        {
            filename: "assets/images/symbol2.png",
            paytable: [0, 0, 5, 20, 60],
            texture: null
        },
        {
            filename: "assets/images/symbol3.png",
            paytable: [0, 0, 10, 30, 80],
            texture: null
        },
        {
            filename: "assets/images/symbol4.png",
            paytable: [0, 0, 15, 50, 100],
            texture: null
        },
        {
            filename: "assets/images/symbol5.png",
            paytable: [0, 0, 20, 75, 150],
            texture: null
        },
        {
            filename: "assets/images/symbol6.png",
            paytable: [0, 3, 25, 100, 200],
            texture: null
        },
        {
            filename: "assets/images/symbol7.png",
            paytable: [0, 3, 30, 150, 300],
            texture: null
        },
        {
            filename: "assets/images/symbol8.png",
            paytable: [0, 4, 40, 200, 400],
            texture: null
        },
        {
            filename: "assets/images/symbol9.png",
            paytable: [0, 5, 50, 250, 500],
            texture: null
        },
        {
            filename: "assets/images/symbol10.png",
            paytable: [0, 6, 60, 300, 600],
            texture: null
        }
    ]
};

/**
 * JSON containing all other asset images that are not intended for tiles.
 * @type {{images: *[]}}
 */
let imageFiles = {
    images: [
        {
            filename: "assets/images/autoplay-normal.png"
        },
        {
            filename: "assets/images/back-normal.png"
        },
        {
            filename: "assets/images/game-background.jpg"
        },
        {
            filename: "assets/images/game-logo.png"
        },
        {
            filename: "assets/images/info-normal.png"
        },
        {
            filename: "assets/images/minus-normal.png"
        },
        {
            filename: "assets/images/quickspin-normal.png"
        },
        {
            filename: "assets/images/sound-normal.png"
        },
        {
            filename: "assets/images/spin-normal.png"
        },
        {
            filename: "assets/images/plus-normal.png"
        }
    ]
};

class Tile extends PIXI.Container {

    /**
     * Tile object constructor.
     * @param width - width of the tile.
     * @param height - height of the tile.
     */
    constructor(width, height) {
        super();

        this.width = width;
        this.height = height;

        //Add a border for the Tile.
        this.border = new PIXI.Graphics();
        this.border.lineStyle(2, 0xaa0000);
        this.border.beginFill(0xaa0000, 0.2);
        this.border.drawRect(0, 0, width, height);
        this.addChild(this.border);

        //Add and adjust the sprites of the Tile object.
        this.sprite = new PIXI.Sprite();
        this.sprite.scale.set(0.4, 0.4);
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.position.set(width * 0.5, height * 0.5);
        this.addChild(this.sprite);
        this.randomize();
    }

    /**
     * Method for randomizing tiles.
     */
    randomize() {
        //Gets a random Tile ID based on amount of possible tiles.
        this.id = Math.floor(Math.random() * tileData.images.length);

        //Verifies the texture.
        if (tileData.images[this.id].texture === null) {
            tileData.images[this.id].texture = PIXI.Texture.fromImage(tileData.images[this.id].filename);
        }

        //Add the texture to the tile.
        this.sprite.texture = tileData.images[this.id].texture;
    }
}

class Reel extends PIXI.Container {

    /**
     * Constructor for the Reel object.
     * @param width - width of the reel.
     * @param height - height of the reel.
     * @param id - ID of the reel.
     */
    constructor(width, height, id) {
        super();

        this.reelMaxSpeed = 80;
        this.inTime = 30;
        this.outTime = 30;
        this.visibleTiles = 3;
        this.totalTiles = 5;

        this.realWidth = width;
        this.realHeight = height;
        this.tileHeight = height / this.visibleTiles;
        this.id = id;

        //Adds the RectMask
        let rectMask = new PIXI.Graphics();
        rectMask.beginFill(0);
        rectMask.drawRect(0, 0, width, height);
        rectMask.endFill();
        this.addChild(rectMask);

        this.container = new PIXI.Container();
        this.container.mask = rectMask;
        this.addChild(this.container);
        this.tiles = [];
        //Adds the tiles to the reel.
        for (let i = 0; i < this.totalTiles; i++) {
            let tile = new Tile(width, this.tileHeight);
            tile.position.set(0, this.tileHeight * i - this.tileHeight);
            this.container.addChild(tile);
            this.tiles.push(tile);
        }

        //Adds the BlurYFilter.
        this.blurFilter = new PIXI.filters.BlurYFilter();
    }

    /**
     *
     */
    spin() {
        this.time = 0;
        this.spinning = true;

        //Applies the blur filter.
        this.blurFilter.strength = 0;
        this.filters = [this.blurFilter];
    }

    stop() {
        this.finalOffset = 1;
        this.finalPosition = this.realHeight - this.tileHeight - this.container.children[0].y;
        this.stopping = true;
        this.timeStop = this.time;
    }

    update(delta) {
        if (!this.spinning) { return; }

        this.time += delta;

        //Updates the positioning of the tiles.
        let speed = this.getSpeed(delta);
        for (let tile of this.tiles) {
            tile.y += speed;
        }

        this.blurFilter.strength = speed * 0.3;

        let limitY = this.realHeight + this.tileHeight;
        for (let i = this.tiles.length - 1; i >= 0; i--) {
            if (this.container.y + this.tiles[i].y > limitY) {
                this.tiles[i].y = this.container.children[0].y - this.tileHeight;
                this.container.addChildAt(this.tiles[i], 0);
                this.tiles[i].randomize();
            }
        }
    }

    getSpeed(delta) {
        let speed = delta * this.reelMaxSpeed;

        if (this.stopping) {
            let n  = 1 - (this.time - this.timeStop) / this.outTime;
            let r = this.easeInBack(n);
            speed = (this.finalOffset - r) * this.finalPosition;
            this.finalOffset = r;
            if (n <= 0) { this.onComplete(); }
        } else if (this.time < this.inTime) {
            let n = this.time / this.inTime;
            speed *= this.easeInBack(n);
        }

        return speed;
    }

    onComplete() {
        this.stopping = false;
        this.spinning = false;
        this.reorderTiles();
        this.emit("spincomplete", {target: this, id: this.id});

        //Removes the blur.
        this.filters = null;
    }

    reorderTiles() {
        this.tiles.sort(this.compareTiles.bind(this));
    }

    compareTiles(a, b) {
        return this.container.getChildIndex(a) > this.container.getChildIndex(b);
    }

    easeInBack(n){
        let s = 1.70158;
        return n * n * (( s + 1 ) * n - s);
    }
}

class SlotMachine extends PIXI.Container {

    constructor(width, height, numberOfReels, gameScene) {
        super();
        this.gameScene = gameScene;
        this.reels = [];
        // draws a border
        let border = new PIXI.Graphics();
        border.lineStyle(10, 0xffffff, 1);

        // adds reels
        let slicedWidth = width / numberOfReels;

        for (let i = 0; i < numberOfReels; i++) {
            let reel = new Reel(slicedWidth, height, i);
            reel.position.set(slicedWidth * i, 0);
            this.addChild(reel);
            this.reels.push(reel);
            border.drawRect(slicedWidth * i, 0, slicedWidth, height);
            reel.on("spincomplete", this.onReelSpinComplete.bind(this));
        }
        this.addChild(border);
    }

    /**
     * Initiates the reel spins.
     */
    spinReels() {
        this.currentReel = 0;
        let timeout = 0;
        for (let reel of this.reels) {
            setTimeout(reel.spin.bind(reel), timeout);
            timeout += 300;
        }
        setTimeout(this.stopReels.bind(this), 1500);
    }

    stopReels() {
        this.reels[0].stop();
    }

    update(delta) {
        for (let reel of this.reels) {
            reel.update(delta);
        }
    }

    /**
     * Stops the reels when the spin is complete.
     * @param event - "spincomplete" event
     */
    onReelSpinComplete(event) {
        this.currentReel++;
        if (this.currentReel < this.reels.length) {
            //Stops the current reel.
            this.reels[this.currentReel].stop();
        } else {
            //This happens when reels have stopped.
            this.analyseResult();
        }
    }

    analyseResult() {
        let value = 0;
        for (let line of paylines) {
            let sum = 0;
            for (let i = 0; i < line.length - 1; i++) {
                let a = this.reels[i].tiles[line[i]].id;
                let b = this.reels[i + 1].tiles[line[i + 1]].id;
                if (a === b) {
                    sum++;
                } else {
                    break;
                }
            }
            let first = this.reels[0].tiles[line[0]].id;
            value = value + tileData.images[first].paytable[sum];
        }
        if (value > 0) {
            this.gameScene.setWinValue(value * this.gameScene.getBetValue());
            this.gameScene.setBalance(this.gameScene.getBalance() + this.gameScene.getWinValue());
        }
    }
}

class GameScene extends PIXI.Container {

    /**
     * GameScene constructor method.
     */
    constructor() {
        super();
        //Adds the background
        this.background = new Sprite(resources['assets/images/game-background.jpg'].texture);
        this.background.width = 1000;
        this.background.height = 600;
        app.stage.addChild(this.background);
        //Adds the game title
        this.titleLogo = new Sprite(resources["assets/images/game-logo.png"].texture);
        this.titleLogo.x = 400;
        this.titleLogo.y = 10;
        this.titleLogo.height = 50;
        this.titleLogo.width = 200;
        app.stage.addChild(this.titleLogo);
        //Adds the slot machine
        this.machine = new SlotMachine(800, 400, 5, this);
        this.machine.x = 100;
        this.machine.y = 70;
        app.stage.addChild(this.machine);
        //Adds the spin button
        this.btnSpin = new Sprite(resources["assets/images/spin-normal.png"].texture);
        this.btnSpin.interactive = true;
        this.btnSpin.buttonMode = true;
        this.btnSpin.width = 100;
        this.btnSpin.height= 100;
        this.btnSpin.on("pointerdown", this.spin.bind(this));
        this.btnSpin.x = 800;
        this.btnSpin.y = 480;
        app.stage.addChild(this.btnSpin);
        //Adds the text that shows the balance
        this.balanceText = new PIXI.Text("", this.textStyle());
        this.balanceText.x = 400;
        this.balanceText.y = 515;
        this.balanceValue = 1000;
        this.balanceText.text = this.numberFormat().format(this.balanceValue);
        app.stage.addChild(this.balanceText);
        //Adds header for balance value.
        this.balanceHeader = new PIXI.Text("", this.textStyle());
        this.balanceHeader.x = 430;
        this.balanceHeader.y = 475;
        this.balanceHeader.text = "Balance:";
        app.stage.addChild(this.balanceHeader);
        //Adds the text that shows the bet value
        this.betText = new PIXI.Text("", this.textStyle());
        this.betText.x = 200;
        this.betText.y = 515;
        this.betValue = 10;
        this.betText.text = this.numberFormat().format(this.betValue);
        app.stage.addChild(this.betText);
        //Adds header for the bet value.
        this.betHeader = new PIXI.Text("", this.textStyle());
        this.betHeader.x = 200;
        this.betHeader.y = 475;
        this.betHeader.text = "Bet size:";
        app.stage.addChild(this.betHeader);
        //Adds the button for increasing bet value
        this.addBetValue = new Sprite(resources["assets/images/plus-normal.png"].texture);
        this.addBetValue.interactive = true;
        this.addBetValue.buttonMode = true;
        this.addBetValue.on("pointerdown", this.raiseBet.bind(this));
        this.addBetValue.x = 330;
        this.addBetValue.y = 520;
        this.addBetValue.height = 20;
        this.addBetValue.width = 20;
        app.stage.addChild(this.addBetValue);
        //Adds the button for decreasing bet value
        this.lowerBetValue = new Sprite(resources["assets/images/minus-normal.png"].texture);
        this.lowerBetValue.interactive = true;
        this.lowerBetValue.buttonMode = true;
        this.lowerBetValue.on("pointerdown", this.lowerBet.bind(this));
        this.lowerBetValue.x = 330;
        this.lowerBetValue.y = 540;
        this.lowerBetValue.height = 20;
        this.lowerBetValue.width = 20;
        app.stage.addChild(this.lowerBetValue);
        //Adds a header for winnings value.
        this.winningsHeader = new PIXI.Text("", this.textStyle());
        this.winningsHeader.x = 630;
        this.winningsHeader.y = 475;
        this.winningsHeader.text = "Winnings:";
        app.stage.addChild(this.winningsHeader);
        //Adds a text for winnings.
        this.winText = new PIXI.Text("", this.textStyle());
        this.winText.x = 640;
        this.winText.y = 515;
        this.winValue = 0;
        this.winText.text = this.numberFormat().format(this.winValue);
        app.stage.addChild(this.winText);
    }

    /**
     * Update function of the GameScene object, updates the game if a slot machine exists.
     * @param delta
     */
    update(delta) {
        if (this.machine) {
            this.machine.update(delta);
        }
    }

    /**
     * Returns the text style.
     * @returns {*}
     */
    textStyle() {
        return new PIXI.TextStyle({
            fontSize: 36,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 5,
            align: "center"
        });
    }

    /**
     * Returns number formatting.
     * @returns {Intl.NumberFormat}
     */
    numberFormat() {
        return new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "EUR"
        });
    }

    /**
     * Initiates the reel spin on the slot machine if there is enough balance.
     * Subtratcs the bet value from the balance.
     * Deactivates the spin button when balance is 0.
     */
    spin() {
        if (this.balanceValue - this.betValue >= 0) {
            this.setWinValue(0);
            this.machine.spinReels();
            let balance = Math.round((this.balanceValue) * 10) / 10 - Math.round((this.betValue) * 10) / 10;
            this.setBalance(Math.round(balance * 10) / 10);
            if (this.balanceValue == 0) {
                this.btnSpin.interactive = false;
            }
        }
    }

    /**
     * Sets the balance value and text accordingly.
     * @param value - balance value.
     */
    setBalance(value) {
        this.balanceValue = value;
        this.balanceText.text = this.numberFormat().format(this.balanceValue);
    }

    /**
     * Getter method for balance value.
     * @returns {*} value of the balance.
     */
    getBalance() {
        return this.balanceValue;
    }
    /**
     * Sets the bet value and text accordingly.
     * @param value - bet value.
     */
    setBet(value) {

        this.betValue = value;
        this.betText.text = this.numberFormat().format(this.betValue);
    }

    /**
     * Decrements the bet value by 0.1
     * Cannot lower the value when minimum value of 0.1 is reached.
     */
    lowerBet() {
        if (Math.round((this.betValue - 0.1) * 10) / 10 < 0.1) {
        } else {
            this.setBet(Math.round((this.betValue - 0.1) * 10) / 10);
        }
    }

    /**
     * Increments the bet value by 0.1
     */
    raiseBet() {
        this.setBet(Math.round((this.betValue + 0.1) * 10) / 10);
    }

    /**
     * Method for retrieving the bet value.
     * @returns {*} bet value.
     */
    getBetValue() {
        return this.betValue;
    }

    /**
     * Sets the winnings value and adjusts the text accordingly.
     * @param value
     */
    setWinValue(value) {
        this.winValue = value;
        this.winText.text = this.numberFormat().format(this.winValue);
    }

    /**
     * Method for retrieving winnings value.
     * @returns {*}
     */
    getWinValue() {
        return this.winValue;
    }
}

/**
 * This is what actually runs the game.
 */
let Application = PIXI.Application,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite;

let app = new Application({
        width: 1000,
        height: 600,
        antialias: true,
        transparent: false,
        resolution: 1
    }
);

//Adds the HTML Canvas element.
document.body.appendChild(app.view);

//Loads all Tile images.
for (i in tileData.images) {
    loader.add(tileData.images[i].filename);
}

//Loads all other images
for (i in imageFiles.images) {
    loader.add(imageFiles.images[i].filename);
}

//Loads the game.
loader.load(setup);

/**
 * Setup function.
 */
function setup() {
    let game = new GameScene();
    app.ticker.add(game.update.bind(game));
}
