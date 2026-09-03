const TOKEN = /\{([A-Za-z0-9_]+)\}/g;
const OPTIONAL_GROUP = /\[([^\]]*)\]/g;

/** Horizontal whitespace, including the non-breaking space. */
const HORIZONTAL_SPACE = /[ \t ]+/g;

/** Characters that are meaningless at a line boundary once fields drop out. */
const EDGE = /^[\s,;、\-/]+|[\s,;、\-/]+$/g;

/** Repeated separators left behind by an empty field. */
const REPEATED_SEPARATOR = /([,;、])(?:\s*[,;、])+/g;

function substitute(template: string, values: Readonly<Record<string, string>>): string {
  return template.replace(TOKEN, (_match, key: string) => values[key] ?? '');
}

function hasAnyValue(template: string, values: Readonly<Record<string, string>>): boolean {
  TOKEN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TOKEN.exec(template)) !== null) {
    const key = match[1];
    if (key !== undefined && values[key]) {
      TOKEN.lastIndex = 0;
      return true;
    }
  }
  return false;
}

/**
 * Removes the punctuation an absent field leaves behind, so `'{ward}, {district}'`
 * renders as `'P.Ben Thanh'` rather than `'P.Ben Thanh, '`.
 */
function tidy(line: string): string {
  return line
    .replace(HORIZONTAL_SPACE, ' ')
    .replace(REPEATED_SEPARATOR, '$1')
    .replace(/\s*,\s*/g, ', ')
    .replace(EDGE, '')
    .trim();
}

/**
 * Renders one address line template.
 *
 * - `{field}` is replaced by its value, or by nothing when absent.
 * - `[ ... ]` is an optional group: it is dropped entirely unless at least one
 *   field inside it has a value, which is what keeps literals such as the
 *   Japanese postal marker from surviving on their own.
 */
export function renderLine(
  template: string,
  values: Readonly<Record<string, string>>,
): string {
  const expanded = template.replace(OPTIONAL_GROUP, (_match, inner: string) =>
    hasAnyValue(inner, values) ? substitute(inner, values) : '',
  );
  return tidy(substitute(expanded, values));
}
