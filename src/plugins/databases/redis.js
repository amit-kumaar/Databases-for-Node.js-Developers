import fp from "fastify-plugin";
import Redis from "ioredis";

async function redisPlugin(fastify, config) {
  let redisStatus = "disconnected";


  try {
    const redis = new Redis({
      host: config.host,
      port: config.port
    });

    await new Promise((resolve, reject) => {
      redis.once("ready", resolve);
      redis.once("error", reject);
    });

    redisStatus = "connected";
    fastify.log.info("Connected to Redis");
    fastify.decorate("redis", redis);
  } catch (err) {
    fastify.log.error("Failed to connect to Redis");
    throw err;
  }

  fastify.decorate("redisStatus", () => redisStatus);

  // Graceful shutdown
  fastify.addHook("onClose", async (fastifyInstance, done) => {
    redisStatus = "disconnected";
    await fastify.redis.quit();
    done();
  });
}

export default fp(redisPlugin, { name: "redis-plugin" });
