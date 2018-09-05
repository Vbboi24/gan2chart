import scss from 'rollup-plugin-scss';
import {uglify} from 'rollup-plugin-uglify';
import merge from 'deepmerge';
import typescript from 'rollup-plugin-typescript3';
import babel from 'rollup-plugin-babel';
import postcss from 'rollup-plugin-postcss';

const dev = {
    input: 'src/index.ts',
    output: {
        name: 'Gan2Chart',
        file: 'dist/gan2chart.js',
        format: 'umd'
    },
    plugins: [
    		typescript(),
    		babel({exclude: ['/\.ts$/', 'src/*.scss','node_modules/**']}),
        scss({
            output: 'dist/gan2chart.css'
        })
    ]
};
const prod = merge(dev, {
    output: {
        file: 'dist/gan2chart.min.js'
    },
    plugins: [uglify(),
              postcss({extensions: [ '.css' ]})]
});

export default [dev, prod];