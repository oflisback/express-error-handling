const express = require('express');
const app = express();

const logError = (error, stack) => console.log(`${error} ${stack}`);
const logPromise = (reason, promise) => console.log(`${reason} ${JSON.stringify(promise)}`);

process.on('uncaughtException', err => {
  console.log('uncaughtException handler');
  logError(err.message, err.stack);
  // Terminate server since it's probably in an unexpected state.
  // This handler is called for uncaught exceptions outside the
  // Express context. Express continues execution for uncaught
  // errors within its context, but generally it's a bad idea
  // and we should terminate the process and have it restarted
  // automatically by some external tool.
  process.exit(1);
});

process.on('unhandledRejection', (reason, p) => {
  console.log('unhandledRejection handler');
  logPromise(reason, p);
});

app.get('/error1', (req, res) => {
  const description = 'Error #1 - Unhandled exception';
  res.send(description);
  throw new Error(description);
});

app.get('/error2', (req, res) => {
  const description = 'Error #2 - Uncaught promise rejection';
  res.send(description);
  Promise.reject(description);
});

app.get('/error3', (req, res) => {
  const description = 'Error #3 - Unhandled Exception from promise reject';
  res.send(description);
  Promise.reject(new Error(description));
});

app.get('/error4', (req, res) => {
  setTimeout(() => {
    const description = 'Error #4 - Unhandled Exception thrown from outside Express context';
    res.send(description);
    throw new Error(description);
  }, 0);
});

app.get('/error5', (req, res) => {
  setTimeout(() => {
    const description = 'Error #5 - Uncaught promise rejection from outside Express context';
    res.send(description);
    Promise.reject(description);
  }, 0);
});

app.get('/error6', (req, res) => {
  setTimeout(() => {
    const description = 'Error #5 - Unhandled Exception from promise reject outside Express context';
    res.send(description);
    Promise.reject(new Error(description));
  }, 0);
});

// NOTE: This should be placed after definition of routes to work.
app.use((err, req, res, next) => {
  console.log('Express error handler middleware');
  logError(err, err.stack);
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));
