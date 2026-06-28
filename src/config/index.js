export const config = {
  server: {
    port: process.env.PORT || 3000
  },
  mongodb:{
    uri:"mongodb://localhost:27017/nodejs-developers",
    options:{
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 3000
    }
  },
  session: {
    // Secret key to encrypt client side sessions.
    // Created on the terminal with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
    secret: "Se/AiMDXVByPyPaC0N2CPecmBkHeSs5T7ZwhW07TMOI="

  }
};
