module.exports = {
  resolve: {
    extensions: ['.js', '.svelte'],
    mainFields: ['svelte', 'browser', 'module', 'main']
  },
  module: {
    rules: [
      {
        test: /\.svelte$/,
        exclude: /node_modules/,
        use: {
          loader: 'svelte-loader',
          options: {
            skipIntroByDefault: true,
            nestedTransitions: true,
            emitCss: true,
            hotReload: true
          }
        }
      }
    ]
  }
}
