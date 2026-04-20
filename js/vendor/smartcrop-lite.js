(function (global) {
  const smartcrop = {
    crop(image, options) {
      const width = options && options.width ? options.width : image.width;
      const height = options && options.height ? options.height : image.height;
      const x = Math.max(0, Math.round((image.width - width) / 2));
      const y = Math.max(0, Math.round((image.height - height) / 2));
      return Promise.resolve({
        topCrop: { x, y, width, height },
      });
    },
  };

  global.smartcrop = smartcrop;
})(window);
