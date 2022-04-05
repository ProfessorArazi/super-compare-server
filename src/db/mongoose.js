const mongoose = require("mongoose");
const uri =
  "mongodb+srv://Ameat:Amit1122@cluster0.cgrvm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

mongoose.connect(uri, {
  useNewUrlParser: true,
});
