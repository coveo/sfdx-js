// Code executed by requestExecutionner.test.ts.
let payloadStderr = `{ "warnings": ["boop", "beep", "bop"] }`;
let payloadStdout = `{ "result": "Spaghetti" }`;
console.log(payloadStdout);
console.error(payloadStderr);
