module.exports = {
    entry: './client/index.tsx',
    output: {
        filename: 'public/bundle.js'
    },
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.tsx', '.js']
    },
    module: {
        loaders: [
            { test: /\.tsx$/, loader: 'ts-loader' }
        ]
    }
}
