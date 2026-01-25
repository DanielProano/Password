<img width="1901" height="909" alt="image" src="https://github.com/user-attachments/assets/1bbc9eb2-0704-4ddb-88b5-3e265aad4c47" />

# Password Manager

A Zero-Knowledge Password Manager MVP, implementing modern

hashing and encryption methods

## Features

- Zero Knowledge Implementation

- Secure user registration and login

- Master password salting and hashing with bcrypt

- Client side data encryption using a master password token and salt

- JSON Web Token generation and persistent session with JWT-based authentication

- Ability to add, delete, and view vault info

- Rate Limiting

- Strong master passwords enforced

- Automatic vault lock after inactivity

## Tech Stack

### Docker

- For containerizing and isolating the app

### Nginx 

- Acts as a reverse proxy

### Backend:

- **express.js** - Web Framework

- **express-rate-limit** - Library for rate limiting

- **jsonwebtoken** - Library for JWT generation and verification

- **sqlite3** - Database

- **dotenv** - Library to load variables from .env

- **crypto** - Library used to create secure and random salts

### Frontend:

- **vite** - Frontend build tool

- **react-router-dom** - React library facilitating the interaction between

- **bcryptjs** - Javascript library for hashing and salting

different pages

## Security Model

Upon registration, with strong password generation enforced, the master password

is salted and hashed locally using bcrypt's blowfish hashing algorithm and

then stored alongside the salt and username. Upon login, the salt is retrieved

from the backend and used to verify the hashes from the input and database

are the same. Then, a JWT token with a unique secret and hour validity 

is generated and used throughout the users session. Finally, a strong key

derived from the PBDKF2 algorithm is used to encrypt the vault information.

This ensures that even if the database is compromised, it is unreadable without the

the master password.

## .Env

JWT_SECRET=Some String

PORT=8080

## Installation

git clone https://github.com/DanielProano/Password-Manager.git

cd password-manager

(make the .ENV file in the backend)

./host.sh
