const { Observable, fromEvent } = require('rxjs');
const { takeUntil } = require('rxjs/operators');

// take the race and return an observable
// emit until the stream signals us to end
const eventToObservable = (race) => {
  const obsData = fromEvent(race, 'data')
  const obsEnd = fromEvent(race, 'end');
  return obsData.pipe(takeUntil(obsEnd));
};

module.exports = { eventToObservable };