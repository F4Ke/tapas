const { Observable } = require('rxjs');
const { bufferTime, filter, map } = require("rxjs/operators");
const { eventToObservable } = require('./eventToObservable')

REFRESH_RATE = 200; // ms : minimum 150

// return the speed in m/s or 0
const calculateSpeed = (dataObjs) => {
  // here we have a lot of return 0
  // we want to avoid any divide by 0 possibilities

  if (!Array.isArray(dataObjs)) { return 0; }
  if (dataObjs.length <= 2) { return 0; }
  const firstEntr = dataObjs[0];
  const lastEntr = dataObjs.splice(-1)[0];

  if (firstEntr.time <= 0) { return 0; }

  const timeInSec = ((lastEntr.time - firstEntr.time) / 1000);

  if (firstEntr.xLocation <= 0 || timeInSec <= 0) {
    return 0;
  }
  // I return the raw value
  // the Fixed(2) number is only done in the 'view'
  return ((lastEntr.xLocation - firstEntr.xLocation) / timeInSec);
}

const getCarSpeed = (race, wantedCarName) => {
  // buffertime:
  // store the emitted values
  // when the time has passed ->
  // all values stored during this time
  return eventToObservable(race)
    .pipe(
      filter(car => car.carName === wantedCarName),
      bufferTime(REFRESH_RATE),
      map(calculateSpeed)
    );
}

module.exports = { getCarSpeed, calculateSpeed };

