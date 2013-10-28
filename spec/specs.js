describe('Game', function() {

  it("has an initial most-generations-achieved count of 0", function() {
    var game = Object.create(Game);
    game.initialize();
    game.mostGenerations.should.equal(0);
  });

  it("has an initial highest-population-achieved count of 0", function() {
    var game = Object.create(Game);
    game.initialize();
    game.highPopulation.should.equal(0);
  });

  it("has a demo state with an initial value of false", function() {
    var game = Object.create(Game);
    game.demo.should.equal(false);
  });

  describe('initialize', function() {
    it('calls for a new grid', function() {
      var game = Object.create(Game);
      game.initialize();
      game.grid.should.exist; 
    });
  });

  describe('checkScores', function() {
    it("updates the generations high score", function() {
      var game = Object.create(Game);
      game.initialize(20, 20);
      game.grid.tick();
      game.checkScores();
      game.mostGenerations.should.equal(1);
    });

    it("updates the population high score", function() {
      var game = Object.create(Game);
      game.initialize(20, 20);
      game.grid.cells[0][3].changeState();
      game.grid.cells[1][4].changeState();
      game.grid.cells[1][2].changeState();
      game.grid.setAllLiveNeighbors();
      game.grid.setAllNextStates();
      game.grid.tick();
      game.checkScores();
      game.highPopulation.should.equal(2);  
    });
  });

  describe("toggleDemo", function() {
    it("changes the game's demo state", function() {
      var game = Object.create(Game);
      game.toggleDemo();
      game.demo.should.equal(true);
    });
  });
});

describe("Grid", function() {
  it('has a generation counter intialized at 0', function() {
    var grid = Object.create(Grid);
    grid.generations.should.equal(0);
  });

  it('has a live counter initialized at 0', function() {
    var grid = Object.create(Grid);
    grid.population.should.equal(0); 
  });

  describe("initialize", function() {
    it("creates a cells array", function() {
      var grid = Object.create(Grid);
      grid.initialize(10, 10);
      grid.cells.should.exist;
    });

    it("should have user-specified column arrays", function() {
      var grid = Object.create(Grid);
      grid.initialize(10, 10);
      grid.cells.length.should.equal(10);
    });

    it("has user-specified number of cells in each row", function() {
      var grid = Object.create(Grid);
      grid.initialize(10, 10);
      grid.cells[0].length.should.equal(10);
    });

    it("assigns coordinates to a cell", function() {
      var grid = Object.create(Grid);
      grid.initialize(10, 10);
      grid.cells[0][3].coordinates.should.eql([0, 3]);
    });

    it("sets a maximum x-value for the grid", function() {
      var grid = Object.create(Grid);
      grid.initialize(10, 10);
      grid.maxX.should.equal(9);
    });

    it("sets a maximum y-value for the grid", function() {
      var grid = Object.create(Grid);
      grid.initialize(10, 10);
      grid.maxY.should.equal(9);    
    })
  });

  describe("checkNeighbors", function() {
    it("returns 0 if there are no living neighbors", function() {
      var grid = Object.create(Grid);
      grid.initialize(10, 10);
      grid.checkNeighbors(grid.cells[1][1]).should.equal(0);
    });

    it("returns 2 if there are two living neighbors", function() {
      var grid = Object.create(Grid);
      grid.initialize(10, 10);
      grid.cells[0][0].changeState();
      grid.cells[0][2].changeState();
      grid.checkNeighbors(grid.cells[1][1]).should.equal(2);
    });

    it("works for edge cases", function() {
      var grid = Object.create(Grid);
      grid.initialize(10, 10);
      grid.cells[0][3].changeState();
      grid.cells[1][4].changeState();
      grid.checkNeighbors(grid.cells[1][3]).should.equal(2);
    })
  });

  describe("setAllLiveNeighbors", function() {
    it("sets each cell's live neighbors property", function() {
      var grid = Object.create(Grid);
      grid.initialize(10, 10);
      grid.cells[0][3].changeState();
      grid.cells[1][4].changeState();
      grid.setAllLiveNeighbors();
      grid.cells[1][3].liveNeighbors.should.equal(2);
    });
  });

  describe("setAllNextStates", function() {
    it("sets each cell's next state property", function() {
      var grid = Object.create(Grid);
      grid.initialize(10,10);
      grid.cells[6][1].changeState();
      grid.cells[7][1].changeState();
      grid.cells[6][0].changeState();
      grid.setAllLiveNeighbors();
      grid.setAllNextStates();
      grid.cells[7][0].nextState.should.equal("live");
    });
  });

  describe("tick", function() {
    it("makes each cell's current state its next state", function() {
      var grid = Object.create(Grid);
      grid.initialize(10, 10);
      grid.cells[0][3].changeState();
      grid.cells[1][4].changeState();
      grid.cells[1][2].changeState();
      grid.setAllLiveNeighbors();
      grid.setAllNextStates();
      grid.tick();
      grid.cells[1][3].state.should.equal("live");
    });

    it("increases a count of population generations", function() {
      var grid = Object.create(Grid);
      grid.initialize();
      grid.tick();
      grid.generations.should.equal(1);
    });

    it("calculates the population of live cells on the grid", function() {
      var grid = Object.create(Grid);
      grid.initialize(40, 40);
      grid.cells[0][3].changeState();
      grid.cells[1][4].changeState();
      grid.cells[1][2].changeState();
      grid.setAllLiveNeighbors();
      grid.setAllNextStates();
      grid.tick();
      grid.population.should.equal(2);
    });
  });

  describe('staticCheck', function() {
    it('returns true if the current and next states are the same for all cells', function() {
      var grid = Object.create(Grid);
      grid.initialize(20, 20);
      grid.cells[0][0].changeState();
      grid.cells[1][0].changeState();
      grid.cells[1][1].changeState();
      grid.cells[0][1].changeState();
      grid.setAllLiveNeighbors();
      grid.setAllNextStates();
      grid.staticCheck().should.be.true;
    });

    it('returns false if the current and next states are not the same', function() {
      var grid = Object.create(Grid);
      grid.initialize(20, 20);
      grid.cells[0][0].changeState();
      grid.cells[1][1].changeState();
      grid.cells[0][1].changeState();
      grid.setAllLiveNeighbors();
      grid.setAllNextStates();
      grid.staticCheck().should.be.false;
    });
  });
});

