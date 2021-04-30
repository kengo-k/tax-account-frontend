const path = require("path");
const webpack = require("webpack");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const sourcePath = path.resolve(__dirname, "./source");
const outputPath = path.resolve(__dirname, "./public");
const htmlContentPath = path.resolve(__dirname, "./public");

const environment = process.env.NODE_ENV || "development";

module.exports = {
  mode: "development",
  entry: {
    "js/index": [
      "webpack-dev-server/client",
      "webpack/hot/dev-server",
      `${sourcePath}/index.tsx`,
    ],
    "style/style": `${sourcePath}/style/style.scss`,
  },
  output: {
    path: outputPath,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
    alias: {
      "@module": path.resolve(__dirname, "source/module"),
      "@config": path.resolve(__dirname, "source/config"),
      "@api": path.resolve(__dirname, "source/api"),
      "@component": path.resolve(__dirname, "source/component"),
      "@common": path.resolve(__dirname, "source/common"),
    },
  },
  devServer: {
    contentBase: htmlContentPath,
    watchContentBase: true,
    hot: true,
    inline: true,
    disableHostCheck: true,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin({ filename: "[name].css" }),
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify(environment),
    }),
  ],
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
  },
};
