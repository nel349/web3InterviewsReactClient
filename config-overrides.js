const webpack = require('webpack');

// import webpack from 'webpack';

module.exports = function override(config) {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert/'),
        zlib: require.resolve("browserify-zlib"),
        path: require.resolve("path-browserify"),
        // http: require.resolve('stream-http'),
        // https: require.resolve('https-browserify'),
        // os: require.resolve('os-browserify'),
        url: require.resolve('url'),
    });
    config.resolve.fallback = fallback;
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser.js',
            Buffer: ['buffer', 'Buffer']
        })
    ]);
    config.ignoreWarnings = [/Failed to parse source map/];
    return config;
};
