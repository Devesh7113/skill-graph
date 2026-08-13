function toNative(value) {
  if (value === null || value === undefined) return value;

  if (typeof value.toNumber === "function") {
    return value.toNumber();
  }

  if (Array.isArray(value)) {
    return value.map(toNative);
  }

  if (value.properties) {
    return {
      identity: value.identity && typeof value.identity.toNumber === "function" ? value.identity.toNumber() : value.identity,
      labels: value.labels,
      type: value.type,
      properties: toNative(value.properties)
    };
  }

  if (typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, toNative(nested)]));
  }

  return value;
}

function nodeProps(node) {
  if (!node) return null;
  return toNative(node.properties || node);
}

module.exports = { toNative, nodeProps };
