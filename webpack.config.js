const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env, argv) => {
  return {
    stats: "minimal",
    entry: "./src/index.ts",

    // build destination
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "bundle.js",
      publicPath: "/",
    },

    // Config for your testing server
    devServer: {
      compress: true,
      allowedHosts: "all",
      static: false,
      client: {
        logging: "warn",
        overlay: {
          errors: true,
          warnings: false,
        },
        progress: true,
      },
      port: 1234,
      host: "0.0.0.0",
    },

    // Web games are bigger than pages, disable the warnings that our game is too big.
    performance: { hints: false },

    // Enable sourcemaps while debugging
    devtool: argv.mode === "development" ? "eval-source-map" : undefined,

    // Minify the code when making a final build
    optimization: {
      minimize: argv.mode === "production",
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            ecma: 6,
            compress: { drop_console: true },
            output: { comments: false, beautify: false },
          },
        }),
      ],
    },

    // Explain webpack how to do Typescript
    module: {
      rules: [
        {
          test: /\.ts(x)?$/,
          loader: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          include: /stylesheets|node_modules/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.scss$/,
          include: /stylesheets/,
          use: ["style-loader", "css-loader", "sass-loader"],
        },
        {
          test: /\.(png|svg|jpg|gif|jpe?g)$/,
          use: [
            {
              options: {
                name: "[name].[ext]",
                outputPath: "images/",
              },
              loader: "file-loader",
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },

    plugins: [

      // Make an index.html from the template
      new HtmlWebpackPlugin({
        template: "index.html",
        hash: true,
        minify: argv.mode === "production" ? { collapseWhitespace: true } : false,
      }),
    ],
  };
};
