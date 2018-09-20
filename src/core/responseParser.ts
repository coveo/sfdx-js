import * as _ from "underscore";

export class ResponseParser {
  public parse<T>(response: string | undefined = ""): T | string | undefined {
    // For now it's realllly easy, but maybe someday we'll have to remove some stuff or handle more complex stuff.
    let returnValue: T | string;
    response = this.sanitizeResponse(response);

    // If the response is blank, it means there is nothing to parse. Return undefined.
    if (_.isEmpty(response)) {
      return undefined;
    }

    try {
      returnValue = JSON.parse(response);
    } catch (e) {
      console.log("Cannot parse:'" + response + "' as JSON. Exception:" + e);
      returnValue = response;
    }

    return returnValue;
  }

  private sanitizeResponse(response: string) {
    if (_.isEmpty(response)) {
      return response;
    }

    // Remove non json message when installing plugin.
    response = response.replace("Installing required plugins for force... done", "");

    // Remove leading blank spaces, space character and new lines.
    return response.replace(/^([\s\r\n]+)/, "");
  }
}
