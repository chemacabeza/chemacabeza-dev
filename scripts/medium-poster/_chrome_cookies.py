#!/usr/bin/env python3
"""Decrypt Chrome's Linux cookie DB and print medium.com cookies as a
single `Cookie:`-header-style line: `name=value; name=value; ...`.

Helper for refresh-cookies-and-publish.sh. Linux Chrome encrypts each
cookie's value with AES-256-CBC using a key stored in libsecret/
gnome-keyring (`Chrome Safe Storage`). The encryption scheme:
  - password = secret-tool lookup application chrome  (or 'peanuts'
    if no keyring is available)
  - key      = PBKDF2-HMAC-SHA1(password, salt='saltysalt', iter=1, len=16)
  - iv       = b' ' * 16
  - ciphertext is prefixed with b'v10' or b'v11'
  - PKCS7 padded

Outputs only successfully-decrypted cookies. Empty pairs are omitted,
so callers can rely on the presence of `sid=...` as a validity check.
"""
import os
import shutil
import sqlite3
import subprocess
import sys
import tempfile

from cryptography.hazmat.primitives import hashes, padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

DEFAULT_DB = os.path.expanduser('~/.config/google-chrome/Default/Cookies')
HOST_FILTER = os.environ.get('CHROME_HOST_FILTER', '%medium.com%')


def get_password() -> bytes:
    try:
        out = subprocess.run(
            ['secret-tool', 'lookup', 'application', 'chrome'],
            capture_output=True, check=True, timeout=5,
        ).stdout.strip()
    except (FileNotFoundError, subprocess.CalledProcessError, subprocess.TimeoutExpired):
        out = b''
    return out or b'peanuts'  # Chrome's no-keyring fallback


def derive_key(password: bytes) -> bytes:
    kdf = PBKDF2HMAC(algorithm=hashes.SHA1(), length=16, salt=b'saltysalt', iterations=1)
    return kdf.derive(password)


def _try_decrypt(ciphertext: bytes, key: bytes, iv: bytes, strip_prefix: int):
    if len(ciphertext) % 16 != 0:
        return None
    decryptor = Cipher(algorithms.AES(key), modes.CBC(iv)).decryptor()
    raw = decryptor.update(ciphertext) + decryptor.finalize()
    unpadder = padding.PKCS7(128).unpadder()
    try:
        plain = unpadder.update(raw) + unpadder.finalize()
    except ValueError:
        return None
    if strip_prefix and len(plain) >= strip_prefix:
        plain = plain[strip_prefix:]
    try:
        return plain.decode('utf-8')
    except UnicodeDecodeError:
        return None


def decrypt(enc: bytes, key: bytes) -> str:
    if not enc or enc[:3] not in (b'v10', b'v11'):
        return ''
    # Chrome's per-cookie layout on Linux varies with version:
    #   Newer:  prefix(3) + IV(16)  + ciphertext, plaintext = hash(16) + value
    #   Legacy: prefix(3) + ciphertext (fixed-space IV), plaintext = value
    # Try newer first, fall back to legacy. One produces valid UTF-8.
    candidates = [
        (enc[3:19], enc[19:], 16),   # embedded IV + 16-byte plaintext prefix
        (b' ' * 16, enc[3:], 0),     # legacy fixed IV, no prefix
    ]
    for iv, ciphertext, strip in candidates:
        value = _try_decrypt(ciphertext, key, iv, strip)
        if value is not None:
            return value
    return ''


def main():
    db_path = os.environ.get('CHROME_COOKIES_DB', DEFAULT_DB)
    if not os.path.exists(db_path):
        sys.stderr.write(f'chrome cookies db not found at {db_path}\n')
        sys.exit(2)

    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        shutil.copy(db_path, tmp.name)
        db_copy = tmp.name
    try:
        key = derive_key(get_password())
        conn = sqlite3.connect(db_copy)
        try:
            rows = conn.execute(
                'SELECT name, encrypted_value FROM cookies WHERE host_key LIKE ?',
                (HOST_FILTER,),
            ).fetchall()
        finally:
            conn.close()
        pairs = []
        for name, enc in rows:
            value = decrypt(enc, key)
            if value:
                pairs.append(f'{name}={value}')
        sys.stdout.write('; '.join(pairs))
    finally:
        os.unlink(db_copy)


if __name__ == '__main__':
    main()
