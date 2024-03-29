import { updateProps } from "./reconciler";
import { PLACEMENT, UPDATE } from "../type";

export const commitDelete = (fiber) => {
  if (fiber.dom) {
    let parentFiber = fiber.parent;
    while (!parentFiber.dom) {
      parentFiber = parentFiber.parent;
    }
    parentFiber.dom.removeChild(fiber.dom);
  } else {
    commitDelete(fiber.child);
  }
};

// 递归挂载dom
export const commitWork = (fiber) => {
  if (!fiber) return;
  let parentFiber = fiber.parent;

  while (!parentFiber.dom) {
    parentFiber = parentFiber.parent;
  }

  if (fiber.effectTag === UPDATE) {
    updateProps(fiber.dom, fiber.props, fiber.alternate?.props);
  } else if (fiber.effectTag === PLACEMENT && fiber.dom) {
    parentFiber.dom.append(fiber.dom);
  }

  commitWork(fiber.sibling);
  commitWork(fiber.child);
};
