const { Op } = require("sequelize");

class APIFeature {
  #params = {};
  #limit;
  #query;
  #totalPage = 0;
  #totalItems = 0;

  constructor({ query, params, limit }) {
    if (!params) {
      this.#params = {};
    }
    this.#params = params || {};
    this.#query = query;
    this.#limit = +limit || 5;
  }
  search(values) {
    const or = [];
    for (const key in values) {
      or.push({
        [key]: {
          [Op.like]: `%${values[key]}%`
        }
      });
    }
    this.#params = {
      ...this.#params,
      where: {
        ...this.#params?.where,
        [Op.or]: or
      }
    };

    return this;
  }

  orderBy(values = []) {
    this.#params = {
      ...this.#params,
      order: values
    };
  }

  specificSearch(values) {
    this.#params = {
      ...this.#params,
      where: {
        ...this.#params?.where,
        ...values
      }
    };
  }

  whereAnd(values) {
    this.#params = {
      ...this.#params,
      where: {
        ...values
      }
    };

    return this;
  }

  includes(models = []) {
    this.#params = {
      ...this.#params,
      include: models
    };

    return this;
  }

  paginate(pageno = 1) {
    const offset = (pageno - 1) * this.#limit;
    this.#params = {
      ...this.#params,
      offset,
      limit: this.#limit
    };

    return this;
  }

  projection(attr = ["id"]) {
    this.#params = {
      ...this.#params,
      attributes: attr
    };
    return this;
  }

  getTotalPages() {
    return this.#totalPage;
  }

  getTotalItems() {
    return this.#totalItems;
  }

  async find(condition) {
    return await this.#query.findOne({
      ...this.#params,
      where: {
        ...this.#params?.where,
        ...condition
      }
    });
  }

  async exec() {
    const result = await this.#query.findAndCountAll({
      ...this.#params
    });
    if (result) {
      this.#totalPage = Math.ceil(result?.count / this.#limit);
      this.#totalItems = result?.count;
    }
    return result;
  }
}

module.exports = APIFeature;
