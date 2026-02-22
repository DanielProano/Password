<img width="1901" height="909" alt="image" src="https://github.com/user-attachments/assets/1bbc9eb2-0704-4ddb-88b5-3e265aad4c47" />

# Password Manager

A Zero-Knowledge Password Manager MVP.

By Wikipedia: "a type of zero-knowledge proof that allows one party (the prover) to prove

to another party (the verifier) that it knows a value of a password, without revealing

anything other than the fact that it knows the password to the verifier."


In other words, my password manager ensures complete security for users data, even assuming

the worst case where an attacker gets the backend. 


Inspired by Bitwarden Password Manager: https://bitwarden.com/

## Features

- Zero Knowledge Implementation

- Secure user registration and login

- Master password salting and hashing with bcrypt

- Client side data encryption using a master password token and salt

- JSON Web Token generation and persistent session with JWT-based authentication

- Add, store, and delete passwords in an sqlite database

- Rate Limiting

- Strong master passwords enforced

- Automatic vault lock after an hour of inactivity

## Tech Stack

### Docker

- For containerizing, isolation, and easy deployment of both

  the backend and frontend

### Google Cloud Run

- Deployed via serverless Network Endpoint Group (NEG) 

### Backend:

- **javascript** - Makes up a majority of my backend

- **sqlite3** - My Database of choice

- **express.js** - Web Framework

- **express-rate-limit** - Library for rate limiting

- **jsonwebtoken** - Library for JWT generation and verification

- **dotenv** - Library to load and use local, secret variables

- **crypto** - Library used to create secure and random salts

### Frontend:

- **React** - My language of choice to write the frontend

- **vite** - Frontend build tool

- **dproano_npm/website-topbar** - My custom topbar component publically available on npm 

- **react-router-dom** - React library facilitating the interaction between

- **bcryptjs** - Javascript library for hashing and salting

different pages

## Security Model Explanation

Upon registration, with strong password generation enforced, the master password

is salted and hashed locally using bcrypt's blowfish hashing algorithm and

then stored alongside the salt and username. 


Upon login, the salt is retrieved from the backend and used to verify the hashes from the input and database

are the same. Then, a JWT token with a unique secret and hour validity 

is generated and used throughout the users session. Finally, a strong key

derived from the PBDKF2 algorithm is used to encrypt the vault information.

This ensures that even if the database is compromised, it is unreadable without the

the master password.

## .Env

JWT_SECRET=Some Secret String

PORT=8080

## Installation

git clone https://github.com/DanielProano/Password-Manager.git

cd password-manager

# (make the .ENV file in the backend)

# Script to auto deploy to localhost

./host.sh
