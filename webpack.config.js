module.exports = {
    entry: {
        index: ['./src/client/index/main.tsx'],
        project: ['./src/client/project/main.tsx']
    },
    output: {
        library: "[name]",
        filename: './dist/public/[name].bundle.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        loaders: [
            {test: /\.tsx?$/, loader: 'ts-loader'}
        ]
    },
    externals: {
        "react": "React",
        "react-dom": "ReactDOM",
        "react-bootstrap": "ReactBootstrap"
    }
}