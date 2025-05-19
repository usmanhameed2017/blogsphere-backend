require("dotenv").config();
const app = require("./app");
const { port } = require("./constants");
const connectDB = require("./database/connection");

// Database connection
connectDB()
.then(() => {
    app.on("error", () => console.log("Failed to run application"));
    app.listen(port, () => console.log(`Server is started and running at http://localhost:${port}`));
}).catch(error => console.log(error.message));