import Ember from 'ember';
import prettify from './prettify';

/*global DOMPurify, CSSRule*/

function addToSet(set, array) {
    var l = array.length;
    while (l--) {
        set[array[l]] = true;
    }
    return set;
}

// Derived from https://github.com/jmapio/jmap-demo-webmail/blob/master/app/drawHTML.js
var ALLOWED_CSS_PROPERTY = addToSet( {}, [
  // Background
  'background',
  'background-',
  // e.g.
  // 'background-attachment',
  // 'background-clip',
  // 'background-color',
  // 'background-image',
  // 'background-origin',
  // 'background-position',
  // 'background-position-x',
  // 'background-position-y',
  // 'background-repeat',
  // 'background-repeat-x',
  // 'background-repeat-y',
  // 'background-size',

  // Border
  'border',
  'border-',
  // e.g.
  // 'border-bottom',
  // 'border-bottom-color',
  // 'border-bottom-left-radius',
  // 'border-bottom-right-radius',
  // 'border-bottom-style',
  // 'border-bottom-width',
  // 'border-collapse',
  // 'border-color',
  // 'border-image',
  // 'border-image-outset',
  // 'border-image-repeat',
  // 'border-image-slice',
  // 'border-image-source',
  // 'border-image-width',
  // 'border-left',
  // 'border-left-color',
  // 'border-left-style',
  // 'border-left-width',
  // 'border-radius',
  // 'border-right',
  // 'border-right-color',
  // 'border-right-style',
  // 'border-right-width',
  // 'border-spacing',
  // 'border-style',
  // 'border-top',
  // 'border-top-color',
  // 'border-top-left-radius',
  // 'border-top-right-radius',
  // 'border-top-style',
  // 'border-top-width',
  // 'border-width',

  // Outline
  'outline',
  'outline-',
  // e.g.
  // 'outline-width',
  // 'outline-style',
  // 'outline-color',
  // 'outline-offset',

  // Margins and padding
  'margin',
  'margin-',
  // e.g.
  // 'margin-top',
  // 'margin-right',
  // 'margin-bottom',
  // 'margin-left',
  'padding',
  'padding-',
  // e.g.
  // 'padding-top',
  // 'padding-right',
  // 'padding-bottom',
  // 'padding-left',

  // Lists
  'list-style',
  'list-style-type',
  'list-style-image',
  'list-style-position',

  // Font
  'font',
  'font-',
  // e.g.
  // 'font-family',
  // 'font-style',
  // 'font-variant',
  // 'font-weight',
  // 'font-size',

  // Colour
  'color',
  'opacity',

  // Text formatting
  'direction',
  'letter-spacing',
  'line-break',
  'line-height',
  'overflow-wrap',
  'text-',
  // e.g.
  // 'text-align',
  // 'text-decoration',
  // 'text-indent',
  // 'text-overflow',
  // 'text-transform',
  'vertical-align',
  'white-space',
  'word-spacing',
  'word-wrap',
  'word-break',

  // Layout
  'display',
  'position',
  'visibility',
  'overflow',
  'overflow-x',
  'overflow-y',
  'z-index',
  'zoom',
  'top',
  'right',
  'bottom',
  'left',
  'width',
  'height',
  'min-width',
  'min-height',
  'max-width',
  'max-height',
  'float',
  'clear',
  'clip',
  'clip-path',
  /*'cursor',*/
  'object-fit',
  'object-position',

  // Tables
  'border-collapse',
  'border-spacing',
  'caption-side',
  'empty-cells',
  'table-layout',

  // Quotes
  'content',
  /*'counter-increment',*/
  /*'counter-reset',*/
  'quotes',

  // Printing
  'orphans',
  'page-break-after',
  'page-break-before',
  'page-break-inside',
  'widows',

  // Shadows
  'box-shadow',
  'text-shadow',

  // Transform
  'transform',
  'transform-origin',
  'transform-style',
  'perspective',
  'perspective-origin',

  // Flexbox
  'align-',
  // e.g.
  // 'align-content',
  // 'align-items',
  // 'align-self',
  'flex',
  'flex-',
  // e.g.
  // 'flex-basis',
  // 'flex-direction',
  // 'flex-flow',
  // 'flex-grow',
  // 'flex-shrink',
  // 'flex-wrap',
  'justify-content',
  'order',

  // Columns
  'columns',
  'column-'
  // e.g.
  // 'column-count',
  // 'column-fill',
  // 'column-gap',
  // 'column-rule',
  // 'column-rule-color',
  // 'column-rule-style',
  // 'column-rule-width',
  // 'column-span',
  // 'column-width'
]);

var FORBID_TAGS = [
  'audio',
  'blink',
  'decorator',
  'element',
  'marquee',
  'template',
  'video',
  'iframe',
  'embed'
];

var FORBID_ATTR = [
  'action',
  'method',
  'tabindex',
  'xmlns'
];

/**
 * Returns if a property is whitelisted. Prefixes and shorthand names
 * will be resolved.
 * @param {String} property
 * @return {Boolean}
 */
function isAllowedProperty(property) {
  var unprefixed = property.charAt(0) === '-' ?
      property.slice(property.indexOf('-', 1) + 1) : property;

  var shorthand = unprefixed.slice(0, unprefixed.indexOf('-') + 1);

  return ALLOWED_CSS_PROPERTY[unprefixed] || ALLOWED_CSS_PROPERTY[shorthand];
}

