import { interval, map, Observable } from 'rxjs';

const observable = new Observable((subscriber) => {
  subscriber.next(10);
});

const observer = {};
