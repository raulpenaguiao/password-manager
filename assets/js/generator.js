const upperCaseCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split();
const lowerCaseCharacters = "abcdefghijklmnopqrstuvwxyz".split();
const numbersCharacters = "0123456789".split();
const specialCharactersCharacters = ".,:;-_'!\"·$%&/()=?'+*[]<>^".split();

const HTMLbuttonPasswordGenerator = document.querySelector("#buttonPasswordGenerator");
const HTMLinputPassword = document.querySelector("#inputPassword");
const HTMLincludeUpperCaseCheckbox = document.querySelector("#includeUpperCaseCheckbox");
const HTMLincludeNumbersCheckbox = document.querySelector("#includeNumbersCheckbox");
const HTMLincludeSpecialCharactersCheckbox = document.querySelector("#includeSpecialCharactersCheckbox");
const HTMLlengthPasswordGeneratedInput = document.querySelector("#lengthPasswordGeneratedInput");

HTMLbuttonPasswordGenerator.addEventListener('click', ()=>{
    let len = Number(HTMLlengthPasswordGeneratedInput.value);
    let specialCharactersIncluded = HTMLincludeSpecialCharactersCheckbox.value;
    let upperCaseIncluded = HTMLincludeUpperCaseCheckbox.value;
    let numbersIncluded = HTMLincludeNumbersCheckbox.value;
    if(len <= 0 || len >100){
        displayError("Number out of bounds");
    }
    HTMLinputPassword.value = generatePassword(len, specialCharactersIncluded, numbersIncluded, upperCaseIncluded);
    HTMLinputPassword.type = "password";
})

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
