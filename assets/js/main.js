selectDropdownHTML = document.querySelector("#selectOldPasswords");

class Password{
    constructor(name, arr){
        this._name = name;//name is the name of the webservice
        this._encripted_email = arr[0];//email is the e-mail given by the user
        this._encripted_user = arr[1];//user is the username given by the user
        this._encripted_password = arr[2];//pass
        this._encripted_text = arr[3];//description
    }
    get name(){
        return this._name;
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
            localStorage.setItem("pass" + this.name, JSON.stringify(this.data));
        } else{
            throw new Error("Password already exists");
        }
    }

    addPasswordToDOM(){
        passwords.unshift(this);
        console.log("Passwords updated with ", this.name)
        selectDropdownHTML.innerHTML += `<option>${this.name}</option>`;
    }

}

function askSecretPassphrase(){//TODO Let's make it more fancy latter
    let passCheck = false;
    console.log("Passphrase asked")
    if(passCheck){
        throw new Error("Wrong passphrase");
    }
    return "secret password";
}

/* function savePasswordToLocalstorage(password){//Currently does not escape / characters
    if(localStorage.getItem(password.name) === null){
        localStorage.setItem(password.name, password.data);
    } else{
        throw new Error("Password already exists");
    }
} */

function createPassword(name, arr){
    try{
        let p = askSecretPassphrase();
        let password = new Password(name, arr.map(item => CryptoJS.Rabbit.encrypt(item, p)));
        password.savePasswordToLocalstorage();
        password.addPasswordToDOM();
        return password;
    } catch(err){
        console.log(err);
        return "There was an error";
    }
}

function addNewPassword(password){//TODO
    let l = 0;
    return l;
}

function removePassword(name){//TODO
    return 1;
}

let passwords = new Array();
for(pass in localStorage){
    if(pass.substring(0,4) === "pass"){
        let password = new Password(pass.substring(4), localStorage[pass].split("/"))
        passwords.push(password);
    }
}
//Sort passwords alphabetically?


//Put all old passwords in the DOM
passwords.forEach(item =>{
    selectDropdownHTML.innerHTML += `<option>${item.name}</option>`;
})

