// @vitest-environment jsdom

import "vi-fetch/setup";
import { describe, it, expect } from "vitest";
import GCS from "../lib/gcs.js";
import ToolKit from "../lib/toolkit.js";
const toolKit = new ToolKit();
import crypto from "crypto";

("use strict");

describe("[GCS] getAccessToken VALID TEST", () => {
  const params = {
    clientId: "clientId",
    redirectUrl: "http://localhost:3000",
    scope: "https://www.googleapis.com/auth/devstorage.read_only",
  };
  const sut = new GCS(toolKit);
  sut.setCred(params);

  it("location has hash and access_token", () => {
    //location mock
    global.window = Object.create(window);
    const url = "http://localhost";
    const dummyToken = crypto
      .randomBytes(160)
      .toString("hex")
      .substring(0, 160);
    const dummyJoint = crypto.randomBytes(4).toString("hex").substring(0, 4);

    const accessTokenStatement = `&access_token=${dummyJoint}.${dummyToken}`;
    const tokenTypeStatement = "&token_type=Bearer";
    const expiresInStatement = "&expires_in=1000";
    const scopeStatement =
      "&scope=https://www.googleapis.com/auth/devstorage.read_only";
    Object.defineProperty(window, "location", {
      value: {
        href:
          `${url}/#state=pass-through%20value` +
          accessTokenStatement +
          tokenTypeStatement +
          expiresInStatement +
          scopeStatement,
        hash:
          `#state=pass-through%20value` +
          accessTokenStatement +
          tokenTypeStatement +
          expiresInStatement +
          scopeStatement,
        configurable: true,
      },
      configurable: true,
    });
    const actual = sut.getAccessToken(window.location);
    expect(actual).toStrictEqual({ token: `${dummyJoint}.${dummyToken}` });
  });

  it("location has hash but it does not have access_token", () => {
    //location mock
    delete window.location.href;
    delete window.location.hash;
    const url = "http://localhost";
    Object.defineProperty(window, "location", {
      value: {
        href: `${url}/#state=pass-through%20value`,
        hash: "#state=pass-through%20value",
        configurable: true,
      },
      configurable: true,
    });
    const actual = sut.getAccessToken(window.location);
    expect(actual).toStrictEqual({
      token: null,
      message: "This location has no access token info.",
    });
  });

  it("location does not have hash", () => {
    //location mock
    delete window.location.href;
    delete window.location.hash;
    const url = "http://localhost";
    Object.defineProperty(window, "location", {
      value: {
        href: url,
        configurable: true,
      },
      configurable: true,
    });
    const actual = sut.getAccessToken(window.location);
    expect(actual).toStrictEqual({
      token: null,
      message: "This location has no access token info.",
    });
  });

  it("location is an empty Object", () => {
    delete window.location.href;
    delete window.location.hash;
    delete window.location.token;
    delete window.location.configurable;
    const actual = sut.getAccessToken(window.location);
    expect(actual).toStrictEqual({
      token: null,
      message: "This location has no access token info.",
    });
  });
});

describe("[GCS] getAccessToken INVALID TEST", () => {
  const params = {
    clientId: "clientId",
    redirectUrl: "http://localhost:3000",
    scope: "https://www.googleapis.com/auth/devstorage.read_only",
  };
  const sut = new GCS(params, toolKit);
  it("Invalid argument is number", () => {
    expect(() => {
      const actual = sut.getAccessToken(3333);
    }).toThrow(/^You must input location which is Object.$/);
  });

  it("Invalid argument is Boolean", () => {
    expect(() => {
      const actual = sut.getAccessToken(true);
    }).toThrow(/^You must input location which is Object.$/);
  });

  it("Invalid argument is null", () => {
    expect(() => {
      const actual = sut.getAccessToken(null);
    }).toThrow(
      /^The argument is null.You must input location which is Object, not null.$/
    );
  });

  it("Invalid argument is undefined", () => {
    let val;
    expect(() => {
      const actual = sut.getAccessToken(val);
    }).toThrow(/^You must input location which is Object.$/);
  });

  it("Invalid argument is BigInt", () => {
    expect(() => {
      const actual = sut.getAccessToken(BigInt(84728102837495n));
    }).toThrow(/^You must input location which is Object.$/);
  });

  it("Invalid argument is Symbol", () => {
    expect(() => {
      const actual = sut.getAccessToken(Symbol("hoge"));
    }).toThrow(/^You must input location which is Object.$/);
  });

  it("Invalid argument is String", () => {
    expect(() => {
      const actual = sut.getAccessToken("hogehoge");
    }).toThrow(/^You must input location which is Object.$/);
  });
});
