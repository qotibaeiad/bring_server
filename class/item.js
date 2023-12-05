class item {
    constructor(url,desc,price,category,quant,shop) {
      if (Item.instance) {
        return Item.instance;
      }
  
      this.url=url;
      this.desc=desc;
      this.price=price;
      this.category=category;
      this.quant=quant;
      this.shop=shop;
  
      // Ensure only one instance is created
      Item.instance = this;
    }
  }

  module.exports = Item;