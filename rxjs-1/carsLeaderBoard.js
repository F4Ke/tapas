const { combineLatest } = require('rxjs');
const { map, bufferCount } = require("rxjs/operators");
const { getCarSpeed } = require('./carSpeed');
const { eventToObservable } = require('./eventToObservable')

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
const baseCarObjects = (cars) => {
  // return the array of premade leaderboard data
  return cars.map((car) => {
    return {
      time: car.time,
      carName: car.carName,
      xLocation: car.xLocation,
      speed: 0
    }
  });
}

// we prepare the board raw data in order to complete the computation
const prepareDataProcessBoard = (board) => {
  let pos = board.length;
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
const processBoard = (board) => {
  const retBoard = prepareDataProcessBoard(board);
  // we process with the calculation of the inverted list
  retBoard.forEach((car, index) => {
    if (index < retBoard.length) {
      const nextCar = retBoard[index+1];
      // just to be sure ...
      if (nextCar) {
        car.leaderGapDistance = nextCar.xLocation - car.xLocation;
      }
    }

  });
  return (retBoard)
}

// calcul just the gap leader time
// last computation before send the data to the view
const processSpeed = (board) => {
  // we process with the calculation of the inverted list
  board.forEach((car, index) => {
    if (index < board.length) {
      const nextCar = board[index+1];
      // just to be sure ...
      if (nextCar) {
        // here the mutliplier transform the value from per seconds to per milliseconds
        car.leaderGapTime = ((car.leaderGapDistance / car.speed) * 1000);
      }
    }

  });
  return (board)
}

// sort our board by postion to be usable in the view
const reOrderTable = (board) => {
  return sortTableObject(board, 'position');
}

// merge our speeds observable in our current leaderboard
const mergeData = ([leaderboard, ...speeds]) => {
  leaderboard.forEach((board, i) => {
    // get the speed in the order from the stream
    // at this moment our finalboard is in the same position of our stream
    board.speed = speeds[i];
  })
  return leaderboard;
}

// fetch our leaderboard onbservable
// prepare the leaderboard data
// process the table to wait for the speed data
// note : The buffercount is to 'wait' to have our X cars data before processing the leaderboard
const leaderBoardObservable = (race, raceCarNb) => {
  const currentLeaderBoardData = [];
  return eventToObservable(race)
    .pipe(
      bufferCount(raceCarNb),
      map(baseCarObjects),
      map(processBoard));
}

const getLeaderBoard = (race) => {
  const cars = race.getCars();
  const raceCarNb = cars.length;
  const speedsObs = [];
  // we initialise each car observables
  cars.forEach(carName => {
    speedsObs.push(getCarSpeed(race, carName))
  })
  const leaderBoardObs = leaderBoardObservable(race, raceCarNb);
  // combineLatest is used to get the last value emited by one of theses observables
  return combineLatest(leaderBoardObs, ...speedsObs).pipe(
    map(mergeData),
    map(processSpeed),
    map(reOrderTable));
}

module.exports = { getLeaderBoard };