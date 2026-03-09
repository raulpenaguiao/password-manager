const selectDropdownHTML = document.querySelector("#selectOldPasswords");
const deleteDropdownHTML = document.querySelector("#selectOldPasswordsClear");
const revealPasswordHTML = document.querySelector("#passwordDump");
const firstVisitHTML = document.querySelector("#firstVisit");

/*First visit elements*/
const passphraseCreatorInputHTML = document.querySelector("#passphraseCreatorInput");
const passphraseCreatorButtonHTML = document.querySelector("#passphraseCreatorButton");

// Store current passphrase in session (cleared on page close)
let sessionPassphrase = null;
const PASSPHRASE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
let passphraseTimeout = null;

class Password {
    constructor(name, encryptedData) {
        this._name = name;
        this._encrypted_email = encryptedData[0];
        this._encrypted_user = encryptedData[1];
        this._encrypted_password = encryptedData[2];
        this._encrypted_text = encryptedData[3];
    }

    get name() {
        return this._name;
    }

    get encrypted_data() {
        return [this._encrypted_email, this._encrypted_user, this._encrypted_password, this._encrypted_text];
    }

    async data() {
        try {
            const passphrase = await getOrAskPassphrase();

            const decrypted = await Promise.all([
                decryptData(this._encrypted_email, passphrase),
                decryptData(this._encrypted_user, passphrase),
                decryptData(this._encrypted_password, passphrase),
                decryptData(this._encrypted_text, passphrase)
            ]);

            return decrypted;
        } catch (err) {
            console.error('Error decrypting password data:', err);
            throw new Error('Failed to decrypt password: ' + err.message);
        }
    }

    async savePasswordToLocalstorage() {
        if (localStorage.getItem("pass" + this.name) === null) {
            localStorage.setItem("pass" + this.name, JSON.stringify(this.encrypted_data));
        } else {
            throw new Error("Password already exists");
        }
    }
}

/**
 * Gets passphrase from session or asks user
 * Implements session timeout for security
 */
async function getOrAskPassphrase() {
    // Clear expired session
    if (passphraseTimeout && Date.now() > passphraseTimeout) {
        clearSessionPassphrase();
    }

    // Return cached passphrase if available
    if (sessionPassphrase) {
        return sessionPassphrase;
    }

    // Ask for passphrase
    return await askSecretPassphrase();
}

/**
 * Clears the session passphrase from memory
 */
function clearSessionPassphrase() {
    sessionPassphrase = null;
    passphraseTimeout = null;
    console.log('Session passphrase cleared');
}

/**
 * Prompts user for passphrase with retry logic
 */
async function askSecretPassphrase() {
    const ATTEMPT_TIMEOUT = 60 * 1000; // 1 minute

    while (true) {
        const passphrase = await showPrompt("Please enter your passphrase:", { inputType: 'password' });

        if (passphrase === null) {
            throw new Error("Passphrase cancelled by user");
        }

        if (passphrase === "") {
            await showAlert("Passphrase cannot be empty. Please try again.");
            continue;
        }

        const checker = localStorage.getItem("Checker");
        if (!checker) {
            throw new Error("No passphrase set up. Please set up a passphrase first.");
        }

        let isCorrect = false;
        try {
            isCorrect = await verifyPassphrase(passphrase, checker);
        } catch (err) {
            // treat verification error as wrong passphrase
        }

        if (isCorrect) {
            sessionPassphrase = passphrase;
            passphraseTimeout = Date.now() + PASSPHRASE_TIMEOUT;
            setTimeout(clearSessionPassphrase, PASSPHRASE_TIMEOUT);
            return passphrase;
        }

        await showAlert("Wrong passphrase. Please wait 1 minute before trying again.");
        await new Promise(resolve => setTimeout(resolve, ATTEMPT_TIMEOUT));
    }
}

/**
 * Creates a new password entry
 */
async function createPassword(name, arr) {
    try {
        const passphrase = await getOrAskPassphrase();

        // Encrypt all fields
        const encrypted = await Promise.all([
            encryptData(arr[0], passphrase),  // email
            encryptData(arr[1], passphrase),  // user
            encryptData(arr[2], passphrase),  // password
            encryptData(arr[3], passphrase)   // description
        ]);

        const password = new Password(name, encrypted);
        await password.savePasswordToLocalstorage();

        passwords = await updatePasswordsAndDOM();
        return password;
    } catch (err) {
        console.error('Error creating password:', err);
        throw err;
    }
}

/**
 * Removes a password entry
 */
