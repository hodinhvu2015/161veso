const bcrypt = require("bcrypt");

bcrypt.hash("gicungduoc", 10).then(hash => {
    console.log(hash);
});