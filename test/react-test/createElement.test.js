import { it, expect, describe } from "vitest";

import { createElement } from "../../core/react";
import { TEXT_ELEMENT } from "../../core/type";

describe("createElement", () => {
  it("createElement should return vDom", () => {
    const el = createElement("div", { id: "div" }, "root");

    expect(el).toEqual({
      type: "div",
      props: {
        id: "div",
        children: [
          {
            type: TEXT_ELEMENT,
            props: {
              nodeValue: "root",
            },
          },
        ],
      },
    });
  });
});
