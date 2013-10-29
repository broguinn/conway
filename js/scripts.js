var Game = {

  mostGenerations: 0,
  highPopulation: 0,
  demo: false,

  initialize: function(x, y) {
    var grid = Object.create(Grid);
    this.grid = grid;
    this.grid.initialize(x, y);
  },

  checkScores: function() {
    if (this.grid.generations > this.mostGenerations) {
      this.mostGenerations = this.grid.generations;
    }
    if (this.grid.population > this.highPopulation) {
      this.highPopulation = this.grid.population;
    }
  },

  toggleDemo: function() {
    this.demo = !(this.demo);
  }
};

var Grid = {

  generations: 0,
  population: 0,

  initialize: function(x, y) {
    this.cells = [];

    for (var i = 0; i < x; i++) {
      this.cells.push([]);
      for (var j = 0; j < y; j++) {
        var cell = Object.create(Cell);
        cell.setCoordinates(i, j);
        this.cells[i].push(cell);
      }
    }
    this.maxX = x - 1;
    this.maxY = y - 1;
    this.setAllLiveNeighbors();
    this.setAllNextStates();
  },

  checkNeighbors: function(cell) {
    var liveNeighbors = 0;
    var xCoor = cell.coordinates[0];
    var yCoor = cell.coordinates[1];

    for (var x = xCoor - 1; x < xCoor + 2; x++) {
      for (var y = yCoor - 1; y < yCoor + 2; y++) {
        if (!(x === xCoor && y === yCoor)) {
          if (x < 0) {
            var newX = this.maxX;
          } else if (x > this.maxX) {
            var newX = 0;
          } else {
            var newX = x;
          }
          if (y < 0) {
            var newY = this.maxY;
          }
          else if (y > this.maxY) {
            var newY = 0;
          } else {
            var newY = y;
          }
          if(this.cells[newX][newY].state === "live") {
            liveNeighbors++;
          }
        }
      }
    }
    return liveNeighbors;
  },

  setAllLiveNeighbors: function() {
    var thisGrid = this;
    this.cells.forEach(function(column) {
      column.forEach(function(cell) {
        cell.liveNeighbors = thisGrid.checkNeighbors(cell);
      });
    });
  },

  setAllNextStates: function() {
    this.population = 0;
    var thisGrid = this;
    this.cells.forEach(function(column) {
      column.forEach(function(cell) {
        cell.setNextState();
        if (cell.state === "live") { thisGrid.population++; }
      });
    });
  },

  tick: function() {
    this.population = 0;
    var thisGrid = this;
    this.cells.forEach(function(column) {
      column.forEach(function(cell) {
        cell.state = cell.nextState;
        if (cell.state === "live") { thisGrid.population++; }
      });
    });
    this.generations++;
  },

  staticCheck: function() {
    return this.cells.every(function(column) {
       return column.every(function(cell) {
        return (cell.state === cell.nextState);
      });
    });
  }
};

var Cell = {
  state: "dead",

  changeState: function() {
    this.state = (this.state === "live") ? "dead" : "live";
  },

  setCoordinates: function(x, y) {
    this.coordinates = [x, y];
  },

  setLiveNeighbors: function(num) {
    this.liveNeighbors = num;
  },

  setNextState: function() {
    if (this.state === "live") {
      if (this.liveNeighbors < 2 || this.liveNeighbors >= 4) {
        this.nextState = "dead";
      } else if (this.liveNeighbors < 4) {
        this.nextState = "live";
      }
    } else {
      if (this.liveNeighbors === 3) {
        this.nextState = "live";
      } else {
        this.nextState = "dead";
      }
    }
  }
};