async function removePassword(name) {
    if (name === "-- All --") {
        for (let key in localStorage) {
            if (key.substring(0, 4) === "pass") {
                localStorage.removeItem(key);
            }
        }
        localStorage.removeItem("Checker");
        firstVisitHTML.classList.remove("hdn");
    } else {
        for (let key in localStorage) {
            if (key === "pass" + name) {
                localStorage.removeItem(key);
                passwords = await updatePasswordsAndDOM();
                return name;
            }
        }
    }
    throw new Error("No password in database with that name");
}

/**
 * Updates password list and DOM dropdowns
 */
async function updatePasswordsAndDOM() {
    let passwords = [];

    for (let key in localStorage) {
        if (key.substring(0, 4) === "pass") {
            try {
                const name = key.substring(4);
                const encrypted = JSON.parse(localStorage[key]);
                const password = new Password(name, encrypted);
                passwords.push(password);
            } catch (err) {
                console.error('Error parsing password entry:', err);
            }
        }
    }

    passwords.sort((a, b) => a.name < b.name ? -1 : 1);

    // Update dropdowns
    selectDropdownHTML.innerHTML = "<option>-- Please select a password --</option>";
    deleteDropdownHTML.innerHTML = "<option>-- Please select a password --</option>";

    passwords.forEach(item => {
        const option1 = document.createElement('option');
        option1.textContent = item.name;
        selectDropdownHTML.appendChild(option1);

        const option2 = document.createElement('option');
        option2.textContent = item.name;
        deleteDropdownHTML.appendChild(option2);
    });

    deleteDropdownHTML.appendChild(document.createElement('option')).textContent = "-- All --";

    // Display recent passwords if function exists
    if (typeof displayRecentPasswords !== 'undefined') {
        displayRecentPasswords();
    }

    return passwords;
}

let passwords = [];

/**
 * Sets up a new passphrase on first visit
 */
async function createPassphrase() {
    let passphrase = passphraseCreatorInputHTML.value;

    // Validate passphrase
    if (!passphrase || passphrase.length < 5) {
        await showAlert("Passphrase must be at least 5 characters long");
        return;
    }

    // Warn if passphrase is weak
    if (passphrase.length < 12) {
        const isConfirmed = await showConfirm("Your passphrase is relatively short. Are you sure you want to use it?\n\nWe recommend at least 12 characters for better security.");
        if (!isConfirmed) {
            return;
        }
    }

    // Confirm passphrase
    let confirmPass = await showPrompt("Please confirm your passphrase:", { inputType: 'password' });
    if (confirmPass === null) {
        await showAlert("Passphrase creation cancelled");
        return;
    }

    if (confirmPass !== passphrase) {
        await showAlert("Passphrases do not match. Please try again.");
        passphraseCreatorInputHTML.value = "";
        return;
    }

    try {
        // Generate checker value
        const checker = await generatePassphraseChecker(passphrase);
        localStorage.setItem('Checker', checker);

        firstVisitHTML.classList.add("hdn");
        passphraseCreatorInputHTML.value = "";

        // Cache passphrase for session
        sessionPassphrase = passphrase;
        passphraseTimeout = Date.now() + PASSPHRASE_TIMEOUT;
        setTimeout(clearSessionPassphrase, PASSPHRASE_TIMEOUT);

        await showAlert("Passphrase created successfully!");
    } catch (err) {
        await showAlert("Error creating passphrase: " + err.message);
    }
}

/**
 * Changes the master passphrase
 */
