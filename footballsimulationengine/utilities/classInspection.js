// Function to log the methods of a class
function logClassMethods(className) {
  const methods = Object.getOwnPropertyNames(className.prototype).filter(
    (prop) => typeof className.prototype[prop] === "function"
  );

  console.log(`Methods in ${className.name}:`);
  methods.forEach((method) => console.log(method));
}

function logObjectMethods(obj) {
  const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).filter(
    (prop) => typeof obj[prop] === "function"
  );

  console.log(`Methods in the ${obj.constructor.name} object:`);
  methods.forEach((method) => console.log(method));
}

module.exports = { logClassMethods, logObjectMethods };
