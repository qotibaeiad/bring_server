class Item {
  constructor(id, url, desc, price, category, quant, shop) {
    this.id = id;
    this.url = url;
    this.desc = desc;
    this.price = price;
    this.category = category;
    this.quant = quant;
    this.shop = shop;
  }
}

module.exports = Item;
