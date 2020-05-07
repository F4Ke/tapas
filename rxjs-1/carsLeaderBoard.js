const { Observable, combineLatest } = require('rxjs');
const { map } = require("rxjs/operators");
const { getCarSpeed } = require('./carSpeed');

CAR_NUMBER = 2;

// return the table sorted
// using the key paramters
// note : the key params as to be a string : we can improve this part
const sortTableObject = (carObjects, key) => {
  return carObjects.sort((a, b) => {
      const x = a[key];
      const y = b[key];
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}

// check if the car exist using it's name
const carExistInBoard = (board, carName) => {
  const indexOfCar = (boardObj) => boardObj.carName === carName;
  return (board.findIndex(indexOfCar) >= 0);
}

// return a car object
const baseCarObject = (time, carName, xLocation, currentSpeedGen) => {
  // use the generator and fetch the last known speed of this car
  const nextGeneratorIt = currentSpeedGen.next();
  return {
    time: time,
    carName: carName,
    xLocation: xLocation,
    speed: nextGeneratorIt.value
  }
}

// we prepare the board raw data in order to complete the computation
const prepareDataProcessBoard = (board) => {
  let pos = CAR_NUMBER;
  // we order by inverted position
  // in order to simplify the calcul of the gap
  return sortTableObject(board, 'xLocation').map((car) => {
      const ret = {
        ...car,
        position: pos,
        leaderGapDistance: 0,
        leaderGapTime: 0,
        speed: car.speed

      };
      pos--;
      return ret;
    });
  return
}

// finalize the data of the board comptuation
// in order to send it usable for the view
const processBoard = (board) => {
  const retBoard = prepareDataProcessBoard(board);
  // we process with the calculation of the inverted list
  retBoard.forEach((car, index) => {
    if (index < CAR_NUMBER) {
      const nextCar = retBoard[index+1];
      // just to be sure ...
      if (nextCar) {
        nextCarGapMeters = nextCar.xLocation - car.xLocation
        // I return the raw value
        // the Fixed number is only done in the 'view'
        car.leaderGapDistance = nextCarGapMeters;
        car.leaderGapTime = car.leaderGapDistance / car.speed;
      }
    }

  });
  return (retBoard)
}

// this is our generator
// every time we ask it the speed for our car
// it will answer us ths last know speed (using it's interval of 200ms)
function *speedFor(obs) {
  let values = []
  obs.subscribe( (speed) => {
    // we store the values for the speeds
    // we will be able to return the last value
    values.push(speed);
  });

  // note : this while true can be strange for non-generator users
  while (true) {
    // here we return the last known avalue
    yield values[values.length-1]
  }
}

// create the speed generator, using the carSpeed observable for every car of the race
const initalizeCarSpeeds = (race) => {
  const carNames = race.getCars();
  speedsObs = []
  carNames.forEach(name => {
    // create a generator in order to use the "slow"-er observable of the speed calculation
    const speedGen = speedFor(getCarSpeed(race, name));
    speedGen.next(); // we start the observable inside our generator
    speedsObs.push({ name: name, speed: speedGen })
  })
  return speedsObs;
}

const leaderBoardObservable = (race, speedsObs) => {
  const observable = new Observable(subscriber => {

    let currentLeaderBoardData = [];

    race.on('data', ({time, carName, xLocation}) => {
      // avoid duplicate data in test exemple
      if (!carExistInBoard(currentLeaderBoardData, carName)) {
        // fetch the generator for the speed promise value
        const currentSpeedGen = speedsObs.find(e => e.name === carName).speed
        currentLeaderBoardData.push(baseCarObject(time, carName, xLocation, currentSpeedGen));
      }
      // Limit to the number of cars in the exemple
      if (currentLeaderBoardData.length >= CAR_NUMBER) {
        const processedBoard = processBoard(currentLeaderBoardData);

        // the preocess bord is reorderd for the show
        subscriber.next(sortTableObject(processedBoard, 'position'));
        currentLeaderBoardData = [];
      }
    });
    race.on('end', () => {
      subscriber.complete();
    });
  });
  return observable;
}

const getLeaderBoard = (race) => {
  const speedsObs = initalizeCarSpeeds(race);
  const leaderBoardObs = leaderBoardObservable(race, speedsObs);
  return leaderBoardObs;
}

module.exports = { getLeaderBoard };