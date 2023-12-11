import path from 'path';

const __dirname = path.resolve();

export default {
    optimization: {
        minimize: true
    },
    entry: './src/bundleEntry.js',
    mode: 'production',
    output: {
        path: `${__dirname}`,
        filename: 'demo/dist/lavatube.js',
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