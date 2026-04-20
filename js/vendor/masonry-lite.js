(function (global) {
  class Masonry {
    constructor(selector) {
      this.container = typeof selector === "string" ? document.querySelector(selector) : selector;
    }

    appended() {
      this.layout();
    }

    layout() {
      // CSS-driven layout; no JS placement required.
    }

    remove(element) {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }
  }

  global.Masonry = Masonry;
})(window);
