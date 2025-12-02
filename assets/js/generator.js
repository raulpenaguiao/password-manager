const upperCaseCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lowerCaseCharacters = "abcdefghijklmnopqrstuvwxyz";
const numbersCharacters = "0123456789";
const specialCharactersCharacters = ".,:;-_'!\"·$%&/()=?'+*[]<>^";


function generatePassword(len, specialCharactersIncluded, numbersIncluded, upperCaseIncluded){
    let l = lowerCaseCharacters;
    if(upperCaseIncluded) l += upperCaseCharacters;
    if(numbersIncluded) l += numbersCharacters;
    if(specialCharactersIncluded) l += specialCharactersCharacters;
    let str = "", n = l.length;
    let randomValues = new Uint32Array(len);
    crypto.getRandomValues(randomValues);
    for(let i = 0; i < len; i++){
        str += l[randomValues[i] % n];
    }
    return str;
}
