const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    optimization: {
        minimize: false
    },
    entry: './src/bundleEntry.js',
    mode: 'development',
    output: {
        filename: 'dist/lavatube.js', // The name of the output file
        path: path.resolve(__dirname, 'demo/'), // The output directory
        // path: `${__dirname}`,
        // filename: 'demo/dist/lavatube.js',
    },
    // Dev Server configuration
    devServer: {
        static: {
            directory: path.join(__dirname, 'demo'), // Serve static assets from this directory
        },
        port: 9000,
    },
    // Plugins
    plugins: [
        new HtmlWebpackPlugin({
            template: './demo/index.html',
            filename: 'index.html',
            inject: false,
        }),
        new HtmlWebpackPlugin({
            template: './demo/walkAndSearch/index.html',
            filename: 'walkAndSearch/index.html',
            inject: false,
        }),
        new HtmlWebpackPlugin({
            template: './demo/tree/index.html',
            filename: 'tree/index.html',
            inject: false,
        }),
        // Add more plugins if needed
    ],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', { targets: "defaults" }]
                        ]
                    }
                }
            }
        ]
    }
};