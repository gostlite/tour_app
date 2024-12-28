class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const queryObj = { ...this.queryString };

    const excludedList = ['page', 'sort', 'limit', 'fields'];
    excludedList.forEach((ele) => delete queryObj[ele]);
    // console.log(req.query, queryObj);

    //ADVANCE FILTERING

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query.find(JSON.parse(queryStr));
    // let query = Tour.find(JSON.parse(queryStr));
    console.log(JSON.parse(queryStr));
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortedBy = this.queryString.sort.split(',').join(' ');
      console.log(sortedBy);
      this.query = this.query.sort(sortedBy);
      // query = query.sort(req.query.sort);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  field() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit; // page formular
    this.query = this.query.skip(skip).limit(limit);

    //when no more items
    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('No more documents found');
    // }
    return this;
  }
}
module.exports = ApiFeatures;
