import fp from "fastify-plugin";
import { Sequelize } from "sequelize";
import { readdir } from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

async function sequelizePlugin(fastify, config) {
  let mysqlStatus = "disconnected";

  let sequelize;
  try {
    sequelize = new Sequelize(config.uri, config.options);
    await sequelize.authenticate();
    fastify.log.info("Connected to MySQL");
    mysqlStatus = "connected";
    fastify.decorate("sequelize", sequelize);
    const models = {};
    const modelPath = path.resolve("src/models/sequelize");
    const modelFiles = await readdir(modelPath);
    for (const file of modelFiles) {
      if (file.endsWith(".js")) {
        const model = (await import(pathToFileURL(path.join(modelPath, file)).href)).default(
          sequelize,
          Sequelize.DataTypes
        );
        models[model.name] = model;
        fastify.log.info(`Sequelize model ${model.name} loaded`);
      }
    }
    Object.values(models).forEach((model) => {
      if (model.associate) {
        model.associate(models);
      }
    });
    await sequelize.sync({alter:false});
    fastify.log.info("Sequelize models synced successfully")
    fastify.decorate("models", models);
  } catch (err) {
    fastify.log.error("Failed to connect to MySQL");
    throw err;
  }

  fastify.decorate("mysqlStatus", () => mysqlStatus);

  // Graceful shutdown
  fastify.addHook("onClose", async (fastifyInstance, done) => {
    mysqlStatus = "disconnected";
    await sequelize.close();
    // TODO: Close Sequelize connection
    done();
  });
}

export default fp(sequelizePlugin, { name: "sequelize-plugin" });