/**
 * Sanitize selectors by reparenting them under a new root container,
 * which is referred to by rootId.
 * @param {String} rootId
 * @param {String} selector
 * @return {String}
 */
function sanitizeSelector(rootId, selector) {
  // For each comma-separated selector
  return selector.split(',').map(function (selector) {
    // Remove mentions of `html` or `body`. They shall be replaced by #rootId
    // FIXME: Content might not render well with `html > body`.
    selector = selector.replace(/^(?:html|body)(?!\w)/i, '');
    // Start each selector with #rootId, and prefix each mention of id/class/for
    // with rootId to narrow the scope.
    return '#' + rootId + ' ' + selector.replace(
      /([#.]|\[\s*(?:id|class|for)\s*[~|^]?=\s*["'])/gi,
      rootId + '-'
    );
  }).join(',');
}

/**
 * Transforms a style rule into a permitted form.
 * @param {String} rootId
 * @param {CSSStyleDeclaration} style
 * @return {String}
 */
function sanitizeStyle(rootId, style) {
  var output = '';

  for (let i = 0; i < style.length; i += 1) {
    let name = style[i],
        value = style.getPropertyValue(name),
        important = style.getPropertyPriority(name);

    if (value && isAllowedProperty(name)) {
      // Whitelist allowed `position` values
      if (name === 'position') {
        if (value === 'fixed') {
          value = 'absolute';
        }
        if (!/^(?:absolute|relative|static)$/.test(value)) {
          continue;
        }
      }

      output += name + ':' + value + (important ? ' !important' : '') + ';';
    }
  }

  return output;
}

/**
 * Recursively traverse a stylesheet and it's media queries, sanitizing its
 * selectors and styles.
 * @param {String} rootId
 * @param {CSSStyleSheet} sheet
 */
function sanitizeStylesheet(rootId, sheet, output) {
  var rules = sheet.cssRules;

  // In case of an already empty stylesheet, do nothing
  if (!rules) {
    return output;
  }

  for (let i = 0; i < rules.length; i += 1) {
    var rule = rules[i];

    switch (rule.type) {
      case CSSRule.STYLE_RULE:
        output.push(sanitizeSelector(rootId, rule.selectorText || ''));
        output.push('{');
        output.push(sanitizeStyle(rootId, rule.style));
        output.push('}\n');
        break;
      case CSSRule.MEDIA_RULE:
        output.push('@media ' + rule.media.mediaText);
        output.push('{\n');
        output.push(sanitizeStylesheet(rootId, rule, output));
        output.push('}\n');
        break;
    }
  }

  return output;
}

function attachSanitizerHooks(rootId) {
  function uponSanitizeElement(node, data) {
    if (data.tagName.toLowerCase() === 'style') {
      node.textContent = sanitizeStylesheet(rootId, node.sheet, []).join('');
    }
  }

  function uponSanitizeAttribute(node, data) {
    var name = data.attrName,
        value = data.attrValue;

    switch (name) {
      case 'style':
        data.attrValue = sanitizeStyle(rootId, node.style);
        break;
      case 'id':
      case 'for':
        data.attrValue = rootId + '-' + value;
        break;
      case 'class':
        data.attrValue = value.trim().split(/\s+/)
          .map(className => (rootId + '-' + className)).join(' ');
    }
  }

  function afterSanitizeAttributes(node) {
    if (node.tagName.toLowerCase() === 'a') {
      node.rel = 'noreferrer';
      node.target = '_blank';
    }
  }

  DOMPurify.addHook('uponSanitizeElement', uponSanitizeElement);
  DOMPurify.addHook('uponSanitizeAttribute', uponSanitizeAttribute);
  DOMPurify.addHook('afterSanitizeAttributes', afterSanitizeAttributes);
}

function detachSanitizerHooks() {
  DOMPurify.removeHook('uponSanitizeElement');
  DOMPurify.removeHook('uponSanitizeAttribute');
  DOMPurify.removeHook('afterSanitizeAttributes');
}

export function sanitize(params) {
  var message = params[0],
      contents = prettify.compute([message.htmlBody || message.textBody]),
      containerId = 'restricted',
      container;

  if (!message.htmlBody) {
    container = document.createElement('pre');
    container.textContent = contents;
  } else {
    attachSanitizerHooks(containerId);
    var documentElement = DOMPurify.sanitize(contents, {
      SANITIZE_DOM: true,
      RETURN_DOM: true,
      WHOLE_DOCUMENT: true,
      ALLOW_DATA_ATTR: false,
      SAFE_FOR_TEMPLATES: true,
      FORBID_TAGS: FORBID_TAGS,
      FORBID_ATTR: FORBID_ATTR
    });
    detachSanitizerHooks();

    // Create a container element to act like a nested "body".
    container = document.createElement('div');
    // Move the sanitized nodes into the real DOM
    documentElement = document.adoptNode(documentElement);
    // Move stylesheets into the container. FIXME: What about non-head styles?
    Array.prototype.slice.call(documentElement.getElementsByTagName('style'))
    .forEach(function (element) {
      container.appendChild(element);
    });
    // Move body contents into the container
    Array.prototype.slice.call(documentElement.lastElementChild.childNodes)
    .forEach(function (element) {
      container.appendChild(element);
    });
  }

  container.id = containerId;
  container.style.cssText = 'z-index: 0';
  return container;
}

export default Ember.Helper.helper(sanitize);
