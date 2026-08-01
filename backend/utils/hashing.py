"""
Password hashing helpers using bcrypt.
Store password hashes as binary (bytes) in the database.
"""
import bcrypt


def hash_password(plain_password: str) -> bytes:
    """Hash a plain-text password and return the binary hash.

    Args:
        plain_password: user-supplied password string
    Returns:
        bcrypt hash (bytes) suitable for storing in DB
    """
    if isinstance(plain_password, str):
        plain_password = plain_password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(plain_password, salt)


def check_password(plain_password: str, password_hash: bytes) -> bool:
    """Check a plain password against the stored bcrypt hash."""
    if isinstance(plain_password, str):
        plain_password = plain_password.encode("utf-8")
    try:
        return bcrypt.checkpw(plain_password, password_hash)
    except Exception:
        return False
