exports.arrayDif = (arr1, arr2) => {
  return arr1.filter(x => !arr2.includes(x));
}

exports.randomInt = (min, max) => {
  // min and max included
  return Math.floor(Math.random()*(max-min+1)+min);
}