/**
 * Secure Encryption Utilities using Web Crypto API
 * Implements AES-256-GCM with PBKDF2 key derivation
 * No external cryptography libraries required
 */

// ===== CONSTANTS =====
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const PBKDF2_ITERATIONS = 100000; // NIST recommends minimum 100,000
const PBKDF2_ALGORITHM = 'PBKDF2';
const HASH_ALGORITHM = 'SHA-256';
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 128; // 128 bits authentication tag

// ===== KEY DERIVATION =====
/**
 * Derives a cryptographic key from a passphrase using PBKDF2
 * @param {string} passphrase - User's passphrase
 * @param {Uint8Array} salt - Random salt (should be 16 bytes)
 * @returns {Promise<CryptoKey>} Derived key ready for encryption/decryption
 */
async function deriveKey(passphrase, salt) {
    // Convert passphrase string to bytes
    const passphraseData = new TextEncoder().encode(passphrase);

    // Import passphrase as a key for PBKDF2
    const baseKey = await crypto.subtle.importKey(
        'raw',
        passphraseData,
        PBKDF2_ALGORITHM,
        false, // extractable: false for security
        ['deriveBits', 'deriveKey']
    );

    // Derive the final key using PBKDF2
    const derivedKey = await crypto.subtle.deriveKey(
        {
            name: PBKDF2_ALGORITHM,
            salt: salt,
            iterations: PBKDF2_ITERATIONS,
            hash: HASH_ALGORITHM
        },
        baseKey,
        { name: ALGORITHM, length: KEY_LENGTH },
        true, // extractable: true so we can use it
        ['encrypt', 'decrypt']
    );

    return derivedKey;
}

// ===== ENCRYPTION =====
/**
 * Encrypts data with AES-256-GCM
 * Returns: salt (16 bytes) + IV (12 bytes) + ciphertext + tag (embedded in GCM)
 * @param {string} plaintext - Data to encrypt
 * @param {string} passphrase - User's passphrase
 * @returns {Promise<string>} Base64-encoded encrypted data with metadata
 */
async function encryptData(plaintext, passphrase) {
    try {
        // Generate random salt (16 bytes / 128 bits)
        const salt = crypto.getRandomValues(new Uint8Array(16));

        // Generate random IV (12 bytes / 96 bits for GCM)
        const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

        // Derive key from passphrase
        const key = await deriveKey(passphrase, salt);

        // Convert plaintext to bytes
        const plaintextData = new TextEncoder().encode(plaintext);

        // Encrypt using AES-256-GCM
        const ciphertext = await crypto.subtle.encrypt(
            {
                name: ALGORITHM,
                iv: iv,
                tagLength: TAG_LENGTH
            },
            key,
            plaintextData
        );

        // Combine salt + IV + ciphertext (authentication tag is included in ciphertext)
        const encryptedData = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
        encryptedData.set(salt, 0);
        encryptedData.set(iv, salt.length);
        encryptedData.set(new Uint8Array(ciphertext), salt.length + iv.length);

        // Return as base64 for storage
        return btoa(String.fromCharCode.apply(null, encryptedData));
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data: ' + error.message);
    }
}

// ===== DECRYPTION =====
/**
 * Decrypts AES-256-GCM encrypted data
 * @param {string} encryptedBase64 - Base64-encoded encrypted data
 * @param {string} passphrase - User's passphrase
 * @returns {Promise<string>} Decrypted plaintext
 */
async function decryptData(encryptedBase64, passphrase) {
    try {
        // Decode from base64
        const encryptedData = new Uint8Array(
            atob(encryptedBase64).split('').map(c => c.charCodeAt(0))
        );

        // Extract components
        const salt = encryptedData.slice(0, 16);
        const iv = encryptedData.slice(16, 16 + IV_LENGTH);
        const ciphertext = encryptedData.slice(16 + IV_LENGTH);

        // Derive key from passphrase using same salt
        const key = await deriveKey(passphrase, salt);

        // Decrypt using AES-256-GCM
        const plaintextData = await crypto.subtle.decrypt(
            {
                name: ALGORITHM,
                iv: iv,
                tagLength: TAG_LENGTH
            },
            key,
            ciphertext
        );

        // Convert decrypted bytes to string
        return new TextDecoder().decode(plaintextData);
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data: Passphrase may be incorrect or data corrupted');
    }
}

// ===== UTILITY FUNCTIONS =====
/**
 * Securely clears sensitive data from memory
 * @param {Uint8Array} buffer - Buffer to clear
 */
function secureClear(buffer) {
    if (buffer && buffer.length) {
        crypto.getRandomValues(buffer);
    }
}

/**
 * Generates a random passphrase checker value
 * Used to verify passphrase without storing it
 * @param {string} passphrase - User's passphrase
 * @returns {Promise<string>} Encrypted checker value
 */
async function generatePassphraseChecker(passphrase) {
    // Encrypt a known value to use as verification
    return encryptData('PASSWORDED_CHECKER', passphrase);
}

/**
 * Verifies a passphrase against a checker value
 * @param {string} passphrase - User's passphrase to verify
 * @param {string} checkerValue - Stored checker value
 * @returns {Promise<boolean>} True if passphrase is correct
 */
async function verifyPassphrase(passphrase, checkerValue) {
    try {
        const decrypted = await decryptData(checkerValue, passphrase);
        return decrypted === 'PASSWORDED_CHECKER';
    } catch (error) {
        return false;
    }
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        encryptData,
        decryptData,
        deriveKey,
        secureClear,
        generatePassphraseChecker,
        verifyPassphrase
    };
}
