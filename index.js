var gifFrames = require('gif-frames');
var ffmpeg = require('fluent-ffmpeg');
var path = require('path');
var fs = require('fs');

// 提取gif每一帧
gifFrames({ url: 'gif/1.gif', frames: 'all' ,outputType: 'png', cumulative: true}).then(function (frameData) {
	Promise.all(frameData.map(function(frame){
		var data = frame.getImage();
		var index = frame.frameIndex;
		return new Promise(function (resolve, reject) {
			data.pipe(fs.createWriteStream('img/1/img' + index + '.png').on('finish', function() {
				resolve()
			}).on('error', function(err){
				reject(err)
			}));
		})
	})).then(function(){
		console.log('gif逐帧提取完成')
		var proc = new ffmpeg({source: 'img/1/img%d.png'})
			.videoCodec('mpeg4')
			.withFps(10)
			.on('end', function(stdout, stderr) {
				console.log('视频生成完成');
			})
			.on('error', function(err) {
				console.log('生成错误: ' + err.message)
			})
			.saveToFile('video/1.mp4');
	})
});
