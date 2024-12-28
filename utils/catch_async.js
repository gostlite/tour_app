module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // this is the code that make rejected promise move to the catch block
  };
};
