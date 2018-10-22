import { CommandExecutioner } from "../../src/core/commandExecutioner";
import { CommandRunner, ICommandRunnerOptions } from "../../src/core/commandRunner";
import { EOL, platform } from "os";
import exec from "child_process";

describe("Can create commands", () => {
  it("CommandExecutioner is instantiable", () => {
    let commandRunner = new CommandRunner();
    expect(new CommandExecutioner(commandRunner)).toBeInstanceOf(CommandExecutioner);
  });
});

describe("Can return the output of the command", () => {
  it("Should be able to echo a simple message", async () => {
    let fakeInfo = jest.fn();
    const mockedCommandRunnerOptions: ICommandRunnerOptions = {
      sfdxPath: "",
      useLiveLog: true,
      customLogger: { info: fakeInfo, error: jest.fn() }
    };
    let commandRunner = new CommandRunner(mockedCommandRunnerOptions);
    expect(await commandRunner.runCommand("echo boop")).toBe("boop" + EOL);
    expect(fakeInfo).toBeCalledWith("boop" + EOL);
  });

  it("Should not fail if there's only warning in the stderr", async () => {
    let fakeInfo = jest.fn();
    const mockedCommandRunnerOptions: ICommandRunnerOptions = {
      sfdxPath: "",
      useLiveLog: false
    };
    let commandRunner = new CommandRunner(mockedCommandRunnerOptions);
    // warningTest.js is a simple Node two stringified JSON, one into stdout, the other into stderr.
    let commandResult = JSON.parse(await commandRunner.runCommand("node test/warningTest.js"));
    expect(commandResult).toHaveProperty(["warnings"]);
    expect(commandResult).toHaveProperty(["result"]);
  });

  it("Should fail if there's something else or more than a warning in the stderr", async () => {
    let fakeInfo = jest.fn();
    const mockedCommandRunnerOptions: ICommandRunnerOptions = {
      sfdxPath: "",
      useLiveLog: false
    };
    let commandRunner = new CommandRunner(mockedCommandRunnerOptions);
    let payload = `{ "warnings": ["boop", "beep", "bop"], "errors": 42 }`;
    expect(commandRunner.runCommand(`>&2 echo ${formatJsonString(payload)}`)).rejects.toEqual(
      payload + EOL
    );
  });
});

/**
 * Replace " by \\" if not on win32 so it can be properly interpreted on bash.
 * @param jsonString readable/ps stringified JSON .
 */
function formatJsonString(jsonString: string) {
  return platform() === "win32" ? jsonString : jsonString.replace(/"/g, '\\"');
}
