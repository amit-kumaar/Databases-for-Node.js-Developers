import fp from "fastify-plugin";
import mongoose from "mongoose";

async function mongoosePlugin(fastify, config) {
  let mongoStatus = "disconnected";

  // Makes the current connection status available to other plugins
  // This is used to show the connection status on the home page
  fastify.decorate("mongoStatus", () => mongoStatus);

  // TODO: Connect to MongoDB
try{
  await mongoose.connect(config.uri, config.options);
  mongoStatus = "connected";
  fastify.log.info("MongoDB connected");
}catch(err){
  fastify.log.error("Error connecting to MongoDB");
  throw err;
}

  // Graceful shutdown
  fastify.addHook("onClose", async (fastifyInstance, done) => {
    mongoStatus = "disconnected";
    // TODO: Close MongoDB connection
    await mongoose.connection.close();
    fastify.log.info("MongoDB disconnected")
    done();
  });
}

export default fp(mongoosePlugin, { name: "mongoose-plugin" });
