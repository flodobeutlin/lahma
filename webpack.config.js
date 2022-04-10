const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path = require("path");

const htmlConfig = {
    title: "Lahma"
};

module.exports = {
    plugins: [ new CleanWebpackPlugin(), new HtmlWebpackPlugin(htmlConfig) ],
    output: {
        path: path.resolve(__dirname, "../dist")
    },
    optimization: {
        splitChunks: {
            chunks: "all"
        }
    }
};
