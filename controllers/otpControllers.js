const otpgenerator = require("otp-generator");
const otpGen = () => {
  return otpgenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
};

module.exports = { otpGen };
