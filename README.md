# -> [Demo Site](https://storage.googleapis.com/birme-sd-variant/index.html?target_width=512&target_height=512) <-

# Birme Variant for Stable Diffusion
When training Stable Diffusion (or other generative image models) we need high quality and cropped training images at 512x512.  Birme is the best tool for doing this quickly, and with the help of [smartcrop.js](https://github.com/jwagner/smartcrop.js/) it's truly a powerful tool for batch cropping images.

## Local Install
Clone the repository and open index.html in your favorite browser (excluding Firefox).  Feel free to bookmark!
```bash
git clone https://github.com/livelifebythecode/birme-sd-variant.git
cd birme-sd-variant
python -m webbrowser index.html  # or simply open the index.html file
```

## Run with Docker-Compose
```bash
git clone https://github.com/livelifebythecode/birme-sd-variant.git
cd birme-sd-variant
docker-compose up -d
# Open browser to => http://<HOST_IP>:8080
```

## Problem
Birme restricts the users ability to choose what smoothing is applied which can result in a lower quality cropped image.

In the Birme code, notice the line `con.imageSmoothingQuality = "medium";` hardcodes the smoothing quality when we crop the image.
```js
process_image(img, file) {
    ...
    let canvas = document.createElement("canvas");
    canvas.width = tw;
    canvas.height = th;
    let con = canvas.getContext("2d");
    con.imageSmoothingEnabled = true;
    con.imageSmoothingQuality = "medium";
    ...
}
```
(sourced on 10-14-22: [line #627](https://www.birme.net/static/js/scripts-323dd.js?953e6bb6))

## Solution
Select the desired smoothing quality in the "Image Format / Quality" settings
![Image of the Quality Preset dropdown box in the "Image Format / Quality settings](https://i.imgur.com/j2Uh1KJ.png)

## Results
TODO: Show comparison of 'Medium', 'High', and 'Hermite' quality presets
High works better on landscape/subjects typically, where as Medium is better at smoothing close up text.

## Limitations
- 🦊 FIREFOX NOT SUPPORTED - [supported browsers](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingQuality#browser_compatibility)

## Authors
- [Birme Author, support them](https://www.birme.net/)
- Small feature written by me

## Extra
The Hermite quality option uses the [Hermite resize library](https://github.com/viliusle/Hermite-resize) so you can experiment with what gives you the best quality image for your source images.


## 与 birme.net 对齐更新（2026-04）
- 新增 AVIF 输出格式选项与独立质量参数。
- 新增“Use High Quality Resize Method（slower）”选项，使用渐进式缩小提升降采样质量。
- 默认 WebP 质量调整为 80，接近主站默认建议。

> 说明：本仓库现已移除页面中的 CDN 依赖，第三方能力已本地化到 `js/vendor/*.js`，可在离线环境运行。


## 本地 vendor 目录
- `js/vendor/jquery-lite.js`：项目所需最小 jQuery API 兼容层。
- `js/vendor/load-image-lite.js`：本地图片加载封装。
- `js/vendor/jszip-lite.js`：本地 ZIP 生成（store 模式）。
- `js/vendor/masonry-lite.js`：轻量 Masonry 兼容层。
- `js/vendor/smartcrop-lite.js`：居中裁剪回退实现。
- `js/vendor/filesaver-lite.js`：本地文件保存。
