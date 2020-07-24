/* eslint-disable no-restricted-globals */
export default {
  // eslint-disable-next-line consistent-return
  isISO8601: (props, propName, componentName) => {
    const date = Date.parse(props[propName]);
    if (isNaN(date)) {
      return new Error(`Invalid prop ${propName} passed to ${componentName}. Expected a valid ISO8601 date string.`);
    }
  },
};