describe("Cell", function() {
  it("has an initial state dead", function() {
    var cell = Object.create(Cell);
    cell.state.should.equal("dead");
  });

  describe("changeState", function() {
    it("changes state from dead to live", function() {
      var cell = Object.create(Cell);
      cell.changeState();
      cell.state.should.equal("live");
    });

    it("changes state from live to dead", function() {
      var cell = Object.create(Cell);
      cell.changeState();
      cell.changeState();
      cell.state.should.equal("dead");
    });
  });

  describe("setCoordinates", function() {
    it("gives an x value to a cell", function() {
      var cell = Object.create(Cell);
      cell.setCoordinates(2, 3);
      cell.coordinates[0].should.equal(2);
    });

    it("gives a y value to a cell", function() {
      var cell = Object.create(Cell);
      cell.setCoordinates(4, 6);
      cell.coordinates[1].should.equal(6);
    });
  })

  describe("setLiveNeighbors", function() {
    it("gives the cell a value of live neighbors", function() {
      var cell = Object.create(Cell);
      cell.setLiveNeighbors(2);
      cell.liveNeighbors.should.equal(2);
    });
  });

  describe("setNextState", function() {
    it("dies if a live cell has less than two live neighbors", function() {
      var cell = Object.create(Cell);
      cell.setLiveNeighbors(1);
      cell.changeState();
      cell.setNextState();
      cell.nextState.should.equal("dead");
    });

    it("lives if a live cell has 2-3 live neighbors", function() {
      var cell = Object.create(Cell);
      cell.setLiveNeighbors(3);
      cell.changeState();
      cell.setNextState();
      cell.nextState.should.equal("live");
    });

    it("dies if a live cell has four or more live neighbors", function() {
      var cell = Object.create(Cell);
      cell.setLiveNeighbors(5);
      cell.changeState();
      cell.setNextState();
      cell.nextState.should.equal("dead");
    });

    it("comes to life if exactly three neighbors are live", function() {
      var cell = Object.create(Cell);
      cell.setLiveNeighbors(3);
      cell.setNextState();
      cell.nextState.should.equal("live");
    });

    it("stays dead if a dead cell does not have exactly three neighbors", function() {
      var cell = Object.create(Cell);
      cell.setLiveNeighbors(6);
      cell.setNextState();
      cell.nextState.should.equal("dead");
    });
  });
});