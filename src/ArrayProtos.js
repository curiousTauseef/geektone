// TODO ensure this is always loaded!

Object.defineProperty(Array.prototype, 'next', {
    value: function(i) {
      return i === this.length - 1? 0 : i + 1;
  }
});
Object.defineProperty(Array.prototype, 'prev', {
    value: function(i) {
      return i === 0 ? this.length : i - 1;
  }
});
