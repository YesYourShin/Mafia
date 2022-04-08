export const promiseAllSetteldResult = async (arg: any[]) => {
  const settled = await Promise.allSettled(arg);
  const rejected = settled.filter(
    (result) => result.status === 'rejected',
  ) as PromiseRejectedResult[];

  const fulfilled = settled.filter(
    (result) => result.status === 'fulfilled',
  ) as PromiseFulfilledResult<any>[];

  const value = fulfilled.map((result) => result.value);

  if (rejected.length) {
    const reason = rejected.map((result) => result.reason);
    return { value, reason };
  }

  return { value };
};
