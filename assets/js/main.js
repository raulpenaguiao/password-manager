const selectDropdownHTML = document.querySelector("#selectOldPasswords");
const deleteDropdownHTML = document.querySelector("#selectOldPasswordsClear");
const revealPasswordHTML = document.querySelector("#passwordDump");
const firstVisitHTML = document.querySelector("#firstVisit");



/*First visit elements*/
const passphraseCreatorInputHTML = document.querySelector("#passphraseCreatorInput");
const passphraseCreatorButtonHTML = document.querySelector("#passphraseCreatorButton");

class Password{
    constructor(name, arr){
        this._name = name;//name is the name of the webservice
        this._encripted_email = arr[0];//email is the e-mail given by the user ENCRYPTED
        this._encripted_user = arr[1];//user is the username given by the user ENCRYPTED
        this._encripted_password = arr[2];//pass ENCRYPTED
        this._encripted_text = arr[3];//description ENCRYPTED
    }
    get name(){
        return this._name;
    }

    get encrypted_data(){
        return [this._encripted_email, this._encripted_user, this._encripted_password, this._encripted_text];
    }

    get data(){
        try{
            let p = askSecretPassphrase();
            return [this._encripted_email, this._encripted_user, this._encripted_password, this._encripted_text].map(item => CryptoJS.Rabbit.decrypt(item, p).toString(CryptoJS.enc.Utf8));
        } catch(err){
            console.log(err);
            return "There was an error";
            
        }
    }

    savePasswordToLocalstorage(){//Currently does not escape / characters
        if(localStorage.getItem("pass" + this.name) === null){
            localStorage.setItem("pass" + this.name, JSON.stringify(this.encrypted_data));
        } else{
            throw new Error("Password already exists");
        }
    }
/*
    addPasswordToDOM(){
        passwords.unshift(this);
        console.log("Passwords updated with ", this.name)
        selectDropdownHTML.innerHTML += `<option>${this.name}</option>`;
    }*/

}

function askSecretPassphrase(){//TODO Let's make it more fancy latter
    //Ask for the password
    let pass = "secret password";//Right now there is no mechanism to ask for the password
    console.log("Passphrase asked");
    //Now we check if the value in localStorage matches this password
    let passCheck = (CryptoJS.Rabbit.decrypt(JSON.parse(localStorage["Checker"]), pass).toString(CryptoJS.enc.Utf8) === "Passworded");
    if(!passCheck){
        throw new Error("Wrong passphrase");
    }
    return pass;
}

/* function savePasswordToLocalstorage(password){//Currently does not escape / characters
    if(localStorage.getItem(password.name) === null){
        localStorage.setItem(password.name, password.data);
    } else{
        throw new Error("Password already exists");
    }
} */



/*
Creates a new password object
array has [email, username, password, text] UNENCRIPTED
Also adds password to DOM, passwords list and dropdown lists
*/
function createPassword(name, arr){
    try{
        let p = askSecretPassphrase();
        let array = arr.map(item => CryptoJS.Rabbit.encrypt(item, p));
        let password = new Password(name, array);
        password.savePasswordToLocalstorage();
        passwords = updatePasswordsAndDOM();
        return password;
    } catch(err){
        console.log(err);
        return "There was an error";
    }
}

/*
Also removes password from DOM, passwords list and dropdown lists
*/
function removePassword(name){
    if(name === "-- All --"){//This does not YET ask for a new passphrase
        for(key in localStorage){
            if(key.substring(0,4) === "pass"){
                localStorage.removeItem(key);
            }
        }
        localStorage.removeItem("Checker");
        firstVisitHTML.classList.remove("hdn");
    } else{
        for(key in localStorage){
            if(key === "pass" + name){
                localStorage.removeItem(key);
                passwords = updatePasswordsAndDOM();
                return name;
            }
        }
    }
    throw "No password on the database with that name";
}


/*
Reads all existing passwords at start up
Stores all existing passwords in an array called "passwords"
*/
function updatePasswordsAndDOM(){
    let passwords = new Array();
    for(pass in localStorage){
        if(pass.substring(0,4) === "pass"){
            let password = new Password(pass.substring(4), JSON.parse(localStorage[pass]))
            passwords.push(password);
        }
    }
    passwords.sort((a, b) => a.name < b.name ? -1 : 1);
    //Put all existing passwords at start up in the DOM
    
    selectDropdownHTML.innerHTML = "<option>-- Please select a password --</option>"
    deleteDropdownHTML.innerHTML = "<option>-- Please select a password --</option>"
    passwords.forEach(item =>{
        selectDropdownHTML.innerHTML += `<option>${item.name}</option>`;
        deleteDropdownHTML.innerHTML += `<option>${item.name}</option>`;
    })
    deleteDropdownHTML.innerHTML += `<option>-- All --</option>`;
    return passwords;
}
passwords = updatePasswordsAndDOM();

/*
This section is for the first time this app runs on someone's computer, or when ALL passwords are cleared
*/
function createPassphrase(){
    //Create passphrase
    let pass = passphraseCreatorInputHTML.value; 
    pass ="secret password";
    //Right now there is no method to create a password
    localStorage.setItem('Checker', JSON.stringify(CryptoJS.Rabbit.encrypt("Passworded", pass)));
    firstVisitHTML.classList.add("hdn");
}

if('Checker' in localStorage){
    firstVisitHTML.classList.add("hdn");
}

passphraseCreatorButtonHTML.addEventListener('click', createPassphrase)