async function changePassphrase() {
    try {
        // Verify current passphrase
        const currentPass = await getOrAskPassphrase();

        // Get new passphrase
        let newPass = await showPrompt("Enter your new passphrase:", { inputType: 'password' });
        if (newPass === null) {
            await showAlert("Passphrase change cancelled");
            return;
        }

        if (!newPass || newPass.length < 5) {
            await showAlert("New passphrase must be at least 5 characters long");
            return;
        }

        // Confirm new passphrase
        let confirmNewPass = await showPrompt("Confirm your new passphrase:", { inputType: 'password' });
        if (confirmNewPass === null) {
            await showAlert("Passphrase change cancelled");
            return;
        }

        if (confirmNewPass !== newPass) {
            await showAlert("New passphrases do not match. Please try again.");
            return;
        }

        // Re-encrypt all passwords with new passphrase
        let allPasswords = [];
        for (let key in localStorage) {
            if (key.substring(0, 4) === "pass") {
                const serviceName = key.substring(4);
                const encryptedData = JSON.parse(localStorage[key]);
                const password = new Password(serviceName, encryptedData);

                // Get decrypted data
                const decrypted = await Promise.all([
                    decryptData(password._encrypted_email, currentPass),
                    decryptData(password._encrypted_user, currentPass),
                    decryptData(password._encrypted_password, currentPass),
                    decryptData(password._encrypted_text, currentPass)
                ]);

                // Re-encrypt with new passphrase
                const reEncrypted = await Promise.all([
                    encryptData(decrypted[0], newPass),
                    encryptData(decrypted[1], newPass),
                    encryptData(decrypted[2], newPass),
                    encryptData(decrypted[3], newPass)
                ]);

                allPasswords.push({ serviceName, data: reEncrypted });
            }
        }

        // Clear old encrypted passwords
        for (let key in localStorage) {
            if (key.substring(0, 4) === "pass") {
                localStorage.removeItem(key);
            }
        }

        // Save re-encrypted passwords
        for (let pwd of allPasswords) {
            localStorage.setItem("pass" + pwd.serviceName, JSON.stringify(pwd.data));
        }

        // Update checker
        const newChecker = await generatePassphraseChecker(newPass);
        localStorage.setItem('Checker', newChecker);

        // Update session
        clearSessionPassphrase();
        sessionPassphrase = newPass;
        passphraseTimeout = Date.now() + PASSPHRASE_TIMEOUT;
        setTimeout(clearSessionPassphrase, PASSPHRASE_TIMEOUT);

        await showAlert("Passphrase changed successfully!");
        passwords = await updatePasswordsAndDOM();
    } catch (err) {
        await showAlert("Error changing passphrase: " + err.message);
        console.error(err);
    }
}

/**
 * Exports passwords to encrypted file
 */
async function exportPasswords() {
    if (!await showConfirm("Export all passwords to an encrypted file?\n\nThe file will be encrypted and can only be imported with the correct passphrase.")) {
        return;
    }

    try {
        const currentPass = await getOrAskPassphrase();

        // Collect all passwords
        let passwordsToExport = {};
        for (let key in localStorage) {
            if (key.substring(0, 4) === "pass") {
                const serviceName = key.substring(4);
                passwordsToExport[serviceName] = JSON.parse(localStorage[key]);
            }
        }

        // Create export object
        const exportData = {
            version: "2.0",
            exportDate: new Date().toISOString(),
            passwordCount: Object.keys(passwordsToExport).length,
            passwords: passwordsToExport
        };

        // Encrypt the export
        const encryptedExport = await encryptData(JSON.stringify(exportData), currentPass);

        // Create download file
        const dataBlob = new Blob([encryptedExport], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'passworded-backup-' + new Date().toISOString().split('T')[0] + '.encrypted';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        await showAlert("Passwords exported successfully!");
    } catch (err) {
        await showAlert("Error exporting passwords: " + err.message);
        console.error(err);
    }
}

/**
 * Imports passwords from encrypted file
 */
async function importPasswords() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.encrypted';

    fileInput.addEventListener('change', async function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async function (event) {
            try {
                const encryptedData = event.target.result;

                // Ask for passphrase
                const passphrase = await showPrompt("Enter your passphrase to import passwords:", { inputType: 'password' });
                if (passphrase === null) {
                    await showAlert("Import cancelled");
                    return;
                }

                // Decrypt the file
                const decrypted = await decryptData(encryptedData, passphrase);
                const importData = JSON.parse(decrypted);

                // Validate
                if (!importData.passwords) {
                    throw new Error("Invalid import file format");
                }

                // Show confirmation
                const confirmMsg = `Import ${importData.passwordCount} password(s) from ${new Date(importData.exportDate).toLocaleDateString()}?\n\nPasswords with the same name will be overwritten.`;
                if (!await showConfirm(confirmMsg)) {
                    await showAlert("Import cancelled");
                    return;
                }

                // Import passwords
                let importedCount = 0;
                for (let serviceName in importData.passwords) {
                    localStorage.setItem("pass" + serviceName, JSON.stringify(importData.passwords[serviceName]));
                    importedCount++;
                }

                await showAlert(`Successfully imported ${importedCount} password(s)!`);
                passwords = await updatePasswordsAndDOM();
            } catch (err) {
                await showAlert("Error importing passwords: " + err.message);
                console.error(err);
            }
        };
        reader.readAsText(file);
    });

    fileInput.click();
}

// Initialize
async function init() {
    try {
        if ('Checker' in localStorage) {
            firstVisitHTML.classList.add("hdn");
        }
        passwords = await updatePasswordsAndDOM();
    } catch (err) {
        console.error('Initialization error:', err);
    }
}

passphraseCreatorButtonHTML.addEventListener('click', createPassphrase);

// Run initialization
document.addEventListener('DOMContentLoaded', init);

// Clear passphrase on page unload
window.addEventListener('beforeunload', clearSessionPassphrase);
