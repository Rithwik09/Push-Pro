# Push Pro Backend

## Install Packages, Run and Build

## NPM

npm install => To install
npm run dev => To run app
npm run build / npm build => Test Build

## YARN

yarn install => To install
yarn run dev => To run app
yarn run build / yarn build => Test Build

## Sequelize Commands

## Initialize DB and Migrations =>

npx sequelize db:migrate => to run all migrations

## Run all seeders =>

npx sequelize db:seed:all

## Run seed files individually =>

npx sequelize-cli db:seed --seed {file-name.js}

## Undo All Seed Data

npx sequelize db:seed:undo:all

## Undo Individual Seed File

npx sequelize db:seed:undo --seed (file-name.js)

## Sequence To Truncate All Tables Data and Add Default(Seed Data)

1=> npx sequelize db:seed:undo:all
2=> npx sequelize db:migrate:undo:all

### All Data Trucated

3=> npx sequelize db:migrate
4=> npx sequelize db:seed:all

## Create Seeder
npx sequelize seed:generate --name {file-name}

## Generate migration
$ npx sequelize migration:generate --name {file-name}

## Generate model for migration
npx sequelize model:generate --name  admin_roles --attributes group_name:STRING,description:TEXT,status:BOOLEAN,permissions:JSON

## Update migration
$ npx sequelize migration:generate --name update-admin-users-role-id

User Management => Manage Users
                => Manage Roles