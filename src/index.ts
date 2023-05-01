import createServer from './server';
import * as Sentry from '@sentry/node';

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1,
});

const transaction = Sentry.startTransaction({
  op: 'test',
  name: 'My First Test Transaction',
});

const server = await createServer();
const port = +server.config.API_PORT;
const host = server.config.API_HOST;

// try {
//   foo();
// } catch (e) {
//   Sentry.captureException(e);
// } finally {
//   transaction.finish();
// }

setTimeout(async () => {
  try {
    await server.listen({ host, port });
  } catch (e) {
    Sentry.captureException(e);
  } finally {
    transaction.finish();
  }
}, 99);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () =>
    server.close().then((err) => {
      console.log(`close application on ${signal}`);
      process.exit(err ? 1 : 0);
    }),
  );
}