$(function() {
  var intervalId;

  function makeBoard(x, y) {
    game.initialize(x, y);
    $("#grid").empty();
    for (var i = 0; i < y; i++) {
      $("#grid").append("<tr data='" + i + "'></tr>");
    }
    $("tr").each(function(){
      for (var j = 0; j < x; j++) {
        $(this).append("<td data='" + j + "'></td>");
      }
    });
    setColors();
  };

  function epoch() {
    game.grid.setAllLiveNeighbors();
    game.grid.setAllNextStates();
    setColors();
    if (game.grid.staticCheck()) {
      clearInterval(intervalId);
      $("h4#static-problems").empty().append("You have reached a static population state. Click reset to play again.");
      $("button#reset").addClass("static-reset");
    }
    game.grid.tick();
    $("h4#generation").empty().append("Generations: " +
      "<span class='scores'>" + game.grid.generations + "</span>");
    $("h4#population").empty().append("Population: " +
      "<span class='scores'>" + game.grid.population + "</span>");
    // $("button#reset").removeClass("static-reset");
    game.checkScores();
    $("h4#generation-high").empty().append("Most generations: " +
      "<span class='scores'>" + game.mostGenerations + "</span>");
    $("h4#population-high").empty().append("Highest population: " +
       "<span class='scores'>" + game.highPopulation + "</span>");
    game.grid.setAllLiveNeighbors();
    game.grid.setAllNextStates();
  };

  function startTime() {
    intervalId = window.setInterval(epoch, 300);
  };

  function stopTime() {
    clearInterval(intervalId);
  };

  function setColors() {
    $("tr").each(function() {
      $(this).children("td").each(function() {
        var xCoor = $(this).attr("data");
        var yCoor = $(this).parent().attr("data");
        var state = game.grid.cells[xCoor][yCoor].state;
        if (state === "live") {
          var neighbors = game.grid.cells[xCoor][yCoor].liveNeighbors;
          $(this).attr({class:"live" + neighbors});
        } else {
          $(this).attr({class:"dead"});
        }
      });
    });
  };

  var game = Object.create(Game);
  makeBoard(50, 50);

  $("form#input").submit(function() {
    //2 lines below here
    var size = $("input#grid-size").val();
    makeBoard(size, size);
    // makeBoard(50, 50)
    return false;
  });

  $("#grid").on("click", "td", function() {
    var xCoor = $(this).attr("data");
    var yCoor = $(this).parent().attr("data");
    game.grid.cells[xCoor][yCoor].changeState();
    game.grid.setAllLiveNeighbors();
    setColors();
    game.grid.setAllNextStates();
    $("h4#population-high").empty().append("Highest population: " +
       "<span class='scores'>" + game.highPopulation + "</span>");
  });

  $("#play").click(function() {
    if (!(game.grid.staticCheck()) && (!game.demo)) {
      startTime();
    } else {
      // $("h4#static-problems").empty().append("You have reached a static population state. Click reset to play again.");
      $("button#reset").addClass("static-reset");
    }
  });

  $("#pause").click(function() {
    clearInterval(intervalId);
  });

  $("#reset").click(function() {
    if (game.demo) {
      clearInterval(intervalId);
      game = Object.create(Game);
      makeBoard(50, 50);
      $("h4#generation").empty().append("Generations: " +
        "<span class='scores'>" + game.grid.generations + "</span>");
      $("h4#population").empty().append("Population: " +
        "<span class='scores'>" + game.grid.population + "</span>");
      $("h4#generation-high").empty().append("Most generations: " +
        "<span class='scores'>" + game.mostGenerations + "</span>");
      $("h4#population-high").empty().append("Highest population: " +
         "<span class='scores'>" + game.highPopulation + "</span>");
    }
    clearInterval(intervalId);
    //2 lines below here
    size = $("tbody").children("tr").length;
    makeBoard(size, size);
    // makeBoard(50, 50);
    $("button#reset").removeClass("static-reset");
    $("h4#static-problems").empty().append("Put on some blocks and press start!");
    $("h4#generation").empty().append("Generations: " +
      "<span class='scores'>" + game.grid.generations + "</span>");
    $("h4#population").empty().append("Population: " +
      "<span class='scores'>" + game.grid.population + "</span>");
  });

  $("#step").click(function() {
    if (!(game.grid.staticCheck())) {
      clearInterval(intervalId);
      epoch();
    }
  });

  $("#demo").click(function() {
    game.toggleDemo();
    //set up the game
    //2 lines below here
    size = $("tbody").children("tr").length;
    makeBoard(size, size);
    // makeBoard(50, 50);
    //populate demo squares
    demo.forEach(function(coordinates) {
      var x = coordinates[0];
      var y = coordinates[1];
      game.grid.cells[x][y].changeState();
    });

    //visualize
    game.grid.setAllLiveNeighbors();
    setColors();
    game.grid.setAllNextStates();
    startTime();
  });

  var gliderOrSomething = [[0,0], [1, 0], [2, 0]];
  function addPattern(pattern) {
    pattern.forEach(function(coordinates) {
      game.grid.cells[xCoor + coordinates[0]][yCoor + coordinates[1]].changeState();
    })
  }

  function addPattern() {
    var xCoor = parseInt($(this).attr("data"));
    var yCoor = parseInt($(this).parent().attr("data"));
    game.grid.cells[xCoor][yCoor].changeState();
    game.grid.cells[xCoor + 1][yCoor].changeState();
    game.grid.cells[xCoor+2][yCoor].changeState();
    game.grid.cells[xCoor][yCoor+1].changeState();
    game.grid.cells[xCoor+1][yCoor+1].changeState();
    game.grid.cells[xCoor+1][yCoor+2].changeState();
    game.grid.setAllLiveNeighbors();
    setColors();
    game.grid.setAllNextStates();
    $("h4#population-high").empty().append("Highest population: " +
     "<span class='scores'>" + game.highPopulation + "</span>");
    $("#grid").off("click", "td", addPattern);
    $("#click2").hide();
    $("#click1").show();
    $('body').css( 'cursor', 'auto');
    $('td').css( 'cursor', 'none');
  };

  $(".pattern").on("click", function() {
    $('body').css( 'cursor', 'pointer');
    $('td').css( 'cursor', 'pointer');
    $("#click1").hide();
    $("#click2").show();
    $("#grid").on("click", "td", addPattern);
  });
});

