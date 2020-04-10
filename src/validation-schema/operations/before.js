const { pathTree } = require('./parse-input');

function use(args) {
  const tree = pathTree(args);
  return function(schema, current) {
    const helper = (inTree, inSchema, inCurrent) => {
      Object.keys(inTree).forEach((key) => {
        if (!Object.hasOwnProperty.call(inSchema, key)) {
          throw Error("Some used key didn't exist for ValidationSchema.use()");
        }
        if (Object.keys(inTree[key]).length) {
          if (!Object.hasOwnProperty.call(inCurrent, key)) inCurrent[key] = {};
          return helper(inTree[key], inSchema[key], inCurrent[key]);
        }
        inCurrent[key] = inSchema[key];
      });
    };
    helper(tree, schema, current);
  };
}

function skip(args) {
  const tree = pathTree(args);
  return function(schema, current) {
    const helper = (inTree, inSchema, inCurrent) => {
      Object.keys(inTree).forEach((key) => {
        if (!Object.hasOwnProperty.call(inCurrent, key)) {
          throw Error(
            "Some skipped key didn't exist for ValidationSchema.skip()"
          );
        }
        if (Object.keys(inTree[key]).length) {
          return helper(inTree[key], inSchema[key], inCurrent[key]);
        }
        delete inCurrent[key];
      });
    };
    helper(tree, schema, current);
  };
}

function add(addSchema) {
  return function(_, current) {
    const helper = (inAddSchema, inCurrent) => {
      Object.keys(inAddSchema).forEach((key) => {
        if (
          inAddSchema[key].isJoi ||
          !Object.hasOwnProperty.call(inCurrent, key) ||
          inCurrent[key].isJoi
        ) {
          inCurrent[key] = inAddSchema[key];
          return;
        }
        helper(inAddSchema[key], inCurrent[key]);
      });
    };
    helper(addSchema, current);
  };
}

function concat(concatSchema) {
  return function(_, current) {
    const helper = (inConcatSchema, inCurrent) => {
      Object.keys(inConcatSchema).forEach((key) => {
        if (!Object.hasOwnProperty.call(inCurrent, key)) {
          inCurrent[key] = inConcatSchema[key];
          return;
        }
        if (inConcatSchema[key].isJoi) {
          if (!inCurrent[key].isJoi) {
            throw Error(
              "Some concatenation failed as a schema key wasn't a Joi object for ValidationSchema.concat()"
            );
          }
          inCurrent[key] = inCurrent[key].concat(inConcatSchema[key]);
          return;
        }
        helper(inConcatSchema[key], inCurrent[key]);
      });
    };
    helper(concatSchema, current);
  };
}

module.exports = {
  use,
  skip,
  add,
  concat
};
