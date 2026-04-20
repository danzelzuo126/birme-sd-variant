(function (global) {
  class JQ {
    constructor(elements) {
      this.elements = elements || [];
      this.length = this.elements.length;
    }

    get(index) {
      return this.elements[index];
    }

    each(callback) {
      this.elements.forEach((el, i) => callback(i, el));
      return this;
    }

    attr(name, value) {
      if (value === undefined) {
        return this.elements[0] ? this.elements[0].getAttribute(name) : undefined;
      }
      return this.each((_, el) => el.setAttribute(name, value));
    }

    removeAttr(name) {
      return this.each((_, el) => el.removeAttribute(name));
    }

    prop(name, value) {
      if (value === undefined) {
        return this.elements[0] ? this.elements[0][name] : undefined;
      }
      return this.each((_, el) => {
        el[name] = value;
      });
    }

    val(value) {
      if (value === undefined) {
        return this.elements[0] ? this.elements[0].value : undefined;
      }
      return this.each((_, el) => {
        el.value = value;
      });
    }

    addClass(cls) {
      const classes = cls.split(/\s+/).filter(Boolean);
      return this.each((_, el) => el.classList.add(...classes));
    }

    removeClass(cls) {
      const classes = cls.split(/\s+/).filter(Boolean);
      return this.each((_, el) => el.classList.remove(...classes));
    }

    append(content) {
      return this.each((_, el) => {
        if (typeof content === "string") {
          el.insertAdjacentHTML("beforeend", content);
        } else if (content instanceof Node) {
          el.appendChild(content);
        } else if (content instanceof JQ) {
          content.elements.forEach(child => el.appendChild(child));
        }
      });
    }

    siblings() {
      const out = [];
      this.each((_, el) => {
        if (!el.parentElement) return;
        Array.from(el.parentElement.children).forEach(child => {
          if (child !== el && !out.includes(child)) out.push(child);
        });
      });
      return new JQ(out);
    }

    css(nameOrObj, value) {
      if (typeof nameOrObj === "string" && value === undefined) {
        if (!this.elements[0]) return undefined;
        return global.getComputedStyle(this.elements[0])[nameOrObj];
      }
      if (typeof nameOrObj === "string") {
        return this.each((_, el) => {
          el.style[nameOrObj] = value;
        });
      }
      return this.each((_, el) => {
        Object.entries(nameOrObj).forEach(([k, v]) => {
          el.style[k] = v;
        });
      });
    }

    parent() {
      const out = this.elements.map(el => el.parentElement).filter(Boolean);
      return new JQ(out);
    }

    next() {
      const out = this.elements.map(el => el.nextElementSibling).filter(Boolean);
      return new JQ(out);
    }

    children(selector) {
      let out = [];
      this.each((_, el) => {
        out = out.concat(Array.from(el.children));
      });
      if (selector) {
        out = out.filter(el => el.matches(selector));
      }
      return new JQ(out);
    }

    closest(selector) {
      const out = this.elements.map(el => el.closest(selector)).filter(Boolean);
      return new JQ(out);
    }

    data(key, value) {
      if (!this.elements[0]) return undefined;
      if (!this.elements[0].__jqData) this.elements[0].__jqData = {};
      if (value === undefined) {
        return this.elements[0].__jqData[key];
      }
      return this.each((_, el) => {
        if (!el.__jqData) el.__jqData = {};
        el.__jqData[key] = value;
      });
    }

    on(eventName, handler) {
      return this.each((_, el) => {
        if (!el.__jqHandlers) el.__jqHandlers = {};
        if (!el.__jqHandlers[eventName]) el.__jqHandlers[eventName] = new Map();
        const wrapped = function (event) {
          return handler.call(el, event);
        };
        el.__jqHandlers[eventName].set(handler, wrapped);
        el.addEventListener(eventName, wrapped);
      });
    }

    off(eventName) {
      return this.each((_, el) => {
        if (!el.__jqHandlers || !el.__jqHandlers[eventName]) return;
        el.__jqHandlers[eventName].forEach(wrapped => {
          el.removeEventListener(eventName, wrapped);
        });
        el.__jqHandlers[eventName].clear();
      });
    }

    trigger(eventName) {
      return this.each((_, el) => {
        el.dispatchEvent(new Event(eventName, { bubbles: true }));
      });
    }

    slideUp() {
      return this.each((_, el) => {
        el.style.display = "none";
      });
    }

    slideDown() {
      return this.each((_, el) => {
        el.style.display = "block";
      });
    }

    offset() {
      if (!this.elements[0]) return { top: 0, left: 0 };
      const r = this.elements[0].getBoundingClientRect();
      return { top: r.top + global.scrollY, left: r.left + global.scrollX };
    }

    height() {
      if (!this.elements[0]) return 0;
      return this.elements[0].offsetHeight;
    }

    scrollTop(value) {
      if (!this.elements[0]) return 0;
      if (value === undefined) {
        return this.elements[0] === global || this.elements[0] === document ? global.scrollY : this.elements[0].scrollTop;
      }
      return this.each((_, el) => {
        if (el === global || el === document || el === document.documentElement || el === document.body) {
          global.scrollTo(global.scrollX, value);
        } else {
          el.scrollTop = value;
        }
      });
    }

    animate(props) {
      if (props && Object.prototype.hasOwnProperty.call(props, "scrollTop")) {
        this.scrollTop(props.scrollTop);
      }
      return this;
    }

    detach() {
      return this.each((_, el) => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
    }
  }

  function $(selectorOrEl) {
    if (selectorOrEl instanceof JQ) return selectorOrEl;
    if (selectorOrEl == null) return new JQ([]);
    if (selectorOrEl === global || selectorOrEl === document) return new JQ([selectorOrEl]);
    if (typeof selectorOrEl === "string") {
      return new JQ(Array.from(document.querySelectorAll(selectorOrEl)));
    }
    if (selectorOrEl instanceof NodeList || Array.isArray(selectorOrEl)) {
      return new JQ(Array.from(selectorOrEl));
    }
    return new JQ([selectorOrEl]);
  }

  $.isEmptyObject = function (obj) {
    return !obj || Object.keys(obj).length === 0;
  };

  global.$ = $;
})(window);
