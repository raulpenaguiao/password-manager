const HTMLpasswordSee = document.querySelector("#passwordSee");
const clickableHTML = document.querySelectorAll(".clickable");
const HTMLpasswordIntroduceDatabase = document.querySelector("#passwordIntroduceDatabase");
const HTMLinputName = document.querySelector("#inputName");
const HTMLinputUser = document.querySelector("#inputUser");
const HTMLinputEmail = document.querySelector("#inputEmail");
const HTMLinputInfo = document.querySelector("#inputInfo")

const HTMLbuttonPasswordGenerator = document.querySelector("#buttonPasswordGenerator");
const HTMLinputPassword = document.querySelector("#inputPassword");
const HTMLincludeUpperCaseCheckbox = document.querySelector("#includeUpperCaseCheckbox");
const HTMLincludeNumbersCheckbox = document.querySelector("#includeNumbersCheckbox");
const HTMLincludeSpecialCharactersCheckbox = document.querySelector("#includeSpecialCharactersCheckbox");
const HTMLlengthPasswordGeneratedInput = document.querySelector("#lengthPasswordGeneratedInput");
const HTMLpasswordGetter = document.querySelector("#passwordGetter");
const HTMLselectDropdown = document.querySelector("#selectOldPasswords");

const HTMLonScreenPassword = document.querySelector("#onScreenPassword");
const HTMLonScreenData = document.querySelector("#onScreenData");
const HTMLtoClipboardPassword = document.querySelector("#toClipboardPassword");
const HTMLpasswordDump = document.querySelector("#passwordDump");

/*
Deletion quadrant
*/
const HTMLclearPasswordButtons = document.querySelector("#clearPasswordButton");
const HTMLdeleteButton = document.querySelector("#deleteButton");
const HTMLpasswordDeletionList = document.querySelector("#selectOldPasswordsClear");


const permissionsToRequest ={
    permissions: ["webRequest"]
}

/*
Code for password generator
*/
HTMLbuttonPasswordGenerator.addEventListener('click', ()=>{//Smurf generates password and places it in input.value tag
    let len = Number(HTMLlengthPasswordGeneratedInput.value);
    let specialCharactersIncluded = HTMLincludeSpecialCharactersCheckbox.checked;
    let upperCaseIncluded = HTMLincludeUpperCaseCheckbox.checked;
    let numbersIncluded = HTMLincludeNumbersCheckbox.checked;
    if(len <= 10 || len >100){
        HTMLlengthPasswordGeneratedInput.classList.add("error");
        displayError("Number out of bounds");
    } else{
        HTMLinputPassword.value = generatePassword(len, specialCharactersIncluded, numbersIncluded, upperCaseIncluded);
        HTMLinputPassword.type = "password";
        HTMLlengthPasswordGeneratedInput.classList.remove("error");
    }
})

clickableHTML.forEach(item =>{
    item.addEventListener('click', ()=>{
        item.children[0].checked = !item.children[0].checked;
    })
})



/*
Code for error handling
*/
function displayError(str){//Will make a fancy window show up on the lower right corner
    console.log(str);
}


//Password getter event listener
HTMLpasswordGetter.addEventListener('click', ()=>{
    data = HTMLselectDropdown.value;
    if(data == "-- Please select a password --"){//The drop down menu was not activated
        console.log("Please select a password on the database");
        return 0;
    } else {
        foundPassword = false;
        passwords.forEach(item =>{
            if(item.name == data){//for the item in the password list with the relevant name
                revealPassword(item, HTMLonScreenData.checked, HTMLtoClipboardPassword.checked, HTMLonScreenPassword.checked)
                foundPassword = true;
            }
        })
        if(! foundPassword) console.log("ERROR, password not found");
    }
})


//Reveal password
/*
This code reveals the password on the third window
*/
function revealPassword(password, onScreenData = true, copyToClipboard = true, onScreenPassword = true){
    try{
        data = password.data;
        str = "<h3>Your current password has been successfully accessed</h3>"
        if(onScreenData) str += `<p>Service name: <span class="out">${password.name}</span></p><p>Username: <span class="out">${data[1]}</span></p><p>email: <span class="out">${data[0]}</span></p><p>Description: <span class="out">${data[3]}</span></p>`;
        if(onScreenPassword || true) str += `<p>Password: <span class="out password">${data[2]}</span></p>`
        if(copyToClipboard){
            str += "<p>Copy to clipboard currently not supported</p>"
            //Copy to clipboard
        }
        HTMLpasswordDump.innerHTML = str;
        HTMLpasswordDump.classList.remove("hdn");
    } catch{
        console.log("Not able to password");
    }
}




//Create toggle see password button
HTMLpasswordSee.addEventListener('click', () =>{
    let str = document.getElementById("inputPassword").type;
    if(str === "text"){
        document.getElementById("inputPassword").type = "password";
    } else{
        document.getElementById("inputPassword").type = "text";
    }
})

HTMLpasswordIntroduceDatabase.addEventListener('click', ()=>{
    let user = HTMLinputUser.value;
    let email = HTMLinputEmail.value;
    let inputName = HTMLinputName.value;
    let info = HTMLinputInfo.value;
    let pass = HTMLinputPassword.value;/*
    console.log("user = ", user);
    console.log("email = ", email);
    console.log("description = ", info);
    console.log("pass = ", pass);
    console.log("service = ", inputName);*/
    createPassword(inputName, [email, user, pass, info]);
})



/*
fourth quadrant
*/
HTMLclearPasswordButtons.addEventListener('click', () => {
    let del = HTMLpasswordDeletionList.value;
    if(del !== "-- Please select a password --") HTMLdeleteButton.classList.toggle("hdn");
})

HTMLdeleteButton.addEventListener('click', ()=>{
    let del = HTMLpasswordDeletionList.value;
    HTMLdeleteButton.classList.toggle("hdn");
    removePassword(del);
})

HTMLpasswordDeletionList.addEventListener('click', ()=>{
    HTMLdeleteButton.classList.add("hdn");
    HTMLpasswordDump.classList.add("hdn");
})


