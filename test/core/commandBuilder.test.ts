import { ICommandRunner } from "../../src/core/commandRunner";
import { CommandExecutioner } from "../../src/core/commandExecutioner";
import { Apex } from "../../src/generated/apex";
import { Config } from "../../src/generated/config";
import { Auth } from "../../src/generated/auth";

describe("Can create commands", () => {
  let commandRunnerMock: jest.Mock<ICommandRunner>;
  let commandRunnerMockImpl: ICommandRunner;
  let commandExecutioner: CommandExecutioner;

  // APIs
  let apex: Apex;
  let config: Config;
  let auth: Auth;
  beforeEach(() => {
    commandRunnerMock = jest.fn<ICommandRunner>(() => ({
      runCommand: jest.fn(() => {
        return Promise.resolve("{}");
      })
    }));

    commandRunnerMockImpl = new commandRunnerMock();

    commandExecutioner = new CommandExecutioner(commandRunnerMockImpl);

    apex = new Apex(commandExecutioner);

    config = new Config(commandExecutioner);
    auth = new Auth(commandExecutioner);
  });

  it("Can run class create", () => {
    return apex.classCreate({ classname: "foo" }).then(() => {
      expect(commandRunnerMockImpl.runCommand).toBeCalledWith(
        "force:apex:class:create --classname foo",
        expect.anything()
      );
    });
  });

  it("Can run config set wiht expression", () => {
    return config
      .set({
        expression: [{ key: "key1", value: "value1" }, { key: "key2", value: "value2" }]
      })
      .then(() => {
        expect(commandRunnerMockImpl.runCommand).toBeCalledWith(
          "force:config:set key1=value1 key2=value2",
          expect.anything()
        );
      });
  });

  it("Can run web login with no parameters", () => {
    return auth.webLogin().then(() => {
      expect(commandRunnerMockImpl.runCommand).toBeCalledWith(
        "force:auth:web:login",
        expect.anything()
      );
    });
  });

  it("Can run web login with no parameters", () => {
    return auth.webLogin({ json: true }).then(() => {
      expect(commandRunnerMockImpl.runCommand).toBeCalledWith(
        "force:auth:web:login --json",
        expect.anything()
      );
    });
  });

  it("Can use default options", () => {
    commandExecutioner = new CommandExecutioner(commandRunnerMockImpl, {
      json: true
    });
    auth = new Auth(commandExecutioner);
    return auth.webLogin().then(() => {
      expect(commandRunnerMockImpl.runCommand).toBeCalledWith(
        "force:auth:web:login --json",
        expect.anything()
      );
    });
  });

  it("Can overide default options", () => {
    commandExecutioner = new CommandExecutioner(commandRunnerMockImpl, {
      json: true
    });
    auth = new Auth(commandExecutioner);
    return auth.webLogin({ json: false }).then(() => {
      expect(commandRunnerMockImpl.runCommand).toBeCalledWith(
        "force:auth:web:login",
        expect.anything()
      );
    });
  });
});
