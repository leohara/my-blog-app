/**
 * Focus management utilities for improved accessibility
 */

/**
 * Trap focus within a specified element
 * Useful for modals, dialogs, and dropdown menus
 */
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])',
  );

  const firstFocusableElement = focusableElements[0];
  const lastFocusableElement = focusableElements[focusableElements.length - 1];

  // Focus first element
  firstFocusableElement?.focus();

  function handleKeyDown(e: KeyboardEvent) {
    const isTabPressed = e.key === "Tab";

    if (!isTabPressed) {
      return;
    }

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusableElement) {
        lastFocusableElement?.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusableElement) {
        firstFocusableElement?.focus();
        e.preventDefault();
      }
    }
  }

  element.addEventListener("keydown", handleKeyDown);

  return () => {
    element.removeEventListener("keydown", handleKeyDown);
  };
}

/**
 * Restore focus to a previously focused element
 * Useful when closing modals or dropdowns
 */
export function restoreFocus(element: HTMLElement | null) {
  if (element && typeof element.focus === "function") {
    element.focus();
  }
}

/**
 * Get the currently focused element
 */
export function getFocusedElement(): HTMLElement | null {
  return document.activeElement as HTMLElement;
}

/**
 * Move focus to the next focusable element
 */
export function focusNext() {
  const focusableElements = Array.from(
    document.querySelectorAll<HTMLElement>(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])',
    ),
  );

  const currentIndex = focusableElements.indexOf(
    document.activeElement as HTMLElement,
  );
  const nextIndex = (currentIndex + 1) % focusableElements.length;

  const nextElement = focusableElements.at(nextIndex);
  nextElement?.focus();
}

/**
 * Move focus to the previous focusable element
 */
export function focusPrevious() {
  const focusableElements = Array.from(
    document.querySelectorAll<HTMLElement>(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])',
    ),
  );

  const currentIndex = focusableElements.indexOf(
    document.activeElement as HTMLElement,
  );
  const previousIndex =
    currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;

  const previousElement = focusableElements.at(previousIndex);
  previousElement?.focus();
}

/**
 * Skip to main content
 * Used by skip navigation links
 */
export function skipToMain() {
  const mainContent = document.getElementById("main-content");
  if (mainContent) {
    mainContent.focus();
    mainContent.scrollIntoView();
  }
}
