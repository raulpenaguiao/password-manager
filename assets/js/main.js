selectDropdownHTML = document.querySelector("#selectOldPasswords");

class Password{
    constructor(name, arr){
        this._name = name;
        this._encripted_email = arr[0];
        this._encripted_user = arr[1];
        this._encripted_password = arr[2];
        this._encripted_text = arr[3];
    }
    get name(){
        return this._name;
    }

    get data(){
        try{
            let p = askSecretPassphrase();
            return [CryptoJS.Rabbit.decrypt(this._encripted_email, p), CryptoJS.Rabbit.decrypt(this._encripted_user, p), CryptoJS.Rabbit.decrypt(this._encripted_password, p), CryptoJS.Rabbit.decrypt(this._encripted_text, p)];
        } catch(err){
            console.log(err);
            return "There was an error";
        }
    }

    savePasswordToLocalstorage(){//Currently does not escape / characters
        if(localStorage.getItem(this.name) === null){
            localStorage.setItem(this.name, this.data);
        } else{
            throw new Error("Password already exists");
        }
    }
    addPasswordToDOM(){
        passwords.unshift(this);
        selectDropdownHTML.innerHTML += `<option>${this.name}</option>`;
    }

}

function askSecretPassphrase(){//Let's make it more fancy latter
    return "secret password";
}

function savePasswordToLocalstorage(password){//Currently does not escape / characters
    if(localStorage.getItem(password.name) === null){
        localStorage.setItem(password.name, password.data);
    } else{
        throw new Error("Password already exists");
    }
}

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
