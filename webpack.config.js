const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { composePlugins, withNx } = require('@nx/webpack');

module.exports = composePlugins(withNx(), (config) => {
  // Add the BundleAnalyzerPlugin only when ANALYZE is set to true
  if (process.env.ANALYZE === 'true') {
    config.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: 'bundle-report.html',
        openAnalyzer: false,
        generateStatsFile: true,
        statsFilename: 'bundle-stats.json',
      })
    );
  }
  
  return config;
});
