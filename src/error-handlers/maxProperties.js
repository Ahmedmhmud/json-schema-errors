import * as Instance from "@hyperjump/json-schema/instance/experimental";

/**
 * @import { ErrorHandler, ErrorObject } from "../index.d.ts"
 */

/** @type ErrorHandler */
const maxPropertiesErrorHandler = (normalizedErrors, instance, localization, resolver) => {
  if (!resolver?.getCompiledKeywordValue) {
    throw new Error("Missing resolver.getCompiledKeywordValue in error handler context");
  }

  /** @type ErrorObject[] */
  const errors = [];
  let lowestMaxProperties = Infinity;
  let mostConstrainingLocation = null;
  for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/maxProperties"]) {
    if (normalizedErrors["https://json-schema.org/keyword/maxProperties"][schemaLocation]) {
      continue;
    }

    const maxProperties = /** @type number */ (resolver.getCompiledKeywordValue(schemaLocation));

    if (maxProperties < lowestMaxProperties) {
      lowestMaxProperties = maxProperties;
      mostConstrainingLocation = schemaLocation;
    }
  }
  if (mostConstrainingLocation !== null) {
    errors.push({
      message: localization.getMaxPropertiesErrorMessage(lowestMaxProperties),
      instanceLocation: Instance.uri(instance),
      schemaLocations: [mostConstrainingLocation]
    });
  }

  return errors;
};

export default maxPropertiesErrorHandler;
