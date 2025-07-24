const path = require('path');

module.exports = {
    entry: './main.js',
    mode: 'production', // o 'development' para debugging
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        library: 'helloWorld', // Nombre de la biblioteca global
        libraryTarget: 'umd', // Formato universal para que funcione en diferentes entornos
        globalObject: 'this'
    },
    resolve: {
        extensions: ['.js']
    }
};
