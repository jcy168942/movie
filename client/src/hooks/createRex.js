function createRex(query) {
  const length = query.length;

  let resultStr = '';

  for (let i = 0; i < length; i++) {
    const k = query.substr(i, 1);

    if (k === ' ') {
      continue;
    }

    resultStr += k + '\\s?';
  }

  return resultStr;
}

export default createRex;
