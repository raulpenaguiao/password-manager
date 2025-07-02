# password-manager


---

## Features

 - Encrypted locally stored webapp for passwords
 - Password generator and secure storage
 - Intuitive UI


---

## Known issues and future tasks

1. UX/UI Improvements

Separate Read and Update windows for clearer design and user flow.

Improve UI to visually distinguish between Create, Read, Update, and Delete actions.

    Add confirmation prompts for destructive actions like Delete.

2. Passphrase Features

Implement passphrase change functionality securely.

Ensure changing the passphrase re-encrypts all saved passwords with the new passphrase.

    Add passphrase strength indicator during creation and change.

3. Encryption & Security

Integrate encryption for password storage using a secure in-browser method (e.g., Web Crypto API or CryptoJS).

Encrypt passwords before saving them locally.

    Decrypt passwords only after correct passphrase is entered.

4. Export/Import

Add export feature to download all passwords in a secure format (e.g., encrypted JSON or CSV).

    Consider adding an import feature to restore passwords from exported files.

5. Testing & Documentation

Test across different browsers and devices for consistency.

Write or update README with features, setup instructions, and security notes.