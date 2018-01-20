const webpack = require('webpack'),
    path = require('path'),
    OpenBrowserPlugin = require('open-browser-webpack-plugin')

module.exports = {
    context: path.join(__dirname, '/js'),
    entry: {
     app: './ng_app.js',
     vendor: ['angular']
    },
    output: {
     path: path.join(__dirname, '/public/scripts'),
     filename: 'app.bundle.js'
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
         name: 'vendor', filename: 'vendor.bundle.js'
        }),
        new OpenBrowserPlugin({
            url: 'http://localhost:3000',
            delay: 200
        })
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            },
        ]
    },
    stats: {
        colors: true
    },
    devtool: 'source-map'
};
