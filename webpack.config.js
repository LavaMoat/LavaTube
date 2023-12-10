module.exports = {
    optimization: {
        minimize: false
    },
    entry: './bundleEntry.js',
    mode: 'production',
    output: {
        path: `${__dirname}`,
        filename: 'lavatube.js',
    },
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