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
const HTMLpasswordSearchInput = document.querySelector("#passwordSearchInput");

const HTMLonScreenPassword = document.querySelector("#onScreenPassword");
const HTMLonScreenData = document.querySelector("#onScreenData");
const HTMLtoClipboardPassword = document.querySelector("#toClipboardPassword");
const HTMLpasswordDump = document.querySelector("#passwordDump");

// Password strength indicator elements
let passwordStrengthMeter = null;
let passwordStrengthText = null;

// Recent passwords tracking
let recentPasswords = [];
const MAX_RECENT = 5;

/*
Dark mode toggle
*/
const HTMLdarkModeToggle = document.querySelector("#darkModeToggle");
const htmlElement = document.documentElement;

// Check if dark mode preference is saved
function loadDarkModePreference(){
    const savedMode = localStorage.getItem('darkMode');
    if(savedMode === 'enabled'){
        enableDarkMode();
    }
}

function enableDarkMode(){
    htmlElement.classList.add('dark-mode');
    HTMLdarkModeToggle.textContent = '☀️';
    localStorage.setItem('darkMode', 'enabled');
    console.log('Dark mode enabled');
}

function disableDarkMode(){
    htmlElement.classList.remove('dark-mode');
    HTMLdarkModeToggle.textContent = '🌙';
    localStorage.setItem('darkMode', 'disabled');
    console.log('Dark mode disabled');
}

HTMLdarkModeToggle.addEventListener('click', () => {
    if(htmlElement.classList.contains('dark-mode')){
        disableDarkMode();
    } else {
        enableDarkMode();
    }
});

// Load dark mode preference on startup
loadDarkModePreference();

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
HTMLbuttonPasswordGenerator.addEventListener('click', ()=>{
    let len = Number(HTMLlengthPasswordGeneratedInput.value);
    let specialCharactersIncluded = HTMLincludeSpecialCharactersCheckbox.checked;
    let upperCaseIncluded = HTMLincludeUpperCaseCheckbox.checked;
    let numbersIncluded = HTMLincludeNumbersCheckbox.checked;

    if(!HTMLlengthPasswordGeneratedInput.value){
        displayError("Please enter a password length");
        HTMLlengthPasswordGeneratedInput.classList.add("error");
        return;
    }
    if(isNaN(len) || len < 8 || len > 100){
        HTMLlengthPasswordGeneratedInput.classList.add("error");
        displayError("Password length must be between 8 and 100");
    } else{
        HTMLinputPassword.value = generatePassword(len, specialCharactersIncluded, numbersIncluded, upperCaseIncluded);
        HTMLinputPassword.type = "password";
        HTMLlengthPasswordGeneratedInput.classList.remove("error");
    }
})

clickableHTML.forEach(item =>{
    item.addEventListener('click', (e)=>{
        if(e.target === item.children[0]) return;
        item.children[0].checked = !item.children[0].checked;
    })
})



/*
Recent passwords tracking
*/
function addToRecentPasswords(passwordName){
    // Remove if already in list
    recentPasswords = recentPasswords.filter(p => p !== passwordName);
    // Add to beginning
    recentPasswords.unshift(passwordName);
    // Keep only MAX_RECENT items
    if(recentPasswords.length > MAX_RECENT){
        recentPasswords.pop();
    }
    // Save to localStorage
    localStorage.setItem('recentPasswords', JSON.stringify(recentPasswords));
}

function loadRecentPasswords(){
    const saved = localStorage.getItem('recentPasswords');
    if(saved){
        try {
            recentPasswords = JSON.parse(saved);
        } catch(e){
            recentPasswords = [];
        }
    }
}

// Load recent passwords on startup
loadRecentPasswords();

function displayRecentPasswords(){
    const container = document.getElementById('recentPasswordsContainer');
    const list = document.getElementById('recentPasswordsList');

    if(recentPasswords.length === 0){
        container.style.display = 'none';
        return;
    }

    list.innerHTML = '';
    recentPasswords.forEach(pwdName => {
        const link = document.createElement('div');
        link.style.padding = '3px 0';
        link.style.cursor = 'pointer';
        link.style.textDecoration = 'underline';
        link.style.color = 'rgb(70, 100, 120)';
        link.style.fontSize = '1.3rem';
        link.textContent = '• ' + pwdName;
        link.addEventListener('click', () => {
            HTMLselectDropdown.value = pwdName;
            HTMLpasswordGetter.click();
        });
        list.appendChild(link);
    });

    container.style.display = 'block';
}

/*
Search/Filter functionality
*/
function filterPasswordsBySearch(searchTerm){
    const dropdown = HTMLselectDropdown;
    const options = dropdown.querySelectorAll('option');

    if(!searchTerm){
        // Show all options
        options.forEach(option => {
            option.style.display = '';
        });
        return;
    }

    const searchLower = searchTerm.toLowerCase();
    options.forEach(option => {
        if(option.textContent.toLowerCase().includes(searchLower)){
            option.style.display = '';
        } else {
            option.style.display = 'none';
        }
    });
}

