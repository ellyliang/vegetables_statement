module.exports = {
  devServer: {
    port: 8084,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  configureWebpack: {
    output: {
      library: 'stall-management',
      libraryTarget: 'umd'
    }
  }
};
