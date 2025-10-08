export function renderTemplate(template, variables) {
  if (typeof template !== "string" || !template) {
    return "";
  }

  return template.replace(/{{\s*([\w.-]+)\s*}}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(variables, key)) {
      const value = variables[key];
      if (value === null || value === undefined) {
        return "";
      }
      return String(value);
    }

    return match;
  });
}
