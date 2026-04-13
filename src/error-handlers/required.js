import * as Instance from "@hyperjump/json-schema/instance/experimental";

/**
 * @import { ErrorHandler } from "../index.d.ts"
 * @import { JsonNode } from "@hyperjump/json-schema/instance/experimental"
 */

/** @type ErrorHandler */
const requiredErrorHandler = (normalizedErrors, instance, localization, resolver) => {
  if (!resolver?.getCompiledKeywordValue) {
    throw new Error("Missing resolver.getCompiledKeywordValue in error handler context");
  }

  /** @type {Set<string>} */
  const allMissingRequired = new Set();
  const allSchemaLocations = [];

  for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/required"]) {
    if (normalizedErrors["https://json-schema.org/keyword/required"][schemaLocation]) {
      continue;
    }

    allSchemaLocations.push(schemaLocation);
    const required = /** @type string[] */ (resolver.getCompiledKeywordValue(schemaLocation));

    addMissingProperties(required, instance, allMissingRequired);
  }

  for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/dependentRequired"]) {
    if (normalizedErrors["https://json-schema.org/keyword/dependentRequired"][schemaLocation]) {
      continue;
    }

    allSchemaLocations.push(schemaLocation);
    const dependencies = /** @type {[string, string[]][]} */ (resolver.getCompiledKeywordValue(schemaLocation));

    for (const [propertyName, requiredProperties] of dependencies) {
      if (!Instance.has(propertyName, instance)) {
        continue;
      }
      addMissingProperties(requiredProperties, instance, allMissingRequired);
    }
  }

  for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/draft-04/dependencies"]) {
    if (typeof normalizedErrors["https://json-schema.org/keyword/draft-04/dependencies"][schemaLocation] === "boolean") {
      continue;
    }

    const dependencies = /** @type {[string, unknown][]} */ (resolver.getCompiledKeywordValue(schemaLocation));

    let hasArrayFormDependencies = false;
    for (const [propertyName, dependency] of dependencies) {
      if (!Instance.has(propertyName, instance) || !Array.isArray(dependency)) {
        continue;
      }

      hasArrayFormDependencies = true;
      const dependencyArray = /** @type {string[]} */ (dependency);
      addMissingProperties(dependencyArray, instance, allMissingRequired);
    }

    if (hasArrayFormDependencies) {
      allSchemaLocations.push(schemaLocation);
    }
  }

  if (allMissingRequired.size === 0) {
    return [];
  }

  return [{
    message: localization.getRequiredErrorMessage([...allMissingRequired]),
    instanceLocation: Instance.uri(instance),
    schemaLocations: /** @type {string[]} */ ([...allSchemaLocations])
  }];
};

/** @type (requiredProperties: string[], instance: JsonNode, missingSet: Set<string>) => void */
const addMissingProperties = (requiredProperties, instance, missingSet) => {
  for (const propertyName of requiredProperties) {
    if (!Instance.has(propertyName, instance)) {
      missingSet.add(propertyName);
    }
  }
};

export default requiredErrorHandler;
