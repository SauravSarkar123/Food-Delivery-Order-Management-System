const app = require("./src/app");
const logger = require("./src/logger");

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});