HTMLpasswordSearchInput.addEventListener('input', (e) => {
    filterPasswordsBySearch(e.target.value);
});

/*
Code for error handling
*/
function displayError(str){
    console.log(str);
    showAlert("Error: " + str);
}

/*
Password strength indicator
*/
function calculatePasswordStrength(password){
    let strength = 0;

    // Length check
    if(password.length >= 8) strength += 1;
    if(password.length >= 12) strength += 1;
    if(password.length >= 16) strength += 1;

    // Character variety checks
    if(/[a-z]/.test(password)) strength += 1;
    if(/[A-Z]/.test(password)) strength += 1;
    if(/[0-9]/.test(password)) strength += 1;
    if(/[^a-zA-Z0-9]/.test(password)) strength += 1;

    // Return strength level and color
    if(strength <= 2) return { level: "Weak", color: "red", percentage: 25 };
    if(strength <= 4) return { level: "Fair", color: "orange", percentage: 50 };
    if(strength <= 6) return { level: "Good", color: "yellow", percentage: 75 };
    return { level: "Strong", color: "green", percentage: 100 };
}

function updatePasswordStrength(){
    const password = HTMLinputPassword.value;

    // Create strength meter if it doesn't exist
    if(!passwordStrengthMeter){
        const container = document.createElement("div");
        container.style.marginTop = "10px";
        container.style.marginBottom = "10px";

        passwordStrengthMeter = document.createElement("div");
        passwordStrengthMeter.style.width = "100%";
        passwordStrengthMeter.style.height = "20px";
        passwordStrengthMeter.style.backgroundColor = "#e0e0e0";
        passwordStrengthMeter.style.borderRadius = "5px";
        passwordStrengthMeter.style.overflow = "hidden";

        const bar = document.createElement("div");
        bar.id = "strengthBar";
        bar.style.height = "100%";
        bar.style.width = "0%";
        bar.style.transition = "width 0.3s ease";
        bar.style.backgroundColor = "gray";

        passwordStrengthText = document.createElement("span");
        passwordStrengthText.id = "strengthText";
        passwordStrengthText.style.marginLeft = "10px";
        passwordStrengthText.style.fontSize = "1.4rem";

        passwordStrengthMeter.appendChild(bar);
        container.appendChild(passwordStrengthMeter);
        container.appendChild(passwordStrengthText);

        HTMLinputPassword.parentNode.insertBefore(container, HTMLinputPassword.nextSibling);
    }

    if(password.length > 0){
        const strength = calculatePasswordStrength(password);
        const bar = document.getElementById("strengthBar");
        bar.style.backgroundColor = strength.color;
        bar.style.width = strength.percentage + "%";
        passwordStrengthText.textContent = "Strength: " + strength.level;
        passwordStrengthText.style.color = strength.color;
    } else {
        const bar = document.getElementById("strengthBar");
        bar.style.width = "0%";
        passwordStrengthText.textContent = "";
    }
}

// Listen for password input changes
HTMLinputPassword.addEventListener('input', updatePasswordStrength);


//Password getter event listener
HTMLpasswordGetter.addEventListener('click', async ()=>{
    data = HTMLselectDropdown.value;
    if(data == "-- Please select a password --"){
        displayError("Please select a password from the dropdown");
        return;
    }

    foundPassword = false;
    for(let item of passwords){
        if(item.name == data){
            try {
                await revealPassword(item, HTMLonScreenData.checked, HTMLtoClipboardPassword.checked, HTMLonScreenPassword.checked)
                addToRecentPasswords(item.name);
                foundPassword = true;
                break;
            } catch(err) {
                displayError("Failed to access password: " + err.message);
                foundPassword = true;
                break;
            }
        }
    }
    if(!foundPassword) displayError("Password not found in database");
})


