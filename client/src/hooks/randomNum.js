function randomNum() {
  let arr = [];
  let i = 0;
  while (i < 3) {
    let n = Math.floor(Math.random() * 10) + 1;
    if (!sameNum(n - 1)) {
      arr.push(n - 1);
      i++;
    }
  }

  function sameNum(n) {
    for (let i = 0; i < arr.length; i++) {
      if (n === arr[i]) {
        return true;
      }
    }
    return false;
  }

  return arr;
}

export default randomNum;
