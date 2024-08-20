ReactAPP

//create model
npx sequelize-cli model:generate --name Voice --attributes name:string

//migrate
npx sequelize-cli db:migrate

// Create Seeder
npx sequelize-cli seed:generate --name demo-user

//run specific
npx sequelize-cli db:seed --seed name-of-seeder-file.js

//run seeder
npx sequelize-cli db:seed:all

//undo all
npx sequelize-cli db:seed:undo:all