var demo = [[8, 12], [8, 13], [8, 14], [8, 15], [8, 16],
            [9, 11], [9, 17], [9, 34], [9, 41],
            [10, 10], [10, 18], [10, 34], [10, 35], [10, 36], [10, 37], [10, 38], [10, 39], [10, 40], [10, 41],
            [11, 10], [11, 18], [11, 34], [11, 41],
            [12, 10], [12, 15], [12, 18], [12, 41],
            [13, 11], [13, 15], [13, 16], [13, 17], [13, 41],
            [14, 15], [14, 41],
            [15, 41],
            [16, 18],
            [17, 16], [17, 17], [17, 18],
            [18, 13], [18, 14], [18, 15], [18, 17],
            [19, 12], [19, 17], [19, 24], [19, 25], [19, 26], [19, 27], [19, 28], [19, 35], [19, 41],
            [20, 13], [20, 14], [20, 15], [20, 17], [20, 23], [20, 29], [20, 35], [20, 41],
            [21, 16], [21, 17], [21, 18], [21, 23], [21, 29], [21, 35], [21, 36], [21, 37], [21, 38], [21, 39], [21, 40], [21, 41],
            [22, 18], [22, 23], [22, 29], [22, 35], [22, 41],
            [23, 23], [23, 29], [23, 35], [23, 41],
            [24, 24], [24, 25], [24, 26], [24, 27], [24, 28],
            [25, 18],
            [26, 14], [26, 15], [26, 16], [26, 17], [26, 18],
            [27, 12], [27, 13], [27, 23], [27, 24], [27, 25], [27, 26], [27, 27], [27, 28], [27, 29], [27, 35], [27, 36], [27, 37], [27, 38], [27, 39], [27, 40], [27, 41],
            [28, 13], [28, 14], [28, 23], [28, 26], [28, 35], [28, 38],
            [29, 15], [29, 23], [29, 26], [29, 35], [29, 38],
            [30, 13], [30, 14], [30, 23], [30, 26], [30, 35], [30, 38],
            [31, 12], [31, 13], [31, 23], [31, 35],
            [32, 14], [32, 15], [32, 16], [32, 17], [32, 18],
            [33, 18],
            [35, 35], [35, 41],
            [36, 12], [36, 18], [36, 35], [36, 36], [36, 37], [36, 38], [36, 39], [36, 40], [36, 41],
            [37, 12], [37, 13], [37, 14], [37, 15], [37, 16], [37, 17], [37, 18], [37, 35], [37, 38], [37, 41],
            [38, 12], [38, 15], [38, 18], [38, 35], [38, 38], [38, 41],
            [39, 12], [39, 15], [39, 18], [39, 35], [39, 38], [39, 41],
            [40, 12], [40, 15], [40, 18], [40, 35], [40, 41],
            [41, 12], [41, 18]]
