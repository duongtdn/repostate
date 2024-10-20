const path = require("path");

module.exports = {
    entry: {
      app: ["./example/app.js"]
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "example"),
      publicPath: "/assets/",
    },
    resolve: {
      extensions: ['.js', '.jsx'],
      alias: { react: path.resolve('node_modules/react') },
    },
    module: {
      rules: [
        {
          test: /(\.js?$|\.jsx?$)/,
          use: 'babel-loader',
          exclude: /node_modules/
        }
      ]
    },
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
      static: [
        {
          directory: path.join(__dirname, 'example'),
          publicPath: "/",
        },
        {
          directory: path.join(__dirname, 'example'),
          publicPath: "/assets/",
        },
      ],
      historyApiFallback: true
    }
}