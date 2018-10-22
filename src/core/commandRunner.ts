import { exec, ExecOptions } from "child_process";
import _ from "underscore";
export interface ICommandRunner {
  runCommand(command: string, options?: ExecOptions): Promise<string>;
}

export interface CustomLogger {
  error(data: string): void;
  info(data: string): void;
}

export interface ICommandRunnerOptions {
  sfdxPath: string;
  useLiveLog: boolean;
  customLogger?: CustomLogger;
}

export class CommandRunner implements ICommandRunner {
  public static defaultOptions: ICommandRunnerOptions = {
    sfdxPath: "sfdx",
    useLiveLog: false
  };

  private sfdxPath: string;
  private useLiveLog: boolean;
  private customLogger!: CustomLogger;

  constructor(options: ICommandRunnerOptions = CommandRunner.defaultOptions) {
    this.sfdxPath = options.sfdxPath;
    this.useLiveLog = options.useLiveLog;
    if (this.useLiveLog && !options.customLogger) {
      throw new Error("UseLiveLog set to true and no custom logger is given.");
    }
    if (options.customLogger !== undefined) {
      this.customLogger = options.customLogger;
    }
  }

  public runCommand(command: string, options?: ExecOptions): Promise<string> {
    let executePromise = new Promise<string>((resolve, reject) => {
      const fullCommand = this.sfdxPath + " " + command;

      let actualOptions: ExecOptions = {
        env: this.getCommandEnv()
      };

      if (options !== undefined) {
        actualOptions = Object.assign(actualOptions, options);
      }

      // Execute the command. If there's an error thrown or the stderr is not empty, it will reject the promise.
      // Otherwise, it will resolve with the content of the stdout.
      let execProcess = exec(fullCommand, actualOptions, (error, stdout, stderr) => {
        if (error || stderr !== "") {
          // If there's no error object and the error stream only contains some warning, keep going.
          let stderrJSON = JSON.parse(stderr.trim());
          if (
            !error &&
            Object.keys(stderrJSON).length === 1 &&
            stderrJSON.hasOwnProperty("warnings")
          ) {
            resolve(JSON.stringify({ ...JSON.parse(stdout), ...JSON.parse(stderr) }));
          }
          reject(stderr);
        } else {
          resolve(stdout);
        }
      });
      if (this.useLiveLog) {
        this.bindProcessListeners(execProcess, fullCommand);
      }
    });
    return executePromise;
  }

  private bindProcessListeners(
    execProcess: import("child_process").ChildProcess,
    fullCommand: string
  ) {
    execProcess.stdout.on("data", data => {
      this.customLogger.info(`${data}`);
    });
    execProcess.stderr.on("data", data => {
      this.customLogger.error(`${data}`);
    });
    execProcess.on("close", code => {
      this.customLogger.info(`${fullCommand} exited with code ${code}`);
    });
  }

  private getCommandEnv(): NodeJS.ProcessEnv {
    const env = process.env;
    // https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_cli_env_variables.htm

    // Return everything has JSON.
    env["SFDX_CONTENT_TYPE"] = "JSON";

    //  Specify this variable when using the CLI with ssh or "headless" in a CI environment.
    env["SFDX_USE_GENERIC_UNIX_KEYCHAIN"] = "true";

    // Disable updates.
    env["SFDX_AUTOUPDATE_DISABLE"] = "true";

    return env;
  }
}
