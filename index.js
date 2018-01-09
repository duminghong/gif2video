var gifFrames = require('gif-frames');
var ffmpeg = require('fluent-ffmpeg');
var path = require('path');
var fs = require('fs');
var __url = file => path.resolve(__dirname, file);


var gif_url = 'gif/2.gif';
var file_name = gif_url.replace(/(.*\/)*([^.]+).*/ig,"$2");
var save_img = `img/${file_name}`;
if (!fs.existsSync(__url(save_img))){
    fs.mkdirSync(__url(save_img));
}
// 提取gif每一帧
gifFrames({ url: gif_url, frames: 'all' ,outputType: 'png', cumulative: true}).then(function (frameData) {
    var length = frameData.length;
    Promise.all(frameData.map(function(frame, index, input){
        var data = frame.getImage();
        var inx = frame.frameIndex;
        return new Promise(function (resolve, reject) {
            data.pipe(fs.createWriteStream(`${save_img}/img${inx}.png`).on('finish', function() {
                resolve()
            }).on('error', function(err){
                reject(err)
            }));
        })
    })).then(function(){
        console.log('gif逐帧提取完成')
        var def_time = Math.ceil(length/25);
        var time = def_time>10?10:def_time;

        /**
         * %d就是普通的输出了
         * %2d是将数字按宽度为2，采用右对齐方式输出，若数据位数不到2位，则左边补空格
         * %02d，和%2d差不多，只不过左边补0
         * 0.png 到 9.png, 或 00.png 到 99.png，或 000.png 到 999.png, 或 0000.png, 9999.png
         * 对应的参数为"img/%01~04d.png";
         */
        var proc = new ffmpeg({source: `${save_img}/img%d.png`});
        proc.videoCodec('mpeg4');   // 设置编码
        // proc.loop(time);              // 循环输入
        proc.fps(25);              // 设置输出帧率
        // proc.duration(10);          // 设置持续时间
        // proc.frames(length);        // 帧率

        // 进度
        proc.on('progress', function(progress) {
            console.log('生成进度: ' + progress.percent + '%');
        });

        // 处理完成
        proc.on('end', function(stdout, stderr) {
            console.log('视频生成完成');
        });
        proc.on('error', function(err) {
            console.log('生成错误: ' + err.message)
        })
        // 保存到文件
        proc.saveToFile(`video/${file_name}.mp4`);
    })
});
