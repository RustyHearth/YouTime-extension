import path from "path";
import WebpackExtensionManifestPlugin from "webpack-extension-manifest-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import { DefinePlugin } from "webpack";

module.exports = (env) => {
  const browser = env.BROWSER ? env.BROWSER : "firefox";
  const { ModuleFederationPlugin } = require("webpack").container;
  let generalConfig: any = {
    mode: "production",
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          use: [
            {
              loader: "ts-loader",
              // options: {
              //     transpileOnly: true,
              // },
            },
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.(scss|css)$/,
          use: [
            {
              loader: "style-loader",
            },
            {
              loader: "css-loader",
              options: {
                import: true,
              },
            },
            {
              loader: "sass-loader",
            },
          ],
        },
      ],
    },
    resolve: {
      alias: {
        listeners: path.resolve(__dirname, "./src/listeners/"),
        background: path.resolve(__dirname, "./src/background/"),
        content: path.resolve(__dirname, "./src/content/"),
        components: path.resolve(__dirname, "./src/components/"),
        themes: path.resolve(__dirname, "./src/themes/"),
        types: path.resolve(__dirname, "./src/types/"),
        "@mui/material": path.resolve("./node_modules/@mui/material/"),
      },
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
    entry: {
      popup: [path.resolve(__dirname, `src/index.tsx`)],
      content: [path.resolve(__dirname, `src/content/index.tsx`)],
      background: [path.resolve(__dirname, `src/background/index.tsx`)],
    },
    output: {
      path: path.resolve(process.cwd(), `${browser}/out`),
      filename: "[name]/[name].js",
    },
    optimization: {
      minimize: false,
    },
  };

  let plugins: any[] = [
    new ModuleFederationPlugin({
      shared: {
        "@mui/material/styles": {
          singleton: true,
        },
      },
    }),

    new DefinePlugin({
      "process.browser": JSON.stringify(browser),
    }),
    new WebpackExtensionManifestPlugin({
      config: { base: require(`./src/manifest-${browser}.json`) },
    }),
    new HtmlWebpackPlugin({
      title: "Popup",
      filename: path.resolve(__dirname, `${browser}/out/popup/index.html`),
      template: path.resolve(__dirname, `src/index.html`),
      chunks: ["popup"],
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, `src/icons`),
          to: path.resolve(__dirname, `${browser}/out/icons`),
        },
      ],
    }),
  ];

  return [
    {
      ...generalConfig,
      plugins,
    },
  ];
};
