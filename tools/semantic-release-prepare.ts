const path = require("path");
const { fork } = require("child_process");

// Call husky to set up the hooks
fork(path.resolve(__dirname, "..", "node_modules", "husky", "bin", "install"));
