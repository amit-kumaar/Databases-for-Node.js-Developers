import fp from "fastify-plugin";
import mongoose from "mongoose";
import { Item } from "../../models/mongoose/item.js";

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
  await Item.createCollection();
  fastify.log.info("Items collection ensured");
  fastify.decorate("Item",Item);
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
