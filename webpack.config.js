module.exports = {
    entry: {
        task: './client/task.tsx'
    },
    output: {
        library: "[name]",
        filename: 'public/[name].bundle.js'
    },
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.tsx', '.js']
    },
    module: {
        loaders: [
            { test: /\.tsx$/, loader: 'ts-loader' }
        ]
    },
    externals: {
        "react": "React",
        "react-dom": "ReactDOM",
        "jquery": "jQuery"
    }
}
