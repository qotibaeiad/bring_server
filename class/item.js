class Item {
  constructor(id, url, desc, price, category, quant, shop,time,location,stars) {
    this.id = id;
    this.url = url;
    this.desc = desc;
    this.price = price;
    this.category = category;
    this.quant = quant;
    this.shop = shop;
    this.time = time;
    this.location = location;
    this.stars = stars;
  }
}

module.exports = Item;
