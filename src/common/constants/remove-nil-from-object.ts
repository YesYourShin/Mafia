import { isNil, negate, pickBy } from 'lodash';

export const removeNilFromObject = (object: object) => {
  return pickBy(object, negate(isNil));
};
