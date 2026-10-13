import { useEffect, useState } from "react";

type Direction = "up" | "down" | "left" | "right";

const FOCUSABLE_SELECTOR = [
  "button:not(:disabled)",
  "a[href]",
  "input:not(:disabled)",
  "select:not(:disabled)",
  "textarea:not(:disabled)",
  '[tabindex="0"]',
].join(",");

function getTopmostModal(): HTMLElement | null {
  const modals = document.querySelectorAll<HTMLElement>(
    ".modal.show, .metrics-modal.show",
  );
  return modals.item(modals.length - 1) ?? null;
}

function getFocusableElements(scope: ParentNode): HTMLElement[] {
  return Array.from(scope.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter((element) => {
      const style = window.getComputedStyle(element);
      return (
        style.visibility !== "hidden" &&
        style.display !== "none" &&
        element.getClientRects().length > 0
      );
    });
}

function focusElement(element: HTMLElement): void {
  document
    .querySelectorAll(".gamepad-focus")
    .forEach((focused) => focused.classList.remove("gamepad-focus"));
  element.focus();
  element.classList.add("gamepad-focus");
}

function moveFocus(direction: Direction): void {
  const scope: ParentNode = getTopmostModal() ?? document;
  const elements = getFocusableElements(scope);
  if (elements.length === 0) return;

  const activeElement = document.activeElement;
  const current =
    activeElement instanceof HTMLElement && elements.includes(activeElement)
      ? activeElement
      : null;
  if (!current) {
    focusElement(elements[0]);
    return;
  }

  const currentRect = current.getBoundingClientRect();
  const currentX = currentRect.left + currentRect.width / 2;
  const currentY = currentRect.top + currentRect.height / 2;
  const candidates = elements
    .filter((element) => element !== current)
    .map((element) => {
      const rect = element.getBoundingClientRect();
      const dx = rect.left + rect.width / 2 - currentX;
      const dy = rect.top + rect.height / 2 - currentY;
      const primary =
        direction === "left"
          ? -dx
          : direction === "right"
            ? dx
            : direction === "up"
              ? -dy
              : dy;
      const secondary =
        direction === "left" || direction === "right" ? Math.abs(dy) : Math.abs(dx);
      return { element, primary, secondary };
    })
    .filter((candidate) => candidate.primary > 1)
    .sort(
      (first, second) =>
        first.primary +
        first.secondary * 1.8 -
        (second.primary + second.secondary * 1.8),
    );

  const next =
    candidates[0]?.element ??
    (direction === "left" || direction === "up"
      ? elements[elements.length - 1]
      : elements[0]);

  focusElement(next);
}

function adjustFocusedRange(direction: Direction): boolean {
  const active = document.activeElement;
  if (
    !(active instanceof HTMLInputElement) ||
    active.type !== "range" ||
    (direction !== "left" && direction !== "right")
  ) {
    return false;
  }

  const step = active.step === "any" ? 0.01 : Number(active.step || 1);
  const minimum = Number(active.min || 0);
  const maximum = Number(active.max || 100);
  const current = Number(active.value);
  const value = Math.max(
    minimum,
    Math.min(maximum, current + (direction === "right" ? step : -step)),
  );
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;
  setter?.call(active, String(value));
  active.dispatchEvent(new Event("input", { bubbles: true }));
  active.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function activateFocusedElement(): void {
  const active =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  const target = active ?? getFocusableElements(getTopmostModal() ?? document)[0];
  if (!target) return;

  const wasNewsCard = target.matches(".news-item");
  const newsList = wasNewsCard ? target.closest(".news-list") : null;
  const previousIndex = newsList
    ? Array.from(newsList.querySelectorAll<HTMLElement>(".news-item")).indexOf(
        target,
      )
    : -1;

  target.click();

  if (wasNewsCard && newsList) {
    requestAnimationFrame(() => {
      const nextCards = getFocusableElements(newsList).filter((element) =>
        element.matches(".news-item"),
      );
      const next = nextCards[Math.min(previousIndex, nextCards.length - 1)];
      if (next) focusElement(next);
    });
  }
}

function goBack(): void {
  const modal = getTopmostModal();
  if (!modal) return;

  const closeButton = modal.querySelector<HTMLElement>(".close-modal-btn");
  const continueButton = modal.querySelector<HTMLElement>(
    ".metrics-modal-actions button",
  );
  (closeButton ?? continueButton)?.click();
}

export function useGamepadControls(): boolean {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!navigator.getGamepads) return;

    let pollIntervalId = 0;
    let isConnected = false;
    let previousButtons: boolean[] = [];
    let previousModal: HTMLElement | null = null;
    let returnFocus: HTMLElement | null = null;
    let activeDirection: Direction | null = null;
    let nextNavigationAt = 0;
    let lastGamepadConnected = false;

    const poll = (time: number) => {
      const gamepad = Array.from(navigator.getGamepads()).find(
        (item): item is Gamepad => Boolean(item?.connected),
      );
      isConnected = Boolean(gamepad);
      const justConnected = isConnected && !lastGamepadConnected;
      if (isConnected !== lastGamepadConnected) {
        lastGamepadConnected = isConnected;
        setConnected(isConnected);
      }

      const modal = getTopmostModal();
      if (modal !== previousModal) {
        if (modal) {
          returnFocus =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
          if (isConnected) {
            const firstFocusable = getFocusableElements(modal)[0];
            if (firstFocusable) focusElement(firstFocusable);
          }
        } else if (previousModal && returnFocus?.isConnected && isConnected) {
          focusElement(returnFocus);
        }
        previousModal = modal;
      } else if (justConnected && modal) {
        const firstFocusable = getFocusableElements(modal)[0];
        if (firstFocusable) focusElement(firstFocusable);
      }

      if (gamepad) {
        const buttonPressed = (index: number) => {
          const button = gamepad.buttons[index];
          return Boolean(button?.pressed || (button?.value ?? 0) > 0.5);
        };
        const justPressed = (index: number) =>
          buttonPressed(index) && !previousButtons[index];
        const directions: Array<[number, Direction]> = [
          [12, "up"],
          [13, "down"],
          [14, "left"],
          [15, "right"],
        ];
        const dpadDirection = directions.find(([index]) => buttonPressed(index))
          ?.[1];
        const [xAxis = 0, yAxis = 0] = gamepad.axes;
        const direction =
          dpadDirection ??
          (Math.abs(xAxis) > 0.55
            ? xAxis < 0
              ? "left"
              : "right"
            : Math.abs(yAxis) > 0.55
              ? yAxis < 0
                ? "up"
                : "down"
              : null);

        if (
          direction &&
          (direction !== activeDirection || time >= nextNavigationAt)
        ) {
          if (!adjustFocusedRange(direction)) moveFocus(direction);
          activeDirection = direction;
          nextNavigationAt = time + 240;
        } else if (!direction) {
          activeDirection = null;
        }

        if (justPressed(0)) activateFocusedElement();
        if (justPressed(1)) goBack();
        if (!modal && justPressed(2)) {
          document.querySelector<HTMLElement>("#clear-btn")?.click();
        }
        if (!modal && justPressed(3)) {
          document
            .querySelector<HTMLElement>("#publish-btn:not(:disabled)")
            ?.click();
        }

        previousButtons = gamepad.buttons.map((button) => button.pressed);
      } else {
        previousButtons = [];
        activeDirection = null;
      }

    };

    const onConnected = () => {
      if (!isConnected) setConnected(true);
    };
    const onDisconnected = () => {
      if (!navigator.getGamepads().some((item) => item?.connected)) {
        setConnected(false);
      }
    };

    window.addEventListener("gamepadconnected", onConnected);
    window.addEventListener("gamepaddisconnected", onDisconnected);
    poll(performance.now());
    pollIntervalId = window.setInterval(
      () => poll(performance.now()),
      50,
    );

    return () => {
      window.clearInterval(pollIntervalId);
      window.removeEventListener("gamepadconnected", onConnected);
      window.removeEventListener("gamepaddisconnected", onDisconnected);
    };
  }, []);

  return connected;
}
