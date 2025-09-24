// JANGAN pakai 'dotenv' di Docker. Ambil langsung dari process.env.
function req(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const env = {
  port: Number(process.env.PORT ?? 3001),
  mongoUri: req('MONGO_URI'),
  jwtSecret: req('JWT_SECRET'),

  mqUrl: req('RABBITMQ_URL'),
  notifyExchange: process.env.RABBITMQ_NOTIFY_EXCHANGE ?? 'youapp.notify.exchange',
  notifyQueue: process.env.RABBITMQ_NOTIFY_QUEUE ?? 'youapp.notify.queue',
  notifyRouting: process.env.RABBITMQ_NOTIFY_ROUTING ?? 'notify.msg',
};
