
var mongoose = require('mongoose');

var TradeSchema = new mongoose.Schema({
  stockId: Number,
  price: Number,
  quantity: Number,
  trader: String
},{ usePushEach: true });

/*
  TradeSchema.methods.upvote = function(cb) {
  this.upvotes += 1;
  this.save(cb);
};
*/

mongoose.model('Trade', TradeSchema);
