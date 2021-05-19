export const updateState =
  (updateFlg: () => void) =>
  <T>(
    value: T | undefined,
    savedValue: T | undefined,
    setValue: (value: T | undefined) => void
  ) => {
    if (value != null && savedValue != value) {
      updateFlg();
      setValue(value);
    }
  };

export const getRestoreValue =
  (updateFlg: () => void) =>
  <T>(value: T | undefined, savedValue: T | undefined, defaultValue?: T) => {
    if (value != null) {
      return value;
    }
    if (savedValue != null) {
      updateFlg();
      return savedValue;
    }
    if (defaultValue != null) {
      updateFlg();
      return defaultValue;
    }
    return undefined;
  };

export const getPageList = (
  pageNo: number,
  allCount: number,
  pageSize: number
) => {
  const pageRange = 9;
  const pageCount =
    allCount < pageSize
      ? 1
      : Math.floor(allCount / pageSize) + (allCount % pageSize !== 0 ? 1 : 0);
  if (pageNo <= 0) {
    pageNo = 1;
  }
  if (pageNo > pageCount) {
    pageNo = pageCount;
  }
  let diff = 0;
  let pageList = [] as number[];
  if (pageCount > pageRange) {
    pageList.push(pageNo);
    for (let i = pageNo - 1; i >= pageNo - 4; i--) {
      if (i >= 1) {
        pageList.unshift(i);
      } else {
        diff = 1;
        break;
      }
    }
    for (let i = pageNo + 1; i <= pageNo + 4; i++) {
      if (i <= pageCount) {
        pageList.push(i);
      } else {
        diff = -1;
        break;
      }
    }
    if (diff === 1) {
      const adjustSize = 9 - pageList.length;
      const last = pageList[pageList.length - 1];
      for (let i = 1; i <= adjustSize; i++) {
        pageList.push(last + i);
      }
    }
    if (diff === -1) {
      const adjustSize = 9 - pageList.length;
      const first = pageList[0];
      const pre = [];
      for (let i = 1; i <= adjustSize; i++) {
        pre.unshift(first - i);
      }
      pageList = [...pre, ...pageList];
    }
  } else {
    for (let i = 1; i <= pageCount; i++) {
      pageList.push(i);
    }
  }
  const from = (pageNo - 1) * pageSize + 1;
  const to =
    pageNo === pageCount
      ? allCount
      : pageNo * pageSize > allCount
      ? allCount
      : pageNo * pageSize;

  return {
    pageCount,
    pageList,
    from: allCount > 0 ? from : 0,
    to: allCount > 0 ? to : 0,
  };
};
