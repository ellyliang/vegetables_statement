module.exports = {
  devServer: {
    port: 8082,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  configureWebpack: {
    output: {
      library: 'settlement',
      libraryTarget: 'umd'
    }
  }
};
