const detectAlphabet = (word) => {
  const cyrillicRegex = /[а-яА-ЯёЁ]/; // So‘zda kiril harfi mavjudligini tekshiradi

  return cyrillicRegex.test(word) ? "kiril" : "latin";
};

export default detectAlphabet;
