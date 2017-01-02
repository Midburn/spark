module.exports = {
    entry: './camps_react_client.js',
    output: {
        filename: 'camps_bundle.js',
        path: 'public/scripts'
    },
    module: {
        loaders: [{
            test: /\.jsx$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
                presets: ['react']
            }
        }]
    }
}
