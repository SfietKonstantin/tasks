module.exports = {
    entry: {
        project: './client/project.tsx',
        task: './client/task.tsx',
        imports: './client/imports.tsx'
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
        "react-bootstrap": "ReactBootstrap",
        "jquery": "jQuery"
    }
}
