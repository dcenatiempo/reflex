module.exports = {
    devServer: {
      proxy: {
        "/socket": {
          target: "http://localhost:3000/socket",
          secure: false,
          changeOrigin: true
        },
      }
    },
    css: {
      loaderOptions: {
        sass: {
          data: `
            @import "@/scss/_variables.scss";
            @import "@/scss/_global.scss";
          `
        }
      }
    }
  };