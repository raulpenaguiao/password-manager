const upperCaseCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lowerCaseCharacters = "abcdefghijklmnopqrstuvwxyz";
const numbersCharacters = "0123456789";
const specialCharactersCharacters = ".,:;-_'!\"·$%&/()=?'+*[]<>^";


function generatePassword(len, specialCharactersIncluded, numbersIncluded, upperCaseIncluded){
    let l = lowerCaseCharacters;
    if(upperCaseIncluded) l += upperCaseCharacters;
    if(numbersIncluded) l += numbersCharacters;
    if(specialCharactersIncluded) l += specialCharactersCharacters;
    let str = "", n=l.length;
    for(let i = 0; i < len; i++){
        str += l[Math.floor(Math.random()*n)];
    }
    return str;
}