//Reveal password
/*
This code reveals the password on the third window
*/
async function revealPassword(password, onScreenData = true, copyToClipboard = true, onScreenPassword = true){
    try{
        const data = await password.data();
        let str = "<h3>Your current password has been successfully accessed</h3>"
        if(onScreenData) str += `<p>Service name: <span class="out">${password.name}</span></p><p>Username: <span class="out">${data[1]}</span></p><p>email: <span class="out">${data[0]}</span></p><p>Description: <span class="out">${data[3]}</span></p>`;
        if(onScreenPassword) str += `<p>Password: <span class="out password">${data[2]}</span></p>`

        if(copyToClipboard){
            try {
                await navigator.clipboard.writeText(data[2]);
                str += "<p style='color: green;'>Password copied to clipboard!</p>";
            } catch(err) {
                str += "<p style='color: red;'>Failed to copy password to clipboard</p>";
            }
        }

        HTMLpasswordDump.innerHTML = str;
        HTMLpasswordDump.classList.remove("hdn");
    } catch(err){
        console.error('Error revealing password:', err);
        displayError("Could not decrypt password: " + err.message);
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

HTMLpasswordIntroduceDatabase.addEventListener('click', async ()=>{
    let user = HTMLinputUser.value.trim();
    let email = HTMLinputEmail.value.trim();
    let inputName = HTMLinputName.value.trim();
    let info = HTMLinputInfo.value.trim();
    let pass = HTMLinputPassword.value;

    // Validate inputs
    if(!inputName){
        displayError("Service name is required");
        return;
    }
    if(!pass){
        displayError("Password is required");
        return;
    }
    if(!user && !email){
        displayError("Username or email is required");
        return;
    }

    if (localStorage.getItem("pass" + inputName) !== null) {
        const confirmed = await showConfirm(`An entry for "${inputName}" already exists.\n\nDo you want to overwrite it?`);
        if (!confirmed) return;
        localStorage.removeItem("pass" + inputName);
    }

    try {
        await createPassword(inputName, [email, user, pass, info]);
        // Clear form on success
        HTMLinputUser.value = "";
        HTMLinputEmail.value = "";
        HTMLinputName.value = "";
        HTMLinputInfo.value = "";
        HTMLinputPassword.value = "";
        HTMLinputPassword.type = "password";
        await showAlert("Password saved successfully!");
    } catch(err) {
        displayError("Error saving password: " + err.message);
    }
})



/*
Settings quadrant
*/
const HTMLchangePassphraseButton = document.querySelector("#changePassphraseButton");
const HTMLexportButton = document.querySelector("#exportButton");
const HTMLimportButton = document.querySelector("#importButton");

HTMLchangePassphraseButton.addEventListener('click', () => {
    changePassphrase();
})

HTMLexportButton.addEventListener('click', () => {
    exportPasswords();
})

HTMLimportButton.addEventListener('click', () => {
    importPasswords();
})

HTMLclearPasswordButtons.addEventListener('click', async () => {
    let del = HTMLpasswordDeletionList.value;
    if(del === "-- Please select a password --"){
        displayError("Please select a password to delete");
        return;
    }

    if(del === "-- All --"){
        const confirmed = await showConfirm("⚠️ WARNING: This will DELETE ALL passwords permanently!\n\nThis action cannot be undone. Are you sure?");
        if(!confirmed) return;

        const doubleConfirm = await showPrompt("Type 'DELETE ALL' to confirm deletion of all passwords:");
        if(doubleConfirm !== "DELETE ALL"){
            await showAlert("Deletion cancelled");
            return;
        }
    } else {
        const confirmed = await showConfirm("Delete password for '" + del + "'?\n\nThis action cannot be undone.");
        if(!confirmed) return;
    }

    try {
        await askSecretPassphrase();
    } catch(err) {
        displayError("Passphrase verification failed. Deletion cancelled.");
        return;
    }

    try {
        await removePassword(del);
        displayPasswordDeletedMessage(del);
    } catch(err) {
        displayError("Error deleting password: " + err.message);
    }
})

function displayPasswordDeletedMessage(name){
    HTMLpasswordDump.innerHTML = "<h3 style='color: green;'>✓ Password deleted successfully!</h3><p>Password for '" + name + "' has been permanently removed.</p>";
    HTMLpasswordDump.classList.remove("hdn");
    HTMLpasswordDeletionList.value = "-- Please select a password --";
}

HTMLpasswordDeletionList.addEventListener('click', ()=>{
    HTMLpasswordDump.classList.add("hdn");
})

document.querySelector("#editPasswordButton").addEventListener('click', async () => {
    const selectedName = HTMLselectDropdown.value;
    if (selectedName === "-- Please select a password --") {
        displayError("Please select a password to edit");
        return;
    }

    const password = passwords.find(p => p.name === selectedName);
    if (!password) {
        displayError("Password not found");
        return;
    }

    try {
        const data = await password.data(); // [email, user, password, text]
        HTMLinputName.value = password.name;
        HTMLinputEmail.value = data[0];
        HTMLinputUser.value = data[1];
        HTMLinputPassword.value = data[2];
        HTMLinputPassword.type = "text";
        HTMLinputInfo.value = data[3];

        document.getElementById("panel-generate").scrollIntoView({ behavior: "smooth" });
    } catch(err) {
        displayError("Failed to load password for editing: " + err.message);
    }
})

document.querySelector("#resetDatabaseButton").addEventListener('click', async () => {
    await showAlert("If you have forgotten your passphrase, your stored passwords cannot be recovered — they are encrypted and only readable with the correct passphrase.\n\nResetting will permanently erase all passwords and let you start fresh.");

    const confirmed = await showConfirm("Are you sure you want to permanently delete all passwords and reset the database?");
    if (!confirmed) return;

    const typed = await showPrompt("Type RESET to confirm:");
    if (typed !== "RESET") {
        await showAlert("Reset cancelled. You must type RESET exactly.");
        return;
    }

    localStorage.clear();
    location.reload();
})


