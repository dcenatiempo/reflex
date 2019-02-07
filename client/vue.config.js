module.exports = {
    devServer: {
      proxy: {
        "/socket": {
          target: "http://localhost:3000/socket",
          secure: false,
          changeOrigin: true
        },
      }
    }
  };