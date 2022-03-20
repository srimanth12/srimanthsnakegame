(function() {
    if (typeof Snakes === "undefined") {
        window.Snakes = {};
    }

    var View = Snakes.View = function($el) {
        this.$el = $el;
        this.setupGame();
        this.setupGrid();
        this.bindKeys();

        var that = this;
        this.intervalId = window.setInterval(function() {
            that.step();
        }, that.intervalSpeed);
    };

    View.prototype.bindKeys = function() {
        var that = this;
        $(window).on('keydown', function(event) {
            that.handleKeyEvent(event);
        });
    };

    View.prototype.checkStorageSupport = function () {
        // checks if browser can support localStorage
        // Source: http://diveintohtml5.info/detect.html#storage
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch(e) {
            return false;
        }
    };

    View.prototype.handleKeyEvent = function(event) {
        switch (event.keyCode) {
            case 38:
                this.board.snake.turn("N");
                break;
            case 37:
                this.board.snake.turn("W");
                break;
            case 40:
                this.board.snake.turn("S");
                break;
            case 39:
                this.board.snake.turn("E");
                break;
            default:
                break;
        }
    };

    View.prototype.handleDeath = function () {
        this.die.play(); // play death sound

        // check for high score
        if (parseInt($('.high-score').text()) < this.board.score) {
            // saves high score to localStorage if browser is compatible
            if (this.checkStorageSupport()) {
                localStorage.setItem("highScore", this.board.score);
            }
            $('.high-score').text(this.board.score);
            $('.game-over').addClass('show-text');
            $('.highscore-message').addClass('show-text');
        } else {
            $('.game-over').addClass('show-text');
        }
        $('#start-button').removeAttr("disabled");
        window.clearInterval(this.intervalId);
    };

    View.prototype.renderHTML = function() {
        this.updateClasses(this.board.snake.segments, "snake");
        this.updateClasses([this.board.apple.position], "apple");
    };

    View.prototype.setDifficulty = function () {
        if ($("#easy").prop("checked")) {
            this.intervalSpeed = 200;
            this.multiplier = 1;
        } else if ($("#hard").prop("checked")) {
            this.intervalSpeed = 105;
            this.multiplier = 2;
        } else {
            this.intervalSpeed = 60;
            this.multiplier = 3.5;
        }
    };

    View.prototype.setupGame = function () {
        this.die = new Audio('../sounds/die.wav');
        this.setHighScore();
        this.setDifficulty();

        // Removes messages if visible
        $('.highscore-message').removeClass('show-text');
        $('.game-over').removeClass('show-text');

        // Creates grid, hides instructions
        this.board = new Snakes.Board(20, this.multiplier);
        $('.instructions').addClass("hidden");

        // Disables game start button when running
        $('#start-button').text("Restart Game");
        $('#start-button').attr("disabled", true);
    };

    View.prototype.setupGrid = function () {
        var grid = "";
        for (var i = 0; i < this.board.dimensions; i++) {
            grid += "<ul>";
            for (var j = 0; j < this.board.dimensions; j++) {
                grid += "<li></li>";
            }
            grid += "</ul>";
        }
        this.$el.html(grid);
        // saves all the <li>s so they can be searched through
        this.$li = this.$el.find('li');
    };

    View.prototype.setHighScore = function () {
        // if browser supports localStorage, retrieve high score from
        // localStorage if it exists, otherwise default to 0;
        if (this.checkStorageSupport() && localStorage.getItem("highScore")) {
            this.highScore = localStorage.getItem("highScore");
        } else {
            this.highScore = 0;
        }

        $('.high-score').text(this.highScore);
    };

    View.prototype.step = function() {
        if (this.board.snake.segments.length === 0) {
            this.handleDeath();
        } else {
            $('.score').text(this.board.score);
            this.board.snake.move();
            this.renderHTML();
        }
    };

    View.prototype.updateClasses = function(coordinates, className) {
        // clears out classes
        this.$li.filter("." + className).removeClass();
        coordinates.forEach(function(coordinate) {
            // finds the li with the correct coordinate and adds the class
            var flatCoordinate = (coordinate.row * this.board.dimensions) + coordinate.col;
            this.$li.eq(flatCoordinate).addClass(className);
        }.bind(this));
    };
})();
