# auth0-member-automator
A Puppeteer-based browser automation service to automatically onboard and offboard tenant members

## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

- node v16.x
- npm v8.5.x

### Installation

1. Clone the repository
```sh
git clone git@github.com/akhale3/auth0-member-automator
```
2. Change into directory
```sh
cd auth0-member-automator
```
3. Create a `.env` from the provided `.env.sample` file
```sh
cp .env.sample .env
```
5. Fill out the `.env` file as per your configuration
6. Install dependencies
```sh
npm ci
```

## Usage
```sh
npm start
```
