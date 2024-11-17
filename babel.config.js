module.exports = {
  presets: [
    ['@babel/preset-react', {
      runtime: 'classic',
      development: process.env.NODE_ENV === 'development'
    }]
  ]
};
