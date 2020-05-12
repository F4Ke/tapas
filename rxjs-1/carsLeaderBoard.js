const { combineLatest, from, fromEvent } = require('rxjs');
const { map } = require("rxjs/operators");
const { getCarSpeed } = require('./carSpeed');

const { eventToObservable } = require('./eventToObservable')

CAR_NUMBER = 2;
let currentLeaderBoardData = [];
let finalBoard = [];

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
const baseCarObject = (time, carName, xLocation) => {
  // use the generator and fetch the last known speed of this car
  return {
    time: time,
    carName: carName,
    xLocation: xLocation,
    speed: 0
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
const processBoard = (board) => {
  const retBoard = prepareDataProcessBoard(board);
  // we process with the calculation of the inverted list
  retBoard.forEach((car, index) => {
    if (index < CAR_NUMBER) {
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
    if (index < CAR_NUMBER) {
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

const mergeData = ([leaderboard, ...speeds]) => {
  finalBoard.forEach((board, i) => {
    // get the speed in the order from the stream
    // at this moment our finalboard is in the same position of our stream
    board.speed = speeds[i];
  })
  // sort our board by postion to be usable in the view
  finalBoard = sortTableObject(processSpeed(finalBoard), 'position');
  return finalBoard;
}


const leaderboardData = ({time, carName, xLocation}) => {
  // avoid duplicate data in test exemple
  if (!carExistInBoard(currentLeaderBoardData, carName)) {
    // push in the current data board the information of the car present
    currentLeaderBoardData.push(baseCarObject(time, carName, xLocation));
  }

  // Limit to the number of cars in the exemple
  if (currentLeaderBoardData.length >= CAR_NUMBER) {
    // process the current board raw data
    finalBoard = processBoard(currentLeaderBoardData);
    currentLeaderBoardData = []
  }
}

const leaderBoardObservable = (race) => {
  return eventToObservable(race)
    .pipe(map(leaderboardData))
}

const getLeaderBoard = (race) => {
  const speedsObs = [];
  // we initialise each car observables
  race.getCars().forEach(carName => {
    speedsObs.push(getCarSpeed(race, carName))
  })
  const leaderBoardObs = leaderBoardObservable(race);
  // combineLatest is used to get the last value emited by one of theses observables
  return combineLatest(leaderBoardObs, ...speedsObs).pipe(map(mergeData));
}

module.exports = { getLeaderBoard };