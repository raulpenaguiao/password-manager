const HTMLpasswordSee = document.querySelector("#passwordSee");
const clickableHTML = document.querySelectorAll(".clickable");
const HTMLpasswordIntroduceDatabase = document.querySelector("#passwordIntroduceDatabase");
const HTMLinputName = document.querySelector("#inputName");
const HTMLinputUser = document.querySelector("#inputUser");
const HTMLinputEmail = document.querySelector("#inputEmail");
const HTMLinputInfo = document.querySelector("#inputInfo")


clickableHTML.forEach(item =>{
    item.addEventListener('click', ()=>{
        item.children[0].checked = !item.children[0].checked;
    })
})

function displayError(str){//Will make a fancy window show up
    console.log(str);
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
    let pass = HTMLinputPassword.value;
    createPassword(inputName, [email, user, pass, info]);
})


