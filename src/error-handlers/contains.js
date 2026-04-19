import * as Instance from "@hyperjump/json-schema/instance/experimental";
import { getCompiledKeywordValue, getSiblingKeywordLocation } from "../json-schema-errors.js";

/**
 * @import { ContainsRange, ErrorHandler, ErrorObject } from "../index.d.ts"
 */

/** @type ErrorHandler */
const containsErrorHandler = (normalizedErrors, instance, localization, ast) => {
  /** @type ErrorObject[] */
  const errors = [];

  const keywordUris = [
    "https://json-schema.org/keyword/contains",
    "https://json-schema.org/keyword/draft-06/contains"
  ];

  for (const keywordUri of keywordUris) {
    for (const schemaLocation in normalizedErrors[keywordUri]) {
      if (normalizedErrors[keywordUri][schemaLocation] == true) {
        continue;
      }

      /** @type string[] */
      const schemaLocations = [schemaLocation];

      const containsRange = /** @type {ContainsRange} */ (getCompiledKeywordValue(ast, schemaLocation));

      /** @type ContainsRange */
      const range = {};
      const minContains = getSiblingKeywordLocation(ast, schemaLocation, "https://json-schema.org/keyword/minContains");
      if (minContains) {
        range.minContains = containsRange.minContains;
        schemaLocations.push(minContains);
      }

      const maxContains = getSiblingKeywordLocation(ast, schemaLocation, "https://json-schema.org/keyword/maxContains");
      if (maxContains) {
        range.maxContains = containsRange.maxContains;
        schemaLocations.push(maxContains);
      }

      errors.push({
        message: localization.getContainsErrorMessage(range),
        instanceLocation: Instance.uri(instance),
        schemaLocations: schemaLocations
      });
    }
  }

  return errors;
};

export default containsErrorHandler;
