import { it, expect, describe } from "vitest";

import { createTextNode } from "../../core/react";
import { TEXT_ELEMENT } from "../../core/type";

describe("createTextNode", () => {
  it("createTextNode should return text", () => {
    const text = createTextNode("text");

    expect(text).toEqual({
      type: TEXT_ELEMENT,
      props: {
        nodeValue: "text",
      },
    });
  });
});
