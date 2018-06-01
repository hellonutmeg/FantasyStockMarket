
var mongoose = require('mongoose');

var StockSchema = new mongoose.Schema({
  name: String,
  price: {type: Number, default: 0},
  lastUpdated: {type: Date, default: 0},
  enabled: boolean
}, { usePushEach: true });

StockSchema.methods.enable = function(cb) {
  this.enabled = true;
  this.save(cb);
};

StockSchema.methods.disable = function(cb) {
    this.enabled = false;
    this.save(cb);
};

mongoose.model('Stock', StockSchema);
