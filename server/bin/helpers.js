const arrayDif = (arr1, arr2) => {
  return arr1.filter(x => !arr2.includes(x));
}

const randomInt = (min, max) => {
  // min and max included
  return Math.floor(Math.random()*(max-min+1)+min);
}

const randomStr = (length) => {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(randomInt(0, possible.length));

  return text;
}

module.exports = {
  arrayDif,
  randomInt,
  randomStr,
}