const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const sourcePath = path.resolve(__dirname, "./src");
const outputPath = path.resolve(__dirname, "./public");
const htmlContentPath = path.resolve(__dirname, "./public");

const environment = process.env.NODE_ENV || "development";

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    "js/index": `${sourcePath}/index.tsx`,
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
      "@module": path.resolve(__dirname, "src/module"),
      "@config": path.resolve(__dirname, "src/config"),
      "@api": path.resolve(__dirname, "src/api"),
           "@component": path.resolve(__dirname, "src/component"),
      "@common": path.resolve(__dirname, "src/common"),
    },
  },
  devServer: {
    hot: true,
    historyApiFallback: true,
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: "[name].css" }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(environment),
    }),
  ]
};
